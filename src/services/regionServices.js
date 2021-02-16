const config = require('./config.json');
const constants = config.constants;
const facilityServices = require(config.paths.facilityServices);
const knex = require('knex')(config.knexConfig);

const RegionListItem = require(config.paths.regionListItemModel);
const Region = require(config.paths.regionModel);
const Biome = require(config.paths.biomeModel);
const Corruption = require(config.paths.corruptionModel);
const Development = require(config.paths.developmentModel);
const State = require(config.paths.stateModel);

/**
 * Gets a list of region IDs, names, total income, and total food.
 * @returns {Array} Array of region list item objects if successful, null otherwise.
 */
const getRegionListAll = async () => {
    let rawRegions = await knex
        .select([
            constants.COLUMN_REGION_ID,
            constants.TABLE_REGION + '.' + constants.COLUMN_NAME,
            constants.TABLE_STATE + '.' + constants.COLUMN_NAME + ' AS state'
        ])
        .from(constants.TABLE_REGION)
        .leftJoin(
            constants.TABLE_STATE,
            constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID,
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID
        )
        .catch(e => {
            console.error(e);
        });
    
    if (rawRegions.length === 0) return null;

    let regionList = [];

    for (let rawRegion of rawRegions) {
        let facilities = await facilityServices.getFacilityByRegionId(rawRegion.regionId);

        let foodOutput = 0;
        let moneyOutput = 0;

        if (facilities !== null) {
            for (let facility of facilities) {
                foodOutput += facility.foodOutput;
                moneyOutput += facility.moneyOutput;
            }
        }

        let regionListItem = new RegionListItem (
            rawRegion.regionId,
            rawRegion.name,
            moneyOutput,
            foodOutput,
            rawRegion.state
        );

        regionList.push(regionListItem);
    }

    return regionList;
}

/**
 * Gets a list of region IDs, names, total income, and total food of a given state.
 * @param {Number} stateId must be an integer.
 * @returns {Array} Array of region list item objects if successful, null otherwise.
 */
const getRegionListByStateId = async (stateId) => {
    let rawRegions = await knex
        .select([
            constants.COLUMN_REGION_ID,
            constants.TABLE_REGION + '.' + constants.COLUMN_NAME,
            constants.TABLE_STATE + '.' + constants.COLUMN_NAME + ' AS state'
        ])
        .from(constants.TABLE_REGION)
        .where(constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID, stateId)
        .leftJoin(
            constants.TABLE_STATE,
            constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID,
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID
        )
        .catch(e => {
            console.error(e);
        });
    
    if (rawRegions.length === 0) return null;
    
    let regionList = [];

    for (let rawRegion of rawRegions) {
        let facilities = await facilityServices.getFacilityByRegionId(rawRegion.regionId);

        let foodOutput = 0;
        let moneyOutput = 0;

        if (facilities !== null) {
            for (let facility of facilities) {
                foodOutput += facility.foodOutput;
                moneyOutput += facility.moneyOutput;
            }
        }

        let regionListItem = new RegionListItem (
            rawRegion.regionId,
            rawRegion.name,
            moneyOutput,
            foodOutput,
            rawRegion.state
        );

        regionList.push(regionListItem);
    }

    return regionList;
}

/**
 * Gets all regions of a given state.
 * @param {Number} id must be an integer.
 * @returns {Array} array of region objects if successful, null otherwise.
 */
const getRegionByStateId = async (id) => {
    let rawRegions = await knex
        .select([
            constants.TABLE_REGION + '.' + constants.COLUMN_REGION_ID,
            constants.TABLE_REGION + '.' + constants.COLUMN_NAME + ' AS regionName',
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID + ' AS stateId',
            constants.TABLE_STATE + '.' + constants.COLUMN_NAME + ' AS stateName',
            constants.TABLE_STATE + '.' + constants.COLUMN_TREASURY_AMT,
            constants.TABLE_STATE + '.' + constants.COLUMN_DESC + ' AS stateDesc',
            constants.TABLE_STATE + '.' + constants.COLUMN_EXPENSES + ' AS stateExpenses',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_CORRUPTION_ID + ' AS corruptionId',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_NAME + ' AS corruptionName',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_RATE + ' AS corruptionRate',
            constants.TABLE_BIOME + '.' + constants.COLUMN_BIOME_ID + ' AS biomeId',
            constants.TABLE_BIOME + '.' + constants.COLUMN_NAME + ' AS biomeName',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_DEVELOPMENT_ID + ' AS developmentId',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_NAME + ' AS developmentName',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_POPULATION_CAP,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_MILITARY_TIER,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_GROWTH_MODIFIER,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_SHRINKAGE_MODIFIER,
            constants.TABLE_REGION + '.' + constants.COLUMN_POPULATION,
            constants.TABLE_REGION + '.' + constants.COLUMN_DESC + ' AS regionDesc'
        ])
        .from(constants.TABLE_REGION)
        .where(constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID, id)
        .leftJoin(
            constants.TABLE_STATE,
            constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID,
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID
        )
        .leftJoin(
            constants.TABLE_CORRUPTION,
            constants.TABLE_REGION + '.' + constants.COLUMN_CORRUPTION_ID,
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_CORRUPTION_ID
        )
        .leftJoin(
            constants.TABLE_BIOME,
            constants.TABLE_REGION +  '.' + constants.COLUMN_BIOME_ID,
            constants.TABLE_BIOME + '.' + constants.COLUMN_BIOME_ID
        )
        .leftJoin(
            constants.TABLE_DEVELOPMENT,
            constants.TABLE_REGION +  '.' + constants.COLUMN_DEVELOPMENT_ID,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_DEVELOPMENT_ID
        )
        .catch(e => {
            console.error(e);
        });
    
    if (rawRegions.length === null) return null;

    let regions = [];

    for (let rawRegion of rawRegions) {
        let region = new Region(
            rawRegion.regionId,
            rawRegion.regionName,
            new State(
                rawRegion.stateId,
                rawRegion.stateName,
                rawRegion.treasuryAmt,
                rawRegion.stateDesc,
                rawRegion.stateExpenses
            ),
            new Biome(rawRegion.biomeId, rawRegion.biomeName),
            {
                development: new Development(
                    rawRegion.developmentId,
                    rawRegion.developmentName,
                    rawRegion.populationCap,
                    rawRegion.militaryTier,
                    rawRegion.growthModifier,
                    rawRegion.shrinkageModifier
                ),
                population: rawRegion.population,
                corruption: new Corruption(
                    rawRegion.corruptionId,
                    rawRegion.corruptionName,
                    rawRegion.corruptionRate
                ),
                desc: rawRegion.regionDesc
            }
        );
    
        let facilities = await facilityServices.getFacilityByRegionId(region.regionId);

        region.summarise(facilities);

        regions.push(region);
    }
    
    return regions;
}

/**
 * Gets a region of a given ID.
 * @param {Number} id must be an integer.
 * @returns {Region} Region object if successful, null otherwise. 
 */
const getRegionById = async (id) => {
    let rawRegion = await knex
        .select([
            constants.TABLE_REGION + '.' + constants.COLUMN_REGION_ID,
            constants.TABLE_REGION + '.' + constants.COLUMN_NAME + ' AS regionName',
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID + ' AS stateId',
            constants.TABLE_STATE + '.' + constants.COLUMN_NAME + ' AS stateName',
            constants.TABLE_STATE + '.' + constants.COLUMN_TREASURY_AMT,
            constants.TABLE_STATE + '.' + constants.COLUMN_DESC + ' AS stateDesc',
            constants.TABLE_STATE + '.' + constants.COLUMN_EXPENSES + ' AS stateExpenses',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_CORRUPTION_ID + ' AS corruptionId',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_NAME + ' AS corruptionName',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_RATE + ' AS corruptionRate',
            constants.TABLE_BIOME + '.' + constants.COLUMN_BIOME_ID + ' AS biomeId',
            constants.TABLE_BIOME + '.' + constants.COLUMN_NAME + ' AS biomeName',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_DEVELOPMENT_ID + ' AS developmentId',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_NAME + ' AS developmentName',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_POPULATION_CAP,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_MILITARY_TIER,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_GROWTH_MODIFIER,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_SHRINKAGE_MODIFIER,
            constants.TABLE_REGION + '.' + constants.COLUMN_POPULATION,
            constants.TABLE_REGION + '.' + constants.COLUMN_DESC + ' AS regionDesc'
        ])
        .from(constants.TABLE_REGION)
        .where(constants.TABLE_REGION + '.' + constants.COLUMN_REGION_ID, id)
        .leftJoin(
            constants.TABLE_STATE,
            constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID,
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID
        )
        .leftJoin(
            constants.TABLE_CORRUPTION,
            constants.TABLE_REGION + '.' + constants.COLUMN_CORRUPTION_ID,
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_CORRUPTION_ID
        )
        .leftJoin(
            constants.TABLE_BIOME,
            constants.TABLE_REGION +  '.' + constants.COLUMN_BIOME_ID,
            constants.TABLE_BIOME + '.' + constants.COLUMN_BIOME_ID
        )
        .leftJoin(
            constants.TABLE_DEVELOPMENT,
            constants.TABLE_REGION +  '.' + constants.COLUMN_DEVELOPMENT_ID,
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_DEVELOPMENT_ID
        )
        .catch(e => {
            console.error(e);
        });
    
    if (rawRegion.length === 0) return null;

    rawRegion = rawRegion[0];

    //console.log(rawRegion);
    
    let region = new Region(
        id,
        rawRegion.regionName,
        new State(
            rawRegion.stateId,
            rawRegion.stateName,
            rawRegion.treasuryAmt,
            rawRegion.stateDesc,
            rawRegion.stateExpenses
        ),
        new Biome(rawRegion.biomeId, rawRegion.biomeName),
        {
            development: new Development(
                rawRegion.developmentId,
                rawRegion.developmentName,
                rawRegion.populationCap,
                rawRegion.militaryTier,
                rawRegion.growthModifier,
                rawRegion.shrinkageModifier
            ),
            population: rawRegion.population,
            corruption: new Corruption(
                rawRegion.corruptionId,
                rawRegion.corruptionName,
                rawRegion.corruptionRate
            ),
            desc: rawRegion.regionDesc
        }
    );

    let facilities = await facilityServices.getFacilityByRegionId(region.regionId);

    let stateRegions = await getRegionListByStateId(region.state.stateID);

    if (facilities !== null || stateRegions !== null) {
        let totalFoodProduced = 0;
        let totalFoodConsumed = 0;

        for (let stateRegion of stateRegions) {
            totalFoodProduced += stateRegion.totalFoodProduced;
            totalFoodConsumed += stateRegion.totalFoodConsumed;
        }

        let totalFoodOutput = totalFoodProduced - totalFoodConsumed;
        let baseGrowth = totalFoodOutput / 5;

        region.summarise(facilities, baseGrowth);
    }

    return region;
};

/**
 * Creates a new region.
 * @param {Region} region must be a region object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addRegion = async (region) => {
    let resStatus = true;

    await knex
        .insert({
            name: region.regionName,
            stateId: region.state.stateId,
            corruptionId: region.corruption.corruptionId,
            biomeId: region.biome.biomeId,
            developmentId: region.development.developmentId,
            population: region.population,
            desc: region.desc
        })
        .into(constants.TABLE_REGION)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
};

/**
 * Updates the information of a region.
 * @param {Region} region must be a region object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateRegion = async (region) => {
    let resStatus = true;

    await knex(constants.TABLE_REGION)
        .where({regionId: region.regionId})
        .update({
            name: region.name,
            stateId: region.state.stateId,
            corruptionId: region.corruption.corruptionId,
            biomeId: region.biome.biomeId,
            developmentId: region.development.developmentId,
            population: region.population,
            desc: region.desc
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
};

/**
 * Deletes the region of a given ID. Also deletes all associated facilities and components.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteRegionById = async (id) => {
    let resStatus = true;

    await knex(constants.TABLE_REGION)
        .where({regionId: id})
        .del()
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    return resStatus;
}

/**
 * Gets all biomes.
 * @returns {Array} array of biome objects if successful, null otherwise.
 */
const getBiomeAll = async () => {
    let rawBiomes = await knex
        .select('*')
        .from(constants.TABLE_BIOME)
        .catch(e => {
            console.error(e);
        });

    if (rawBiomes.length === 0) return null;

    let biomes = [];

    for (let rawBiome of rawBiomes) {
        let biome = new Biome(rawBiome.biomeId, rawBiome.name);

        biomes.push(biome);
    }

    return biomes;
};

/**
 * Gets all corruption levels.
 * @returns {Array} array of corruption objects if successful, null otherwise.
 */
const getCorruptionAll = async () => {
    let rawCorruptions = await knex
        .select('*')
        .from(constants.TABLE_CORRUPTION)
        .catch(e => {
            console.error(e);
        })
    
    if (rawCorruptions.length === 0) return null;

    let corruptions = [];

    for (let rawCorruption of rawCorruptions) {
        let corruption = new Corruption(rawCorruption.corruptionId, rawCorruption.name, rawCorruption.rate);

        corruptions.push(corruption);
    }

    return corruptions;
}

/**
 * Gets all development levels.
 * @returns {Array} array of development objects if successful, null otherwise.
 */
const getDevelopmentAll = async () => {
    let rawDevelopments = await knex
        .select('*')
        .from(constants.TABLE_DEVELOPMENT)
        .catch(e => {
            console.error(e);
        })
    
    if (rawDevelopments.length === 0) return null;

    let developments = [];

    for (let rawDevelopment of rawDevelopments) {
        let development = new Development(rawDevelopment.developmentId, rawDevelopment.name, rawDevelopment.populationCap, rawDevelopment.militaryTier, rawDevelopment.growthModifier, rawDevelopment.shrinkageModifier);

        developments.push(development);
    }

    return developments;
}

exports.getRegionListAll = getRegionListAll;
exports.getRegionListByStateId = getRegionListByStateId;
exports.getRegionByStateId = getRegionByStateId;
exports.getRegionById = getRegionById;
exports.addRegion = addRegion;
exports.updateRegion = updateRegion;
exports.deleteRegionById = deleteRegionById;
exports.getBiomeAll = getBiomeAll;
exports.getCorruptionAll = getCorruptionAll;
exports.getDevelopmentAll = getDevelopmentAll;

// FOR DEBUGGING
// getRegionListAll()
//     .then(data => console.log(data));
// getRegionListByStateId(1)
//     .then(data => console.log(data));
//getRegionById(2)
    //.then(data => console.log(data));
// addRegion('Ges Ogygia', 4, 4, 3, 5, 63);
// addRegion('Giosria', 8, 2, 13, 3, 24, "Capital of Cypra.");
// getRegionById(5)
//     .then(data => console.log(data));
// getRegionById(6)
//     .then(data => console.log(data));
// getBiomeAll().then(data => console.log(data));
// getCorruptionAll().then(data => console.log(data));
// getDevelopmentAll().then(data => console.log(data));

// let testRegion = new Region(
//     0,
//     'Test',
//     {
//         stateName: 'sup'
//     },
//     {
//         biomeName: 'biome'
//     }
// );

// console.log(testRegion);

// getRegionByStateId(1).then(data => console.log(data));