/* eslint-disable import/no-dynamic-require, import/newline-after-import, no-console */

const config = require('./config.json');
const dbContext = require('../repository/DbContext');
const Season = require(config.paths.seasonModel);
const formulaHelper = require(config.paths.formulaHelper);
const seasonSnapshotServices = require('./seasonSnapshotServices');
const seasonAdvancementPersistenceServices = require('./seasonAdvancementPersistenceServices');
const seasonReportServices = require('./seasonReportServices');

const { constants } = config;
const knex = dbContext.getKnexObject();

const getNextSeason = (currentSeason) => {
  const seasons = {
    Spring: 'Summer',
    Summer: 'Autumn',
    Autumn: 'Winter',
    Winter: 'Spring',
  };
  return {
    season: seasons[currentSeason.season],
    year: currentSeason.year + (currentSeason.season === 'Winter' ? 1 : 0),
  };
};

const createSeasonAdvancementPlan = (snapshot) => {
  const treasuryUpdates = [];
  const populationUpdates = [];

  snapshot.states.forEach((state) => {
    treasuryUpdates.push({
      stateId: state.stateID,
      treasuryAmt: state.treasuryAmt + state.TotalIncome - state.expenses - state.adminCost,
    });
    state.regions.forEach((region) => {
      populationUpdates.push({
        regionId: region.regionId,
        population: Math.min(
          region.development.populationCap,
          region.population + region.expectedPopulationGrowth,
        ),
      });
    });
  });

  return { treasuryUpdates, populationUpdates };
};

const getCurrentSeason = async (executor = knex) => {
  const rawSeasons = await executor
    .select('*')
    .from(constants.TABLE_SEASON)
    .orderBy(constants.COLUMN_SEASON_ID, 'desc')
    .limit(1);

  if (rawSeasons.length === 0) return null;
  return new Season(rawSeasons[0].season, rawSeasons[0].year);
};

const advanceSeasonTransaction = async (trx) => {
  const rows = await seasonSnapshotServices.fetchSeasonAdvancementRows(trx);
  const initialSnapshot = seasonSnapshotServices.buildSeasonAdvancementSnapshot(rows);
  if (initialSnapshot.states.length === 0) return null;

  const currentSeason = await getCurrentSeason(trx);
  if (currentSeason === null) throw new Error('No current season exists.');

  const nextSeason = getNextSeason(currentSeason);
  const plan = createSeasonAdvancementPlan(initialSnapshot);
  const advancedSnapshot = seasonSnapshotServices.buildSeasonAdvancementSnapshot(
    seasonSnapshotServices.projectSeasonAdvancementRows(rows, plan),
  );
  await seasonAdvancementPersistenceServices.applySeasonAdvancementPlan(plan, nextSeason, trx);

  return {
    initialSnapshot,
    advancedSnapshot,
    previousSeason: [currentSeason.season, currentSeason.year],
    currentSeason: [nextSeason.season, nextSeason.year],
  };
};

const advanceSeason = async () => {
  let advancement;
  try {
    advancement = await knex.transaction(advanceSeasonTransaction);
  } catch (error) {
    console.error(error);
    return { advanced: false };
  }

  if (advancement === null) return { advanced: false };

  try {
    return {
      advanced: true,
      report: await seasonReportServices.generateSeasonReport(advancement),
    };
  } catch (error) {
    console.error(error);
    return { advanced: true, report: null, reportError: true };
  }
};

const getFormula = async (formulaName) => formulaHelper.parse(
  formulaHelper.getFormulaByKey(formulaName),
);

exports.advanceSeason = advanceSeason;
exports.getCurrentSeason = getCurrentSeason;
exports.getFormula = getFormula;
exports.getNextSeason = getNextSeason;
exports.createSeasonAdvancementPlan = createSeasonAdvancementPlan;
exports.advanceSeasonTransaction = advanceSeasonTransaction;
