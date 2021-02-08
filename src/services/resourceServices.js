const config = require('./config.json');
const constants = config.constants;
const errors = config.errors;
const knex = require('knex')(config.knexConfig);

const ResourceTier = require(config.paths.resourceTierModel);
const Resource = require(config.paths.resourceModel);

/**
 * Gets a resource of a given ID.
 * @param {Number} id must be an integer.
 * @returns {ResourceTier} ResourceTier object if successful, null otherwise. 
 */
const getResourceTierById = async function(id) {
    let rawResourceTier = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE_TIER)
        .where(constants.COLUMN_RESOURCE_TIER_ID, id)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });

    rawResourceTier = rawResourceTier[0];

    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .where(constants.COLUMN_RESOURCE_TIER_ID, id)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });

    let resourceTier = new ResourceTier(rawResourceTier.resourceTierId, rawResourceTier.name, rawResourceTier.tradePower, []);

    for (let rawResource of rawResources) {
        let resource = new Resource(rawResource.resourceId, rawResource.name, rawResource.resourceTierId);

        resourceTier.Resources.push(resource);
    }

    return resourceTier;
};

/**
 * Gets all resource tiers.
 * @returns {Array} Array of resource tier objects if successful, null otherwise.
 */
const getResourceTierAll = async function() {
    let rawResourceTiers = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE_TIER)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });

    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });
    
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

/**
 * Updates a resource tier.
 * @param {ResourceTier} resourceTier must be a resource tier object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateResourceTier = async function(resourceTier) {
    let updatePromises = [];

    let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
        .where({resourceTierId: resourceTier.ResourceTierID})
        .update({
            name: resourceTier.ResourceTierName,
            tradePower: resourceTier.ResourceTierTradePower
        })
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });
    
    updatePromises.push(updateResourceTierPromise);

    for (let resource of resourceTier.Resources) {
        let updateResourcePromise = knex(constants.TABLE_RESOURCE)
            .where({resourceId: resource.ResourceID})
            .update({
                name: resource.ResourceName,
                resourceTierID: resource.ResourceTierID
            })
            .catch(e => {
                console.log(errors.queryError, '\n', e);
                return false;
            });
        
        updatePromises.push(updateResourcePromise);
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });

    return true;
}

/**
 * Updates all resource tiers.
 * @param {Array} resourceTiers must be an array of resource tier objects.
 * @returns {Boolean} true if successful, null otherwise.
 */
const updateResourceTierAll = async function(resourceTiers) {
    let updatePromises = [];

    for (let resourceTier of resourceTiers) {
        let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
            .where({resourceTierId: resourceTier.ResourceTierID})
            .update({
                name: resourceTier.ResourceTierName,
                tradePower: resourceTier.ResourceTierTradePower
            })
            .catch(e => {
                console.log(errors.queryError, '\n', e);
                return false;
            });
        
        updatePromises.push(updateResourceTierPromise);

        for (let resource of resourceTier.Resources) {
            let updateResourcePromise = knex(constants.TABLE_RESOURCE)
                .where({resourceId: resource.ResourceID})
                .update({
                    name: resource.ResourceName,
                    resourceTierID: resource.ResourceTierID
                })
                .catch(e => {
                    console.log(errors.queryError, '\n', e);
                    return false;
                });
            
            updatePromises.push(updateResourcePromise);
        }
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });
    
    return true;
};

/**
 * Creates a new resource.
 * @param {String} name must be a string.
 * @param {Number} resourceTierId must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addResource = async function(name, resourceTierId) {
    await knex
        .insert({name: name, resourceTierId: resourceTierId})
        .into(constants.TABLE_RESOURCE)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });
    
    return true;
};

/**
 * Updates a resource.
 * @param {Resource} resource must be a resource object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateResource = async function(resource) {
    await knex(constants.TABLE_RESOURCE)
        .where({resourceId: resource.ResourceID})
        .update({
            name: resource.ResourceName,
            resourceTierId: resource.ResourceTierID
        })
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });
    
    return true;
}

/**
 * Updates all resources.
 * @param {Array} resources must be an array of resource objects.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateResourceAll = async function(resources) {
    let updatePromises = [];

    for (let resource of resources) {
        let updatePromise = knex(constants.TABLE_RESOURCE)
            .where({resourceId: resource.ResourceID})
            .update({
                name: resource.ResourceName,
                resourceTierId: resource.ResourceTierID
            })
            .catch(e => {
                console.log(errors.queryError, '\n', e);
                return false;
            });

        updatePromises.push(updatePromise);
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });

    return true;
}

/**
 * Deletes the resource of a given ID.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteResourceById = async function(id) {
    await knex(constants.TABLE_RESOURCE)
        .where({resourceId: id})
        .del()
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });
    
    return true;
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
// getResourceTierById(1)
//     .then(data => console.log(data));