const config = require('./config.json');
const constants = config.constants;
const componentServices = require(config.paths.componentServices);
const knex = require('knex')(config.knexConfig);

const Facility = require(config.paths.facilityModel);

/**
 * Gets all facilities of a given region.
 * @param {Number} id must be an integer.
 * @returns {Array} array of facility objects if successful, null otherwise.
 */
const getFacilityByRegionId = async (id) => {
    let rawFacilities = await knex
        .select('*')
        .from(constants.TABLE_FACILITY)
        .where(constants.COLUMN_REGION_ID, id)
        .catch(e => {
            console.error(e);
        });
    
    let components = await componentServices.getComponentByRegionId(id);
    let sortedComponents =  await componentServices.sortChildComponents(components);

    if (rawFacilities.length === 0 || sortedComponents.length === 0) return null;
    
    let facilities = [];

    for (let rawFacility of rawFacilities) {
        let facility = new Facility(
            rawFacility.facilityId,
            rawFacility.regionId,
            rawFacility.name,
            rawFacility.isFunctional
        );

        let facilityComponents = [];

        for (let component of sortedComponents) {
            if (component.facilityId === facility.facilityId) {
                facilityComponents.push(component);
            }
        }

        facility.summarise(facilityComponents);

        facilities.push(facility);
    }

    return facilities;
}

/**
 * Creates a new facility.
 * @param {Facility} facility must be a facility object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addFacility = async (facility) => {
    let resValue = true;

    let newIsFunctional = 0;

    if (component.isFunctional) newIsFunctional = 1;

    await knex
        .insert({
            regionId: facility.regionId,
            name: facility.facilityName,
            isFunctional: newIsFunctional
        })
        .into(constants.TABLE_FACILITY)
        .catch(e => {
            console.error(e);
            resValue = false;
        })
    
    return resValue;
}

/**
 * Updates the information of a facility.
 * @param {Facility} facility must be a facility object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateFacility = async (facility) => {
    let resValue = true;

    let newIsFunctional = 0;

    if (facility.isFunctional) newIsFunctional = 1;

    await knex(constants.TABLE_FACILITY)
        .where({facilityId: facility.facilityId})
        .update({
            regionId: facility.regionId,
            name: facility.facilityName,
            isFunctional: newIsFunctional
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    return resValue;
}

/**
 * Deletes the facility of a given ID without deleting its components.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteFacilityById = async (id) => {
    let resStatus = true;

    await knex(constants.TABLE_FACILITY)
    .where({facilityId: id})
    .del()
    .catch(e => {
        console.error(e);
        resStatus = false;
    });
    
    await knex(constants.TABLE_COMPONENT)
        .where({facilityId: id})
        .update({facilityId: null})
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    return resStatus;
}

/**
 * Deletes the facility of a given ID and its components.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const destroyFacilityById = async (id) => {
    let resStatus = true;

    await knex(constants.TABLE_FACILITY)
        .where({facilityId: id})
        .del()
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    if (resStatus) {
        await knex(constants.TABLE_COMPONENT)
        .where({facilityId: id})
        .del()
        .catch(e => {
            console.error(e);
            resStatus = false;
        }) 
    }
    
    return resStatus;
}

/**
 * Assigns components to a facility.
 * @param {Number} facilityId must be an integer.
 * @param {Array} componentIds must be an array of integers.
 * @returns {Boolean} true if successful, false otherwise.
 */
const assignFacilityComponents = async (facilityId, componentIds) => {
    let resStatus = true;

    let promises = [];

    for (let componentId of componentIds) {
        let promise = knex(constants.TABLE_COMPONENT)
            .where({componentId: componentId})
            .update({
                facilityId: facilityId
            })
            .catch(e => {
                console.error(e);
                resStatus = false;
            });
        
        promises.push(promise);
    }

    await Promise.all(promises);

    return resStatus;
}

exports.getFacilityByRegionId = getFacilityByRegionId;
exports.addFacility = addFacility;
exports.updateFacility = updateFacility;
exports.deleteFacilityById = deleteFacilityById;
exports.destroyFacilityById = destroyFacilityById;
exports.assignFacilityComponents = assignFacilityComponents;

// FOR DEBUGGING
// getFacilityByRegionId(1).then(data => console.dir(data));
// deleteFacilityById(3).then(data => console.dir(data));
// destroyFacilityById(4).then(data => console.dir(data));
// assignFacilityComponents(1, [3]);