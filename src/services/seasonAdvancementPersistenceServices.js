const config = require('./config.json');

const { constants } = config;
const MAX_BATCH_SIZE = 300;

const updateValuesById = async (table, idColumn, valueColumn, updates, executor) => {
  const queries = [];

  for (let index = 0; index < updates.length; index += MAX_BATCH_SIZE) {
    const batch = updates.slice(index, index + MAX_BATCH_SIZE);
    const caseStatements = batch.map(() => 'WHEN ? THEN ?').join(' ');
    const idPlaceholders = batch.map(() => '?').join(', ');
    const bindings = [table, valueColumn, idColumn];

    batch.forEach((update) => {
      bindings.push(update[idColumn], update[valueColumn]);
    });
    bindings.push(idColumn, ...batch.map((update) => update[idColumn]));

    queries.push(executor.raw(
      `UPDATE ?? SET ?? = CASE ?? ${caseStatements} END WHERE ?? IN (${idPlaceholders})`,
      bindings,
    ));
  }

  await Promise.all(queries);
};

const applySeasonAdvancementPlan = async (plan, nextSeason, executor) => {
  await updateValuesById(
    constants.TABLE_STATE,
    constants.COLUMN_STATE_ID,
    constants.COLUMN_TREASURY_AMT,
    plan.treasuryUpdates,
    executor,
  );
  await updateValuesById(
    constants.TABLE_REGION,
    constants.COLUMN_REGION_ID,
    constants.COLUMN_POPULATION,
    plan.populationUpdates,
    executor,
  );
  await executor(constants.TABLE_COMPONENT)
    .where(constants.COLUMN_ACTIVATION_TIME, '>', 0)
    .decrement(constants.COLUMN_ACTIVATION_TIME, 1);
  await executor.insert(nextSeason).into(constants.TABLE_SEASON);
};

exports.applySeasonAdvancementPlan = applySeasonAdvancementPlan;
