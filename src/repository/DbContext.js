const config = require('../services/config.json');
let dbConfig = config.knexConfig;
const fs = require('fs');
const knex = require('knex');

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
    const fileName = dbConfig.connection.filename;
    if (fs.existsSync(fileName)) {
        return knex(dbConfig);
    }
    dbConfig.connection.filename = '../' + fileName;
    return knex(dbConfig);
}