/* eslint-env jest */

const fs = require('fs');
const os = require('os');
const path = require('path');
const createKnex = require('knex');

const { applySeasonAdvancementPlan } = require('../src/services/seasonAdvancementPersistenceServices');

describe('applySeasonAdvancementPlan transaction integration', () => {
  let database;
  let databasePath;

  beforeEach(async () => {
    databasePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ces-season-')), 'season.db');
    database = createKnex({ client: 'sqlite3', connection: { filename: databasePath }, useNullAsDefault: true });

    await database.schema.createTable('MsState', (table) => {
      table.integer('stateId').primary();
      table.float('treasuryAmt');
    });
    await database.schema.createTable('MsRegion', (table) => {
      table.integer('regionId').primary();
      table.float('population');
    });
    await database.schema.createTable('MsComponent', (table) => {
      table.integer('componentId').primary();
      table.integer('activationTime');
    });
    await database.schema.createTable('MsSeason', (table) => {
      table.increments('seasonId').primary();
      table.string('season');
      table.integer('year');
    });
    await database('MsState').insert({ stateId: 1, treasuryAmt: 1000 });
    await database('MsRegion').insert({ regionId: 10, population: 8 });
    await database('MsComponent').insert([{ componentId: 1, activationTime: 2 }, { componentId: 2, activationTime: 0 }]);
  });

  afterEach(async () => {
    await database.destroy();
    fs.unlinkSync(databasePath);
    fs.rmdirSync(path.dirname(databasePath));
  });

  it('rolls back every seasonal write when a later transaction operation fails', async () => {
    await expect(database.transaction(async (trx) => {
      await applySeasonAdvancementPlan({
        treasuryUpdates: [{ stateId: 1, treasuryAmt: 1070 }],
        populationUpdates: [{ regionId: 10, population: 10 }],
      }, { season: 'Summer', year: 12 }, trx);
      throw new Error('report snapshot failed');
    })).rejects.toThrow('report snapshot failed');

    await expect(database('MsState').where({ stateId: 1 }).first()).resolves.toMatchObject({ treasuryAmt: 1000 });
    await expect(database('MsRegion').where({ regionId: 10 }).first()).resolves.toMatchObject({ population: 8 });
    await expect(database('MsComponent').where({ componentId: 1 }).first()).resolves.toMatchObject({ activationTime: 2 });
    await expect(database('MsComponent').where({ componentId: 2 }).first()).resolves.toMatchObject({ activationTime: 0 });
    await expect(database('MsSeason')).resolves.toHaveLength(0);
  });
});
