const config = require('./config.json');
const constants = config.constants;
const dbContext = require('../repository/DbContext');
const knex = dbContext.getKnexObject();

const Season = require(config.paths.seasonModel);

const stateServices = require(config.paths.stateServices);
const regionServices = require(config.paths.regionServices);
const tradeAgreementServices = require(config.paths.tradeAgreementServices);

/**
 * Advances the economy by one season.
 * Calculates the change in income and population of each state and region.
 * @returns {Boolean} true if successful, false otherwise.
 */
const advanceSeason = async () => {
    let resStatus = true;

    const states = await stateServices.getStateAll();

    if (states === null) resStatus = false;

    for (let state of states) {
        let seasonalIncome = state.TotalIncome;

        let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

        if (tradeAgreements != null) {
            for (let tradeAgreement of tradeAgreements) {
                for (let trader of tradeAgreement.traders) {
                    if (trader.state.stateID === state.stateID) {
                        seasonalIncome += trader.tradeValue;
                    }
                }
            }
        }

        let adminCost = await stateServices.getAdminCostByStateId(state.stateID);
        if (adminCost === -1) adminCost = 0;

        seasonalIncome -= state.expenses - adminCost;

        await stateServices.updateStateTreasuryByStateId(state.stateID, state.treasuryAmt + seasonalIncome);

        let stateRegions = state.regions;

        for (let stateRegion of stateRegions) {
            stateRegion.calculateGrowth(state.BaseGrowth, stateRegions.length);
            await regionServices.updateRegionPopulation(stateRegion);
        }
    }

    resStatus = await reduceActivationTimeAll();

    let currSeason = await getCurrentSeason();

    let season = '';
    let year = currSeason.year;

    switch (currSeason.season) {
        case 'Spring':
            season = 'Summer';
            break;
        case 'Summer':
            season = 'Autumn';
            break;
        case 'Autumn':
            season = 'Winter';
            break;
        case 'Winter':
            season = 'Spring';
            year++;
            break;
    }

    await knex
        .insert({
            season: season,
            year: year
        })
        .into(constants.TABLE_SEASON)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
};

const advanceSeasonByStateId = async (id) => {
    let resStatus = true;

    const state = await stateServices.getStateById(id);

    if (state === null) resStatus = false;

    let seasonalIncome = state.TotalIncome;

    let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

    if (tradeAgreements != null) {
        for (let tradeAgreement of tradeAgreements) {
            for (let trader of tradeAgreement.traders) {
                if (trader.state.stateID === state.stateID) {
                    seasonalIncome += trader.tradeValue;
                }
            }
        }
    }

    let adminCost = await stateServices.getAdminCostByStateId(state.stateID);
    if (adminCost === -1) adminCost = 0;

    seasonalIncome -= state.expenses - adminCost;

    await stateServices.updateStateTreasuryByStateId(state.stateID, state.treasuryAmt + seasonalIncome);

    let stateRegions = state.regions;

    for (let stateRegion of stateRegions) {
        stateRegion.calculateGrowth(state.BaseGrowth, stateRegions.length);
        await regionServices.updateRegionPopulation(stateRegion);
    }

    return resStatus;
};

/**
 * Reduces the activation time of all components by 1 if it's not 0.
 * @returns {Boolean} true if successful, false otherwise.
 */
const reduceActivationTimeAll = async () => {
    let resStatus = true;

    await knex(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_ACTIVATION_TIME, '>', 0)
        .decrement(constants.COLUMN_ACTIVATION_TIME, 1)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Gets the current season.
 * @returns {Season} season object if successful, null otherwise.
 */
const getCurrentSeason = async () => {
    let rawSeason = await knex
        .select('*')
        .from(constants.TABLE_SEASON)
        .orderBy(constants.COLUMN_SEASON_ID, 'desc')
        .limit(1)
        .catch(e => console.error(e));
    
    if (rawSeason.length === 0) return null;

    rawSeason = rawSeason[0];

    let season = new Season(rawSeason.season, rawSeason.year);

    return season;
}

exports.advanceSeason = advanceSeason;
exports.getCurrentSeason = getCurrentSeason;