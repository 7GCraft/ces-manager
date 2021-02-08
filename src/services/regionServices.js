const config = require('./config.json');
const constants = config.constants;
const errors = config.errors;
const knex = require('knex')(config.knexConfig);

const RegionListItem = require(config.paths.regionListItemModel);

/**
 * Gets a list of region IDs, names, total income, and total food.
 * @returns {Array} Array of region list item objects if successful, null otherwise.
 */
const getRegionListAll = async () => {
    let rawRegions = await knex
        .select([constants.COLUMN_REGION_ID, constants.COLUMN_NAME])
        .from(constants.TABLE_REGION)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });
    
    let regionList = [];

    for (let rawRegion of rawRegions) {
        // TODO: INTEGRATE WITH FACILITIES
        let regionListItem = new RegionListItem(rawRegion.regionId, rawRegion.name, 0, 0);

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
        .select([constants.COLUMN_REGION_ID, constants.COLUMN_NAME])
        .from(constants.TABLE_REGION)
        .where(constants.COLUMN_STATE_ID, stateId)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });
    
    let regionList = [];

    for (let rawRegion of rawRegions) {
        // TODO: INTEGRATE WITH FACILITIES
        let regionListItem = new RegionListItem(rawRegion.regionId, rawRegion.name, 0, 0);

        regionList.push(regionListItem);
    }

    return regionList;
}

const getRegionById = async (id) => {
    let rawRegion = await knex
        .select([
            constants.TABLE_REGION + '.' + constants.COLUMN_REGION_ID,
            constants.TABLE_REGION + '.' + constants.COLUMN_NAME + ' AS regionName',
            constants.TABLE_STATE + '.' + constants.COLUMN_NAME + ' AS state',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_NAME + ' AS corruptionName',
            constants.TABLE_CORRUPTION + '.' + constants.COLUMN_RATE + ' AS corruptionRate',
            constants.TABLE_BIOME + '.' + constants.COLUMN_NAME + ' AS biome',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_DEVELOPMENT_ID + ' AS developmentLevel',
            constants.TABLE_DEVELOPMENT + '.' + constants.COLUMN_NAME + ' AS developmentName',
            constants.TABLE_REGION + '.' + constants.COLUMN_POPULATION,
            constants.TABLE_REGION + '.' + constants.COLUMN_DESC
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
            console.log(errors.queryError, '\n', e);
            return null;
        });
    
    return rawRegion;
};

exports.getRegionListAll = getRegionListAll;
exports.getRegionListByStateId = getRegionListByStateId;

// FOR DEBUGGING
// getRegionListAll()
//     .then(data => console.log(data));
// getRegionListByStateId(1)
//     .then(data => console.log(data));
getRegionById(1)
    .then(data => console.log(data));