const path = require('path');
const ResourceTier = require('../models/resourceTierModel')
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: '../../db/ces.db'
    }
});

const getAllResourceTiers = async function() {
    let rawResourceTiers = await knex.select('*').from('ResourceTier')
    
    let resourceTiers = [];

    for (let rawResourceTier of rawResourceTiers) {
        let resourceTier = new ResourceTier(rawResourceTier.resourceTierId, rawResourceTier.name, rawResourceTier.tradePower);

        resourceTiers.push(resourceTier);
    }

    return resourceTiers;
};

const getResourceTier = async function(id) {
    let rawResourceTier = await knex.select('*').from('ResourceTier').where('resourceTierId', id);

    let resourceTier = new ResourceTier(rawResourceTier.resourceTierId, rawResourceTier.name, rawResourceTier.tradePower);

    return resourceTier;
}

exports.getAllResourceTiers = getAllResourceTiers;
exports.getResourceTier = getResourceTier;