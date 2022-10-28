const fs = require('fs');
const knex = require('knex');

const config = require('../services/config.json');

const dbConfig = config.knexConfig;

/**
 * Get knex object with sqlite client
 */
function getSqliteKnexObject(ENV) {
  const filename = (ENV === config.environment.name.Test)
    ? config.sqlite_config.test_db
    : config.sqlite_config.production_db;
  const filepaths = config.sqlite_config.filepath;

  filepaths.forEach((filepath) => {
    const fullFilePath = filepath + filename;

    if (fs.existsSync(fullFilePath)) {
      dbConfig.connection.filename = fullFilePath;

      return knex(dbConfig);
    }

    return null;
  });

  return new Error('Cannot get SQLite Knex object.');
}

const getKnexObject = (ENV = config.environment.name.Production) => {
  if (dbConfig.client === 'sqlite3') {
    return getSqliteKnexObject(ENV);
  }

  return new Error('Database is not SQLite 3.');
};

module.exports = {
  getKnexObject,
};
