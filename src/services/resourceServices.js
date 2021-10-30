const config = require('./config.json');
const constants = config.constants;
const dbContext = require('../repository/DbContext');
const knex = dbContext.getKnexObject();

const ResourceTier = require(config.paths.resourceTierModel);
const Resource = require(config.paths.resourceModel);

/**
 * Gets a resource of a given ID.
 * @param {Number} id must be an integer.
 * @returns {ResourceTier} ResourceTier object if successful, null otherwise. 
 */
const getResourceTierById = async function (id) {
    let rawResourceTier = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE_TIER)
        .where(constants.COLUMN_RESOURCE_TIER_ID, id)
        .catch(e => {
            console.error(e);
        });

    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .where(constants.COLUMN_RESOURCE_TIER_ID, id)
        .catch(e => {
            console.error(e);
        });

    if (rawResourceTier.length === 0 || rawResources.length === 0) return null;

    rawResourceTier = rawResourceTier[0];

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
const getResourceTierAll = async function () {
    let rawResourceTiers = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE_TIER)
        .catch(e => {
            console.error(e);
        });

    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .catch(e => {
            console.error(e);
        });

    if (rawResourceTiers.length === 0) return null;

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
 * Get All resources inside a state by given state id
 * 
 * Resource object also contains total of how many such resource's components in that state 
 * and also how many of them are productive (assigned to a functional facility).
 * @param {Number} stateId
 * @returns {Resource[]} Array of resource objects if successful, null otherwise
 */
const getAllResourcesByStateId = async function (stateId) {
    let resourceIdWithFunctionals = await knex
        .from(constants.TABLE_COMPONENT)
        .join
        (
            constants.TABLE_REGION,
            constants.TABLE_COMPONENT + '.' + constants.COLUMN_REGION_ID,
            '=',
            constants.TABLE_REGION + '.' + constants.COLUMN_REGION_ID
        )
        .leftJoin
        (
            constants.TABLE_FACILITY,
            constants.TABLE_COMPONENT + '.' + constants.COLUMN_FACILITY_ID,
            '=',
            constants.TABLE_FACILITY + '.' + constants.COLUMN_FACILITY_ID,
        )
        .where(constants.COLUMN_COMPONENT_TYPE_ID, 3)
        .where(constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID, stateId)
        .select(constants.COLUMN_COMPONENT_VALUE, constants.COLUMN_IS_FUNCTIONAL)
        .catch(e => {
            console.error(e);
        });

    if (resourceIdWithFunctionals.length === 0) return null;

    let resourceWithProductiveCountDict = {};
    resourceIdWithFunctionals.forEach(resource => {
        let resourceId = resource.value.split(';')[1];
        if (!(resourceId in resourceWithProductiveCountDict)) {
            resourceWithProductiveCountDict[resourceId] = {
                countAll: 0,
                countProductive: 0
            };
        }
        resourceWithProductiveCountDict[resourceId].countAll++;
        if (resource.isFunctional !== null && resource.isFunctional === 1) {
            resourceWithProductiveCountDict[resourceId].countProductive++;
        }
    });

    let resources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .whereIn(constants.COLUMN_RESOURCE_ID, Object.keys(resourceWithProductiveCountDict))
        .catch(e => {
            console.error(e);
        });

    if (resources.length != Object.keys(resourceWithProductiveCountDict).length) 
        throw "Resource's component type count does not match with resource count at MsResource";

    let results = [];
    for (let resource of resources) {
        // let resourceInfo = new Resource(resource.resourceId, resource.name, resource.resourceTierId)
        // results.push(resourceInfo);
        
        results.push({
            ResourceID: resource.resourceId,
            ResourceName: resource.name,
            ResourceTierID: resource.resourceTierId,
            CountAll: resourceWithProductiveCountDict[resource.resourceId].countAll,
            CountProductive: resourceWithProductiveCountDict[resource.resourceId].countProductive
        });
    }
    return results;
}

/**
 * Updates a resource tier.
 * @param {ResourceTier} resourceTier must be a resource tier object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateResourceTier = async function (resourceTier) {
    let resStatus = true;

    let updatePromises = [];

    let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
        .where({ resourceTierId: resourceTier.ResourceTierID })
        .update({
            name: resourceTier.ResourceTierName,
            tradePower: resourceTier.ResourceTierTradePower
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    updatePromises.push(updateResourceTierPromise);

    for (let resource of resourceTier.Resources) {
        let updateResourcePromise = knex(constants.TABLE_RESOURCE)
            .where({ resourceId: resource.ResourceID })
            .update({
                name: resource.ResourceName,
                resourceTierID: resource.ResourceTierID
            })
            .catch(e => {
                console.error(e);
                resStatus = false;
            });

        updatePromises.push(updateResourcePromise);
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Updates all resource tiers.
 * @param {Array} resourceTiers must be an array of resource tier objects.
 * @returns {Boolean} true if successful, null otherwise.
 */
const updateResourceTierAll = async function (resourceTiers) {
    let resStatus = true;

    let updatePromises = [];

    for (let resourceTier of resourceTiers) {
        let updateResourceTierPromise = knex(constants.TABLE_RESOURCE_TIER)
            .where({ resourceTierId: resourceTier.ResourceTierID })
            .update({
                name: resourceTier.ResourceTierName,
                tradePower: resourceTier.ResourceTierTradePower
            })
            .catch(e => {
                console.error(e);
                resStatus = false;
            });

        updatePromises.push(updateResourceTierPromise);

        for (let resource of resourceTier.Resources) {
            let updateResourcePromise = knex(constants.TABLE_RESOURCE)
                .where({ resourceId: resource.ResourceID })
                .update({
                    name: resource.ResourceName,
                    resourceTierID: resource.ResourceTierID
                })
                .catch(e => {
                    console.error(e);
                    resStatus = false;
                });

            updatePromises.push(updateResourcePromise);
        }
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
};

/**
 * Gets all resources.
 * @returns {Array} array of resource objects if successful, null otherwise.
 */
const getResourceAll = async () => {
    let rawResources = await knex
        .select('*')
        .from(constants.TABLE_RESOURCE)
        .catch(e => {
            console.error(e);
        });

    if (rawResources.length === 0) return null;

    let resources = [];

    for (let rawResource of rawResources) {
        let resource = new Resource(rawResource.resourceId, rawResource.name, rawResource.resourceTierId);

        resources.push(resource);
    }

    return resources;
}

/**
 * Creates a new resource.
 * @param {String} name must be a string.
 * @param {Number} resourceTierId must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addResource = async function (name, resourceTierId) {
    let resStatus = true;

    await knex
        .insert({ name: name, resourceTierId: resourceTierId })
        .into(constants.TABLE_RESOURCE)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
};

/**
 * Updates a resource.
 * @param {Resource} resource must be a resource object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateResource = async function (resource) {
    let resStatus = true;

    await knex(constants.TABLE_RESOURCE)
        .where({ resourceId: resource.ResourceID })
        .update({
            name: resource.ResourceName,
            resourceTierId: resource.ResourceTierID
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Updates all resources.
 * @param {Array} resources must be an array of resource objects.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateResourceAll = async function (resources) {
    let resStatus = true;
    let updatePromises = [];

    for (let resource of resources) {
        let updatePromise = knex(constants.TABLE_RESOURCE)
            .where({ resourceId: resource.ResourceID })
            .update({
                name: resource.ResourceName,
                resourceTierId: resource.ResourceTierID
            })
            .catch(e => {
                console.error(e);
                resStatus = false;
            });

        updatePromises.push(updatePromise);
    }

    await Promise.all(updatePromises)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Deletes the resource of a given ID. Will fail if there are components that use the resource.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteResourceById = async function (id) {
    let resStatus = true;

    let isUsed = await knex
        .select(1)
        .from(constants.TABLE_COMPONENT)
        .where({
            componentTypeId: 3,
            value: `i;${id}`
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        })

    if (isUsed.length !== 0) {
        resStatus = false;
    } else {
        await knex(constants.TABLE_RESOURCE)
            .where({ resourceId: id })
            .del()
            .catch(e => {
                console.error(e);
                resStatus = false;
            });
    }

    return resStatus;
}

exports.getResourceTierById = getResourceTierById;
exports.getResourceTierAll = getResourceTierAll;
exports.getAllResourcesByStateId = getAllResourcesByStateId;
exports.updateResourceTier = updateResourceTier;
exports.updateResourceTierAll = updateResourceTierAll;
exports.getResourceAll = getResourceAll;
exports.addResource = addResource;
exports.updateResource = updateResource;
exports.updateResourceAll = updateResourceAll;
exports.deleteResourceById = deleteResourceById;

// FOR DEBUGGING
// getResourceTierAll()
//     .then(data => console.log(data));
// getResourceTierById(1)
//     .then(data => console.log(data));
// addResource(1)
//     .then(data => console.log(data));
// deleteResourceById(24)
//     .then(data => console.log(data));