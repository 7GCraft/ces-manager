const config = require('../services/config.json');
const dbConfig = config.knexConfig;
const fs = require('fs');
const knex = require('knex');
let knexInstance;

const getKnexObject = () => {
    if (dbConfig.client === 'sqlite3') {
        return getSqliteKnexObject();
    }
}

module.exports = {
    getKnexObject
}

/**
 * Get knex object with sqlite client
 */
function getSqliteKnexObject() {
    if (knexInstance) return knexInstance;

    const filepaths = config.sqlite_config.filepath;
    for (let filepath of filepaths) {
        if (fs.existsSync(filepath)) {
            dbConfig.connection.filename = filepath;
            knexInstance = knex(dbConfig);
            return knexInstance;
        }
    }
}
