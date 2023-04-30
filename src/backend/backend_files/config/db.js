const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: '../../db/ces.sqlite'
    },
});

module.exports = knex;