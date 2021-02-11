const config = require('./config.json');
const constants = config.constants;
const resourceServices = require(config.paths.resourceServices);
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

    const resources = await resourceServices.getResourceAll();
    
    if (rawComponents.length === 0 || componentTypes === null || resources === null) return null;

    let components = [];

    for (let rawComponent of rawComponents) {
        let componentValue = rawComponent.value;

        if (rawComponent.componentTypeId === 3) {
            componentValue = resources[parseInt(rawComponent.value.split(';')[1]) - 1];
        }

        let component = new Component(
            rawComponent.componentId,
            rawComponent.name,
            componentTypes[rawComponent.componentTypeId - 1],
            rawComponent.regionId,
            rawComponent.facilityId,
            componentValue,
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
    
    const resources = await resourceServices.getResourceAll();
    
    if (rawComponents.length === 0 || componentTypes === null || resources === null) return null;

    let components = [];

    for (let rawComponent of rawComponents) {
        let componentValue = rawComponent.value;

        if (rawComponent.componentTypeId === 3) {
            componentValue = resources[parseInt(rawComponent.value.split(';')[1]) - 1];
        }

        let component = new Component(
            rawComponent.componentId,
            rawComponent.name,
            componentTypes[rawComponent.componentTypeId - 1],
            rawComponent.regionId,
            rawComponent.facilityId,
            componentValue,
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
 * Creates a new component.
 * @param {Component} component must be a component object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addComponent = async (component) => {
    let resStatus = true;

    let newValue = null;

    if (typeof(component.value) === 'number') newValue = `i;${component.value}`;
    else if (typeof(component.value) === 'string') newValue = `s;${component.value}`;
    else if (typeof(component.value) === 'object') newValue = `i;${component.value.resourceId}`;

    let newIsChild = 0;
    let newParentId = null;

    if (component.isChild) {
        newIsChild = 1;
        newParentId = component.parentId;
    }

    await knex
        .insert({
            name: component.componentName,
            componentTypeId: component.componentType.componentTypeId,
            regionId: component.regionId,
            facilityId: component.facilityId,
            value: newValue,
            parentId: newParentId,
            activationTime: component.activationTime,
            isChild: newIsChild
        })
        .into(constants.TABLE_COMPONENT)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Updates the information of a component.
 * @param {Component} component must be a component object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateComponent = async (component) => {
    let resStatus = true;

    let newValue = null;

    if (typeof(component.value) === 'number') newValue = `i;${component.value}`;
    else if (typeof(component.value) === 'string') newValue = `s;${component.value}`;
    else if (typeof(component.value) === 'object') newValue = `i;${component.value.resourceId}`;

    let newIsChild = 0;
    let newParentId = null;

    if (component.isChild) {
        newIsChild = 1;
        newParentId = component.parentId;
    }

    await knex(constants.TABLE_COMPONENT)
        .where({componentId: component.componentId})
        .update({
            name: component.componentName,
            componentTypeId: component.componentType.componentTypeId,
            regionId: component.regionId,
            facilityId: component.facilityId,
            value: newValue,
            parentId: newParentId,
            activationTime: component.activationTime,
            isChild: newIsChild
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Deletes the component of a given ID.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteComponentById = async (id) => {
    let resStatus = true;

    await knex(constants.TABLE_COMPONENT)
        .where({componentId: id})
        .del()
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    return resStatus;
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
exports.addComponent = addComponent;
exports.updateComponent = updateComponent;
exports.deleteComponentById = deleteComponentById;
exports.getComponentTypeAll = getComponentTypeAll;

// FOR DEBUGGING
// getComponentByRegionId(1).then(data => console.dir(data));
// getComponentByFacilityId(1).then(data => console.dir(data));
// getComponentTypeAll().then(data => console.log(data));