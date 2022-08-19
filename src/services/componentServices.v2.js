// TEMPORARY FILE TO STORE VERSION 2 OF SOME FUNCTIONS IN componentServices.js
// FUNCTIONS IN THIS FILE WILL BE MOVED INTO THE ORIGINAL FILE ONCE REQUIRED

const config = require('./config.json');
const constants = config.constants;
const facilityServices = require(config.paths.facilityServices);
const dbContext = require('../repository/DbContext');
const Component = require(config.paths.componentModel);

const INSUFFICIENT_TREASURY_ERROR_MESSAGE = "Cost exceeding treasury amount";

/**
 * Creates a new component.
 * @param {Component} component must be a component object.
 * @param {String} tempFacilityName temporary facility name which component will be assigned to, 
 *  if it's null, then the component's facility will be assigned with facility id inside the component object
 * @returns {Boolean} true if successful, false otherwise.
 */
 const addComponent = async ({ component, tempFacilityName = null }) => {
    let resStatus = "OK";

    const knex = dbContext.getKnexObject();

    let newValue = convertComponentInputValue(component.value);

    let newIsChild = 0;
    let newParentId = null;

    if (component.isChild) {
        newIsChild = 1;
        newParentId = component.parentId;
    }

    let calculateCostStatus = await calculateComponentCost(component.cost, component.regionId);

    if(!calculateCostStatus){
        return INSUFFICIENT_TREASURY_ERROR_MESSAGE;
    }

    if (tempFacilityName != null) {
        const mapKey = null;
        component.facilityId = mapKey;
        let tempFacilityMap = new Map([[mapKey, tempFacilityName]]);
        let facilityInsertStatus = await allocateTemporaryFacilitiesToComponents([component], tempFacilityMap);
        if (!facilityInsertStatus) {
            resStatus = "There is an error when inserting temporary facility";
            return resStatus;
        }
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
            resStatus = "SQL Error. Something went wrong when inserting component";
        });

    return resStatus;
}

/**
 * Updates the information of a component.
 * @param {Component} component must be a component object.
 * @param {String} tempFacilityName temporary facility name which component will be assigned to, 
 *  if it's null, then the component's facility will be assigned with facility id inside the component object
 * @returns {Boolean} true if successful, false otherwise.
 */
 const updateComponent = async ({ component, tempFacilityName = null }) => {
    let resStatus = true;

    const knex = dbContext.getKnexObject();

    let newValue = convertComponentInputValue(component.value);

    let newIsChild = 0;
    let newParentId = null;

    if (component.isChild) {
        newIsChild = 1;
        newParentId = component.parentId;
    }

    if (tempFacilityName != null) {
        const mapKey = null;
        component.facilityId = mapKey;
        let tempFacilityMap = new Map([[mapKey, tempFacilityName]]);
        let facilityInsertStatus = await allocateTemporaryFacilitiesToComponents([component], tempFacilityMap);
        if (!facilityInsertStatus) {
            resStatus = "There is an error when inserting temporary facility";
            return resStatus;
        }
    }

    await knex(constants.TABLE_COMPONENT)
        .where({ componentId: component.componentId })
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
 * Creates multiple components at once
 * @param {Array} components must be an array of component objects.
 * @param {Map} tempFacilityMap A map with temporary facility ID as the key and its name as the value
 * @returns {Boolean} true if successful, false otherwise.
 */
 const addMultipleComponents = async ({ components, tempFacilityMap = null }) => {
    let resStatus = true;

    const knex = dbContext.getKnexObject();

    // First, transform array of components into two insertable components arrays
    // Parent component(s) array and Child component(s) array
    let parentArray = [];
    let childrenArray = [];
    let mapUniqueIDwithComponentIDDict = {};
    let totalCost = 0;
    components.forEach((component) => {
        let tempValue = convertComponentInputValue(component.value);

        let tempComponent = {
            name: component.componentName,
            componentTypeId: component.componentType.componentTypeId,
            regionId: component.regionId,
            facilityId: component.facilityId,
            value: tempValue,
            activationTime: component.activationTime,
        };

        if (component.isChild) {
            tempComponent.isChild = 1;
            tempComponent.parentUniqueID = component.parentId;
            childrenArray.push(tempComponent);
        } else {
            tempComponent.isChild = 0;
            tempComponent.parentId = null;
            parentArray.push(tempComponent);
            mapUniqueIDwithComponentIDDict[component.uniqueID] = null;
        }

        totalCost += parseInt(component.cost);
    });

    let calculateCostStatus = await calculateComponentCost(totalCost, components[0].regionId)

    if(!calculateCostStatus){
        console.error("Cost exceeding treasury amount");
        return false;
    }

    try {
        if (tempFacilityMap != null) {
            let facilityInsertStatus = await allocateTemporaryFacilitiesToComponents(parentArray, tempFacilityMap);
            if (!facilityInsertStatus) {
                throw "There is an error when inserting temporary facilities";
            }
        }
        await knex.transaction(async trx => {
            await trx.insert(parentArray).into(constants.TABLE_COMPONENT);

            // Get last n inserted components to get their ids
            const insertedParentComponents = await trx(constants.TABLE_COMPONENT)
                .orderBy(constants.COLUMN_COMPONENT_ID, 'desc')
                .limit(parentArray.length)
                .pluck(constants.COLUMN_COMPONENT_ID);

            let i = parentArray.length - 1;
            for (const uniqueID in mapUniqueIDwithComponentIDDict) {
                mapUniqueIDwithComponentIDDict[uniqueID] = insertedParentComponents[i];
                i--;
            }

            childrenArray = childrenArray.map(child => {
                child.parentId = mapUniqueIDwithComponentIDDict[child.parentUniqueID];
                delete child.parentUniqueID;
                return child;
            });

            if(childrenArray.length){
                await trx.insert(childrenArray).into(constants.TABLE_COMPONENT);
            }
        })
    } catch (error) {
        console.error(error);
        resStatus = false;
    }

    return resStatus;
}

/**
 * Calculates component cost by subtracting treasury amount by cost
 * @param {Number} cost must be an integer.
 * @param {Number} regionId must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
 const calculateComponentCost = async (cost, regionId) => {
    let resStatus = true;
    const knex = dbContext.getKnexObject();
    let stateTreasury = await knex
        .select(constants.COLUMN_TREASURY_AMT, constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID)
        .from(constants.TABLE_REGION)
        .join(
            constants.TABLE_STATE,
            constants.TABLE_REGION + '.' + constants.COLUMN_STATE_ID,
            constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID
        )
        .where(constants.TABLE_REGION + '.' + constants.COLUMN_REGION_ID, regionId);

    let newTreasuryAmt = stateTreasury[0].treasuryAmt - cost;
    
    if(newTreasuryAmt < 0){
        return false;
    }

    await knex(constants.TABLE_STATE)
        .update({ treasuryAmt: newTreasuryAmt })
        .where(constants.TABLE_STATE + '.' + constants.COLUMN_STATE_ID, stateTreasury[0].stateId)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    return resStatus;
}

const convertComponentInputValue = (value) => {
    let newValue = null;

    if (value !== null) {
        if (typeof (value) === 'number') newValue = `i;${value}`;
        else if (typeof (value) === 'string') newValue = `s;${value}`;
        else if (typeof (value) === 'object') newValue = `i;${value.resourceId}`;
    }

    return newValue;
};

/**
 * Create temporary facilities and assign them into input components
 * @param {Array} components must be an array of component objects.
 * @param {Map} tempFacilityMap A map with temporary facility ID as the key and its name as the value
 * @returns {Boolean} true if successful, false otherwise.
 */
const allocateTemporaryFacilitiesToComponents = async (components, tempFacilityMap) => {
    let regionId = components[0].regionId;
    let insertedFacilityMap = await processTemporaryFacilities(tempFacilityMap, regionId);
    if (insertedFacilityMap == null) {
        return false;
    }
    components.forEach(component => {
        if (insertedFacilityMap.has(component.facilityId)) {
            component.facilityId = insertedFacilityMap.get(component.facilityId);
        }
    });
    return true;
};

/**
 * Process a map with temporary facility and transforms it into
 * a map with temporary facility ID as the key and its Database facility ID as the value
 * @param {Map} tempFacilityMap A map with temporary facility ID as the key and its name as the value
 * @param {Number} regionId Region ID for the facilities 
 * @returns {Boolean} true if successful, false otherwise 
 */
const processTemporaryFacilities = async (tempFacilityMap, regionId) => {
    let temporaryFacilities = [];
    for (const facilityName of tempFacilityMap.values()) {
        temporaryFacilities.push({
            regionId: regionId,
            facilityName: facilityName,
            isFunctional: false
        });
    }
    let facilityInsertStatus = await facilityServices.addMultipleFacilities(temporaryFacilities);
    if (!facilityInsertStatus) {
        return null;
    }
    return obtainCreatedTemporaryFacilities(tempFacilityMap);
};

const obtainCreatedTemporaryFacilities = async (tempFacilityMap) => {
    const knex = dbContext.getKnexObject();
    const insertedFacilityIDs = await knex(constants.TABLE_FACILITY)
                .orderBy(constants.COLUMN_FACILITY_ID, 'desc')
                .limit(tempFacilityMap.size)
                .pluck(constants.COLUMN_FACILITY_ID);

    let i = tempFacilityMap.size - 1;
    for (const tempFacilityID of tempFacilityMap.keys()) {
        tempFacilityMap.set(tempFacilityID, insertedFacilityIDs[i]);
        i--;
    }
    return tempFacilityMap;
};

module.exports = {
    addComponent,
    updateComponent,
    addMultipleComponents
}