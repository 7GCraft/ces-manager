const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const Component = require(config.paths.componentModel);
const ComponentType = require(config.paths.componentTypeModel);

/**
 * Gets all components of a given region id.
 * @param {Number} id must be an integer.
 * @returns {Array} array of component objects if successful, null otherwise.
 */
const getComponentByRegionId = async (id) => {
    const rawParentComponents = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_REGION_ID, id)
        .andWhere(constants.COLUMN_IS_CHILD, false)
        .catch(e => {
            console.error(e);
        });
    
    const rawChildComponents = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_REGION_ID, id)
        .andWhere(constants.COLUMN_IS_CHILD, true)
        .catch(e => {
            console.error(e);
        });
    
    const componentTypes = await getComponentTypeAll();
    
    if (rawParentComponents.length === 0 || rawChildComponents.length === 0 || componentTypes === null) return null;

    let parentComponents = [];
    let childComponents = [];

    for (let rawParentComponent of rawParentComponents) {
        let parentComponent = new Component(
            rawParentComponent.componentId,
            rawParentComponent.name,
            componentTypes[rawParentComponent.componentTypeId - 1],
            rawParentComponent.regionId,
            rawParentComponent.facilityId,
            rawParentComponent.value,
            [],
            rawParentComponent.activationTime,
            false
        );

        parentComponents.push(parentComponent);
    }

    for (let rawChildComponent of rawChildComponents) {
        let childComponent = new Component(
            rawChildComponent.componentId,
            rawChildComponent.name,
            componentTypes[rawChildComponent.componentTypeId - 1],
            rawChildComponent.regionId,
            rawChildComponent.facilityId,
            rawChildComponent.value,
            [],
            rawChildComponent.activationTime,
            true,
            rawChildComponent.parentId
        );

        childComponents.push(childComponent);
    }

    for (let parentComponent of parentComponents) {
        let childrenToRemoveIndexes = [];

        for (let childComponent of childComponents) {
            if (parentComponent.componentId === childComponent.parentId) {
                parentComponent.children.push(childComponent);
                let childIndex = childComponents.indexOf(childComponent);
                childrenToRemoveIndexes.push(childIndex);
            }
        }

        for (let childrenToRemoveIndex of childrenToRemoveIndexes) {
            childComponents.splice(childrenToRemoveIndex, 1);
        }
    }

    return parentComponents;
};

const getComponentByFacilityId = async (id) => {
    const rawParentComponents = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_FACILITY_ID, id)
        .andWhere(constants.COLUMN_IS_CHILD, false)
        .catch(e => {
            console.error(e);
        });
    
    const rawChildComponents = await knex
        .select('*')
        .from(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_FACILITY_ID, id)
        .andWhere(constants.COLUMN_IS_CHILD, true)
        .catch(e => {
            console.error(e);
        });
    
    const componentTypes = await getComponentTypeAll();
    
    if (rawParentComponents.length === 0 || rawChildComponents.length === 0 || componentTypes === null) return null;

    let parentComponents = [];
    let childComponents = [];

    for (let rawParentComponent of rawParentComponents) {
        let parentComponent = new Component(
            rawParentComponent.componentId,
            rawParentComponent.name,
            componentTypes[rawParentComponent.componentTypeId - 1],
            rawParentComponent.regionId,
            rawParentComponent.facilityId,
            rawParentComponent.value,
            [],
            rawParentComponent.activationTime,
            false
        );

        parentComponents.push(parentComponent);
    }

    for (let rawChildComponent of rawChildComponents) {
        let childComponent = new Component(
            rawChildComponent.componentId,
            rawChildComponent.name,
            componentTypes[rawChildComponent.componentTypeId - 1],
            rawChildComponent.regionId,
            rawChildComponent.facilityId,
            rawChildComponent.value,
            [],
            rawChildComponent.activationTime,
            true,
            rawChildComponent.parentId
        );

        childComponents.push(childComponent);
    }

    for (let parentComponent of parentComponents) {
        let childrenToRemoveIndexes = [];

        for (let childComponent of childComponents) {
            if (parentComponent.componentId === childComponent.parentId) {
                parentComponent.children.push(childComponent);
                let childIndex = childComponents.indexOf(childComponent);
                childrenToRemoveIndexes.push(childIndex);
            }
        }

        for (let childrenToRemoveIndex of childrenToRemoveIndexes) {
            childComponents.splice(childrenToRemoveIndex, 1);
        }
    }

    return parentComponents;
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
// getComponentByFacilityId(1).then(data => console.dir(data[0]));
// getComponentTypeAll().then(data => console.log(data));