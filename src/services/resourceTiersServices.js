const path = require('path');
const ResourceTier = require('../models/resourceTierModel');
const Resource = require('../models/resourceModel')
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: 'db/ces.db'
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

// const getResourceTier = async function(id) {
//     let rawResourceTier = await knex.select('*').from('ResourceTier').where('resourceTierId', id);

//     let resourceTier = new ResourceTier(rawResourceTier.resourceTierId, rawResourceTier.name, rawResourceTier.tradePower);

//     return resourceTier;
// }

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

    // let rawResources = await knex.select('Resource.resourceId', 'Resource.name as resourceName', 'Resource.resourceTierId', 'ResourceTier.name as resourceTierName', 'ResourceTier.tradePower').from('Resource').leftJoin('ResourceTier', 'Resource.resourceTierId', 'ResourceTier.resourceTierId');

    // console.log(rawResources);
    //console.info(resourceTiers);
    return resourceTiers;
};

exports.getAllResourceTiers = getResourceTiers;
// exports.getResourceTier = getResourceTier;

// getResourceTiers();