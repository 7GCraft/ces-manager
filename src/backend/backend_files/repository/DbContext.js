const config = require('../services/config.json');
let dbConfig = config.knexConfig;
const fs = require('fs');
const knex = require('knex');
const path = require('path');

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
    const filepaths = config.sqlite_config.filepath;
    for (let filepath of filepaths) {
        filepath = path.resolve(__dirname, filepath);
        if (fs.existsSync(filepath)) {
            dbConfig.connection.filename = filepath;
            return knex(dbConfig);
        }
    }
}