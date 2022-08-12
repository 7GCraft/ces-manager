const config = require('../services/config.json');
let dbConfig = config.knexConfig;
const fs = require('fs');
const knex = require('knex');

const getKnexObject = (ENV = config.environment.name.Production) => {
    if (dbConfig.client === 'sqlite3') {
        return getSqliteKnexObject(ENV);
    }
}

module.exports = {
    getKnexObject
}

/**
 * Get knex object with sqlite client
 */
function getSqliteKnexObject(ENV) {
    const filename = (ENV == config.environment.name.Test) ? 
        config.sqlite_config.test_db : 
        config.sqlite_config.production_db;
    const filepaths = config.sqlite_config.filepath;
    for (let filepath of filepaths) {
        const fullFilePath = filepath + filename;
        if (fs.existsSync(fullFilePath)) {
            dbConfig.connection.filename = fullFilePath;
            return knex(dbConfig);
        }
    }
}