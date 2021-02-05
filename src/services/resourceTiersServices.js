const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const ResourceTier = require(config.paths.resourceTierModel);
const Resource = require(config.paths.resourceModel);

const getResourceTierById = async function(id) {
    let rawResourceTier = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE_TIER)
        .where(constants.COLUMN_RESOURCE_TIER_ID, id);

    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .where(constants.COLUMN_RESOURCE_TIER_ID, id);

    let resourceTier = new ResourceTier(rawResourceTier.resourceTierId, rawResourceTier.name, rawResourceTier.tradePower);

    for (let rawResource of rawResources) {
        let resource = new Resource(rawResource.resourceId, rawResource.name, rawResource.resourceTierId);

        resourceTier.Resources.push(resource);
    }

    return resourceTier;
};

const getResourceTierAll = async function() {
    let rawResourceTiers = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE_TIER);

    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE);
    
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

const updateResourceTier = async function(resourceTier) {
    let updatePromises = [];

    let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
        .where({resourceTierId: resourceTier.ResourceTierID})
        .update({
            name: resourceTier.ResourceTierName,
            tradePower: resourceTier.ResourceTierTradePower
        });
    
    updatePromises.push(updateResourceTierPromise);

    for (let resource of resourceTier.Resources) {
        let updateResourcePromise = knex(constants.TABLE_RESOURCE)
            .where({resourceId: resource.ResourceID})
            .update({
                name: resource.ResourceName,
                resourceTierID: resource.ResourceTierID
            });
        
        updatePromises.push(updateResourcePromise);
    }

    await Promise.all(updatePromises)
    .catch(e => {
        console.log(e);
    });
}

const updateResourceTierAll = async function(resourceTiers) {
    let updatePromises = [];

    for (let resourceTier of resourceTiers) {
        let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
            .where({resourceTierId: resourceTier.ResourceTierID})
            .update({
                name: resourceTier.ResourceTierName,
                tradePower: resourceTier.ResourceTierTradePower
            });
        
        updatePromises.push(updateResourceTierPromise);

        for (let resource of resourceTier.Resources) {
            let updateResourcePromise = knex(constants.TABLE_RESOURCE)
                .where({resourceId: resource.ResourceID})
                .update({
                    name: resource.ResourceName,
                    resourceTierID: resource.ResourceTierID
                });
            
            updatePromises.push(updateResourcePromise);
        }
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.log(e);
        });
};

const addResource = async function(resource) {
    await knex
        .insert({name: resource.ResourceName, resourceTierID: resource.ResourceTierID})
        .into(constants.TABLE_RESOURCE);
};

const updateResource = async function(resource) {
    await knex(constants.TABLE_RESOURCE)
        .where({resourceId: resource.ResourceID})
        .update({
            name: resource.ResourceName,
            resourceTierId: resource.ResourceTierID
        });
}

const updateResourceAll = async function(resources) {
    let updatePromises = [];

    for (let resource of resources) {
        let updatePromise = knex(constants.TABLE_RESOURCE)
            .where({resourceId: resource.ResourceID})
            .update({
                name: resource.ResourceName,
                resourceTierId: resource.ResourceTierID
            });

        updatePromises.push(updatePromise);
    }

    await Promise.all(updatePromises)
        .catch(e => console.log(e));
}

const deleteResourceById = async function(id) {
    await knex(constants.TABLE_RESOURCE)
        .where({resourceId: id})
        .del();
}

exports.getResourceTierById = getResourceTierById;
exports.getResourceTierAll = getResourceTierAll;
exports.updateResourceTier = updateResourceTier;
exports.updateResourceTierAll = updateResourceTierAll;
exports.addResource = addResource;
exports.updateResource = updateResource;
exports.updateResourceAll = updateResourceAll;
exports.deleteResourceById = deleteResourceById;

// FOR DEBUGGING
// getResourceTierAll()
//     .then(data => console.log(data));