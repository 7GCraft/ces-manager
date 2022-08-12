const fs = require('fs');
const config = require('../../services/config.json');
const constants = config.constants;
const dbContext = require('../../repository/DbContext');

const DB_SCHEMA_FILE_PATH = 'db/ces-schema_only.db';
const TEST_DB_FILE_PATH = 'db/ces.test.db';

function createTestDBConnection() {
    if (!fs.existsSync(TEST_DB_FILE_PATH)) {
        fs.copyFileSync(DB_SCHEMA_FILE_PATH, TEST_DB_FILE_PATH);
    }
    return dbContext.getKnexObject(config.environment.name.Test);
}

async function dropTestDB() {
    if (fs.existsSync(TEST_DB_FILE_PATH)) {
        fs.unlinkSync(TEST_DB_FILE_PATH);
    }
}

/**
 * Clear all records from tables and reset their autoincrement with the options to exclude some tables or only inlude some tables.
 * Be mindful of what tables to be excluded and their levels (check the comments inside this method).
 * @param {Knex} knex database knex object
 * @param {Array} includedTables Tables that are needed to be deleted without deleting others.
 * Mutually exclusive with excludedTables parameter.
 * @param {Array} excludedTables Tables that are excluded from being cleared.
 * Be mindful of FK dependendy of the tables to be excluded.
 * Mutually exclusive with includedTables parameter.
 */
async function resetTables(knex, includedTables = [], excludedTables = []) {
    // This array is ordered from tables that is not being depended on to most depended tables
    // Deeper level tables depend on the tables above their level(s)
    let deletedTables = [
        // LEVEL 3
        constants.TABLE_FACILITY,
        // LEVEL 2
        constants.TABLE_COMPONENT,
        constants.TABLE_TRADE_AGREEMENT_DETAIL,
        // LEVEL 1
        constants.TABLE_REGION,
        constants.TABLE_RESOURCE,
        // LEVEL 0
        constants.TABLE_STATE,
        constants.TABLE_RESOURCE_TIER,
        constants.TABLE_TRADE_AGREEMENT_HEADER,
        constants.TABLE_CORRUPTION,
        constants.TABLE_DEVELOPMENT,
        constants.TABLE_BIOME,
        constants.TABLE_COMPONENT_TYPE,
        constants.TABLE_SEASON
    ];

    if (includedTables.length > 0) {
        deletedTables = deletedTables.filter(table => {
            return includedTables.includes(table);
        });
    }
    
    if (excludedTables.length > 0) {
        deletedTables = deletedTables.filter(table => {
            return !(excludedTables.includes(table));
        });
    }
    
    deletedTables.forEach(async (table) => {
        await knex(table).del().then(res => {
            // console.log(`DELETE TEST TABLE ${table} res`, res);
        }).catch(e => {
            console.error(e);
        });
    });

    await knex(constants.TABLE_SQLITE_SEQUENCE)
        .whereIn('name', deletedTables)
        .update('seq', 0);
}

module.exports = {
    createTestDBConnection,
    dropTestDB,
    resetTables
}