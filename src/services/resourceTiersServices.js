const path = require('path');
const ResourceTier = require('../models/resourceTierModel');
const Resource = require('../models/resourceModel')
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: 'db/ces.db'
    }
});

const getResourceTiers = async function() {
    let rawResourceTiers = await knex.select('*').from('ResourceTier');

    let rawResources = await knex.select('*').from('Resource');
    
    let resourceTiers = [];

    for (let rawResourceTier of rawResourceTiers) {
        let resources = [];
        let resourceTier = new ResourceTier(rawResourceTier.resourceTierId, rawResourceTier.name, rawResourceTier.tradePower, resources);

        resourceTiers.push(resourceTier);
    }

    for (let rawResource of rawResources) {
        let resource = new Resource(rawResource.resourceId, rawResource.name, rawResource.resourceTierId);

        resourceTiers[resource.ResourceTierID - 1].Resources.push(resource);
    }

    return resourceTiers;
};

exports.getResourceTiers = getResourceTiers;