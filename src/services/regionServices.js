const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const RegionListItem = require(config.paths.regionListItemModel);
const Region = require(config.paths.regionModel);

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
        // TODO: INTEGRATE WITH FACILITIES
        let regionListItem = new RegionListItem(rawRegion.regionId, rawRegion.name, 0, 0, rawRegion.state);

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
        // TODO: INTEGRATE WITH FACILITIES
        let regionListItem = new RegionListItem(rawRegion.regionId, rawRegion.name, 0, 0, rawRegion.state);

        regionList.push(regionListItem);
    }

    return regionList;
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
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_CORRUPTION_ID + ' AS corruptionLevel',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_NAME + ' AS corruptionName',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_RATE + ' AS corruptionRate',
            constants.TABLE_BIOME + '.' + constants.COLUMN_BIOME_ID + ' AS biomeId',
            constants.TABLE_BIOME + '.' + constants.COLUMN_NAME + ' AS biome',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_DEVELOPMENT_ID + ' AS devLevel',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_NAME + ' AS devName',
            constants.TABLE_REGION + '.' + constants.COLUMN_POPULATION,
            constants.TABLE_REGION + '.' + constants.COLUMN_DESC
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
            console.log(errors.queryError, '\n', e);
            
        });
    
    if (rawRegion.length === 0) return null;

    rawRegion = rawRegion[0];

    // TODO: INTEGRATE WITH FACILITIES
    let region = new Region(
        id,
        rawRegion.stateId,
        rawRegion.regionName,
        rawRegion.stateName,
        0,
        0,
        0,
        rawRegion.devLevel,
        rawRegion.devName,
        rawRegion.population,
        [],
        0,
        rawRegion.corruptionLevel,
        rawRegion.corruptionName,
        rawRegion.corruptionRate,
        rawRegion.biomeId,
        rawRegion.biome,
        rawRegion.desc
    );

    return region;
};

/**
 * Creates a new region.
 * @param {String} regionName must be a string.
 * @param {Number} stateId must be an integer.
 * @param {Number} corruptionLevel must be an integer.
 * @param {Number} biomeId must be an integer.
 * @param {Number} devLevel must be an integer.
 * @param {Number} population must be an integer.
 * @param {String} desc must be a string.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addRegion = async (regionName, stateId, corruptionLevel = 1, biomeId, devLevel = 1, population = 1, desc = null) => {
    let resStatus = true;

    await knex
        .insert({
            name: regionName,
            stateId: stateId,
            corruptionId: corruptionLevel,
            biomeId: biomeId,
            developmentId: devLevel,
            population: population,
            desc: desc
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

    let test = await knex(constants.TABLE_REGION)
        .where({regionId: region.regionId})
        .update({
            name: region.name,
            stateId: region.stateId,
            corruptionId: region.corruptionLevel,
            biomeId: region.biomeId,
            developmentId: region.devLevel,
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
 * Deletes the region of a given ID.
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

exports.getRegionListAll = getRegionListAll;
exports.getRegionListByStateId = getRegionListByStateId;
exports.getRegionById = getRegionById;
exports.addRegion = addRegion;
exports.updateRegion = updateRegion;
exports.deleteRegionById = deleteRegionById;

// FOR DEBUGGING
// getRegionListAll()
//     .then(data => console.log(data));
// getRegionListByStateId(1)
//     .then(data => console.log(data));
// getRegionById(1)
//     .then(data => console.log(data));
// addRegion('Ges Ogygia', 4, 4, 3, 5, 63);
// addRegion('Giosria', 8, 2, 13, 3, 24, "Capital of Cypra.");
// getRegionById(5)
//     .then(data => console.log(data));
// getRegionById(6)
//     .then(data => console.log(data));