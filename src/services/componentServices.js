const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const Component = require(config.paths.componentModel);
const ComponentType = require(config.paths.componentTypeModel);

/**
 * Gets all components of a given region.
 * @param {Number} id must be an integer.
 * @returns {Array} array of component objects if successful, null otherwise.
 */
const getComponentByRegionId = async (id) => {
    const rawComponents = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_REGION_ID, id)
        .catch(e => {
            console.error(e);
        });
    
    const componentTypes = await getComponentTypeAll();
    
    if (rawComponents.length === 0 || componentTypes === null) return null;

    let components = [];

    for (let rawComponent of rawComponents) {
        let component = new Component(
            rawComponent.componentId,
            rawComponent.name,
            componentTypes[rawComponent.componentTypeId - 1],
            rawComponent.regionId,
            rawComponent.facilityId,
            rawComponent.value,
            rawComponent.activationTime,
            rawComponent.isChild,
            rawComponent.parentId
        );

        components.push(component);
    }

    for (let component of components) {
        if (component.isChild) {
            for (let parentComponent of components) {
                if (component.parentId === parentComponent.componentId) {
                    component.parent = parentComponent;
                    break;
                }
            }
        }
    }

    return components;
};

/**
 * Gets all components of a given facility.
 * @param {Number} id must be an integer.
 * @returns {Array} array of component objects if successful, null otherwise.
 */
const getComponentByFacilityId = async (id) => {
    const rawComponents = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_FACILITY_ID, id)
        .catch(e => {
            console.error(e);
        });
    
    const componentTypes = await getComponentTypeAll();
    
    if (rawComponents.length === 0 || componentTypes === null) return null;

    let components = [];

    for (let rawComponent of rawComponents) {
        let component = new Component(
            rawComponent.componentId,
            rawComponent.name,
            componentTypes[rawComponent.componentTypeId - 1],
            rawComponent.regionId,
            rawComponent.facilityId,
            rawComponent.value,
            rawComponent.activationTime,
            rawComponent.isChild,
            rawComponent.parentId
        );

        components.push(component);
    }

    for (let component of components) {
        if (component.isChild) {
            for (let parentComponent of components) {
                if (component.parentId === parentComponent.componentId) {
                    component.parent = parentComponent;
                    break;
                }
            }
        }
    }

    return components;
}

/**
 * Gets all component types.
 * @returns {Array} array of component type objects if successful, null otherwise.
 */
const getComponentTypeAll = async () => {
    const rawComponentTypes = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT_TYPE)
        .catch(e => {
            console.error(e);
        });
    
    if (rawComponentTypes.length === 0) return null;

    let componentTypes = [];

    for (let rawComponentType of rawComponentTypes) {
        let componentType = new ComponentType(rawComponentType.componentTypeId, rawComponentType.name);

        componentTypes.push(componentType);
    }

    return componentTypes;
};

exports.getComponentByRegionId = getComponentByRegionId;
exports.getComponentByFacilityId = getComponentByFacilityId;
exports.getComponentTypeAll = getComponentTypeAll;

// FOR DEBUGGING
// getComponentByRegionId(1).then(data => console.dir(data));
// getComponentByFacilityId(1).then(data => console.dir(data));
// getComponentTypeAll().then(data => console.log(data));