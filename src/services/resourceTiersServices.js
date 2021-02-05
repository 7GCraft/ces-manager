const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const ResourceTier = require('../models/resourceTierModel');
const Resource = require('../models/resourceModel')

const getResourceTiers = async function() {
    let rawResourceTiers = await knex.select('*').from(constants.TABLE_RESOURCE_TIER);

    let rawResources = await knex.select('*').from(constants.TABLE_RESOURCE);
    
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

const updateResourceTiers = async function(resourceTiers) {
    let updatePromises = [];

    for (let resourceTier of resourceTiers) {
        let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
            .where({resourceTierId: resourceTier.ResourceTierID})
            .update({
                resourceTierId: undefined,
                name: resourceTier.ResourceTierName,
                tradePower: resourceTier.ResourceTierTradePower
            });
        
        updatePromises.push(updateResourceTierPromise);

        for (let resource of resourceTier.Resources) {
            let updateResourcePromise = knex(constants.TABLE_RESOURCE)
                .where({resourceId: resource.ResourceID})
                .update({
                    resourceId: undefined,
                    name: resource.ResourceName,
                    resourceTierID: resource.ResourceTierID
                });
            
            updatePromises.push(updateResourcePromise);
        }
    }

    await Promise.all(updatePromises)
        .catch((e) => {
            console.log(e);
        });
};

const addResource = async function(resource) {
    let resourceName = resource.ResourceName;
    let resourceTierID = resource.ResourceTierID;

    await knex.insert({name: resourceName, resourceTierID: resourceTierID}).into(constants.TABLE_RESOURCE);
};

exports.getResourceTiers = getResourceTiers;
exports.updateResourceTiers = updateResourceTiers;
exports.addResource = addResource;

// FOR DEBUGGING
// getResourceTiers()
//     .then(data => console.log(data));