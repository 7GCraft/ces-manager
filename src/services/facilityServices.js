const config = require('./config.json');

const { constants } = config;
const componentServices = require(config.paths.componentServices);
const dbContext = require('../repository/DbContext');

const knex = dbContext.getKnexObject();

const Facility = require(config.paths.facilityModel);
const RootComponentCollection = require(config.paths.rootComponentCollection);

/**
 * Gets all facilities of a given region.
 * @param {Number} id must be an integer.
 * @returns {Array} array of facility objects if successful, null otherwise.
 */
const getFacilitiesByRegionId = async (id) => {
  const rawFacilities = await knex
    .select('*')
    .from(constants.TABLE_FACILITY)
    .where(constants.COLUMN_REGION_ID, id)
    .catch((e) => {
      console.error(e);
    });

  const components = await componentServices.getComponentByRegionId(id);
  const sortedComponents = await componentServices.sortChildComponents(components);
  const rootComponentCollection = new RootComponentCollection(components);

  // if (rawFacilities.length === 0 || sortedComponents === null) return null;
  if (rawFacilities.length === 0 || rootComponentCollection === null) return null;

  const facilities = [];

  for (const rawFacility of rawFacilities) {
    const facility = new Facility(
      rawFacility.facilityId,
      rawFacility.regionId,
      rawFacility.name,
      rawFacility.isFunctional,
    );

    const facilityComponents = [];

    // for (let component of sortedComponents) {
    for (const componentId in rootComponentCollection.componentDict) {
      // if (component.facilityId === facility.facilityId) {
      //     facilityComponents.push(component);
      // }
      const rootComponent = rootComponentCollection.findRoot(componentId);
      if (rootComponent.facilityId === facility.facilityId) {
        facilityComponents.push(rootComponentCollection.componentDict[componentId]);
      }
    }

    facility.summarise(facilityComponents);

    facilities.push(facility);
  }

  return facilities;
};

const getFacilitiesByStateId = async (id) => {
  const facilityList = await knex(constants.TABLE_FACILITY)
    .select(
      `${constants.TABLE_REGION}.${constants.COLUMN_NAME} AS regionName`,
      `${constants.TABLE_FACILITY}.${constants.COLUMN_NAME} AS facilityName`,
      constants.COLUMN_IS_FUNCTIONAL,
    )
    .leftJoin(
      constants.TABLE_REGION,
      `${constants.TABLE_FACILITY}.${constants.COLUMN_REGION_ID}`,
      `${constants.TABLE_REGION}.${constants.COLUMN_REGION_ID}`,
    )
    .where(constants.COLUMN_STATE_ID, id)
    .catch((e) => {
      console.error(e);
      resValue = -1;
    });

  resValue = facilityList;

  return resValue;
};

/**
 * Gets the number of functional facilities that the state of the given ID has.
 * @param {Number} id must be an integer.
 * @returns a positive integer if successful, -1 otherwise.
 */
const getFacilityCountByStateId = async (id) => {
  let resValue = 0;

  const facilityCount = await knex(constants.TABLE_FACILITY)
    .count(`${constants.COLUMN_FACILITY_ID} AS count`)
    .leftJoin(
      constants.TABLE_REGION,
      `${constants.TABLE_FACILITY}.${constants.COLUMN_REGION_ID}`,
      `${constants.TABLE_REGION}.${constants.COLUMN_REGION_ID}`,
    )
    .where(constants.COLUMN_STATE_ID, id)
    .andWhere(constants.COLUMN_IS_FUNCTIONAL, 1)
    .catch((e) => {
      console.error(e);
      resValue = -1;
    });

  resValue = facilityCount[0].count;

  return resValue;
};

/**
 * Creates a new facility.
 * @param {Facility} facility must be a facility object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addFacility = async (facility) => {
  let resValue = true;

  let newIsFunctional = 0;

  if (facility.isFunctional) newIsFunctional = 1;

  await knex
    .insert({
      regionId: facility.regionId,
      name: facility.facilityName,
      isFunctional: newIsFunctional,
    })
    .into(constants.TABLE_FACILITY)
    .catch((e) => {
      console.error(e);
      resValue = false;
    });

  return resValue;
};

/**
 * Updates the information of a facility.
 * @param {Facility} facility must be a facility object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateFacility = async (facility) => {
  const resValue = true;

  let newIsFunctional = 0;

  if (facility.isFunctional) newIsFunctional = 1;

  await knex(constants.TABLE_FACILITY)
    .where({ facilityId: facility.facilityId })
    .update({
      regionId: facility.regionId,
      name: facility.facilityName,
      isFunctional: newIsFunctional,
    })
    .catch((e) => {
      console.error(e);
      resStatus = false;
    });

  return resValue;
};

const addMultipleFacilities = async (facilities) => {
  let resValue = true;

  const knex = dbContext.getKnexObject();

  const mappedFacilities = facilities.map((facility) => ({
    regionId: facility.regionId,
    name: facility.facilityName,
    isFunctional: facility.isFunctional ? 1 : 0,
  }));

  await knex
    .insert(mappedFacilities)
    .into(constants.TABLE_FACILITY)
    .catch((e) => {
      console.error(e);
      resValue = false;
    });

  return resValue;
};

/**
 * Deletes the facility of a given ID without deleting its components.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteFacilityById = async (id) => {
  let resStatus = true;

  await knex(constants.TABLE_FACILITY)
    .where({ facilityId: id })
    .del()
    .catch((e) => {
      console.error(e);
      resStatus = false;
    });

  await knex(constants.TABLE_COMPONENT)
    .where({ facilityId: id })
    .update({ facilityId: null })
    .catch((e) => {
      console.error(e);
      resStatus = false;
    });

  return resStatus;
};

/**
 * Deletes the facility of a given ID and its components.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const destroyFacilityById = async (id) => {
  let resStatus = true;

  await knex(constants.TABLE_FACILITY)
    .where({ facilityId: id })
    .del()
    .catch((e) => {
      console.error(e);
      resStatus = false;
    });

  if (resStatus) {
    await knex(constants.TABLE_COMPONENT)
      .where({ facilityId: id })
      .del()
      .catch((e) => {
        console.error(e);
        resStatus = false;
      });
  }

  return resStatus;
};

/**
 * Assigns components to a facility.
 * @param {Number} facilityId must be an integer.
 * @param {Array} componentIds must be an array of integers.
 * @returns {Boolean} true if successful, false otherwise.
 */
const assignFacilityComponents = async (facilityId, componentIds) => {
  let resStatus = true;

  const promises = [];

  for (const componentId of componentIds) {
    const promise = knex(constants.TABLE_COMPONENT)
      .where({ componentId })
      .update({
        facilityId,
      })
      .catch((e) => {
        console.error(e);
        resStatus = false;
      });

    promises.push(promise);
  }

  await Promise.all(promises);

  return resStatus;
};

exports.getFacilitiesByRegionId = getFacilitiesByRegionId;
exports.getFacilityCountByStateId = getFacilityCountByStateId;
exports.addFacility = addFacility;
exports.updateFacility = updateFacility;
exports.deleteFacilityById = deleteFacilityById;
exports.destroyFacilityById = destroyFacilityById;
exports.assignFacilityComponents = assignFacilityComponents;
exports.getFacilitiesByStateId = getFacilitiesByStateId;
exports.addMultipleFacilities = addMultipleFacilities;
