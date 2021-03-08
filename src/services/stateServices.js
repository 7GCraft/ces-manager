const config = require('./config.json');
const constants = config.constants;
const facilityServices = require(config.paths.facilityServices);
const regionServices = require(config.paths.regionServices);
const tradeAgreementServices = require(config.paths.tradeAgreementServices);
const dbContext = require('../repository/DbContext');
const knex = dbContext.getKnexObject();

const StateListItem = require(config.paths.stateListItemModel);
const State = require(config.paths.stateModel);

/**
 * Gets a list of state IDs and names.
 * @returns {Array} Array of state list item objects if successful, null otherwise.
 */
const getStateList = async () => {
    let rawStateList = await knex
        .select([constants.COLUMN_STATE_ID, constants.COLUMN_NAME])
        .from(constants.TABLE_STATE)
        .catch(e => {
            console.error(e);
        });

    if (rawStateList.length === 0) return null;

    let stateList = [];

    for (let rawState of rawStateList) {
        let state = new StateListItem(rawState.stateId, rawState.name);

        stateList.push(state);
    }

    return stateList;
}

/**
 * Gets all states.
 * @returns {Array} array of state objects if successful, null otherwise.
 */
const getStateAll = async () => {
    let rawStates = await knex
        .select('*')
        .from(constants.TABLE_STATE)
        .catch(e => {
            console.error(e);
        });

    if (rawStates.length === 0) return null;

    let states = [];

    for (let rawState of rawStates) {
        let state = new State(
            rawState.stateId,
            rawState.name,
            rawState.treasuryAmt,
            rawState.desc,
            rawState.expenses
        );

        let regions = await regionServices.getRegionByStateId(state.stateID);

        let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

        state.summarise(regions, tradeAgreements);

        states.push(state);
    }

    return states;
}

/**
 * Gets all states of the given IDs.
 * @param {Array} ids must be an array of integers.
 * @returns {Array} array of state objects if successful, null otherwise.
 */
const getStateAllByIds = async (ids) => {
    let rawStates = await knex
        .select('*')
        .from(constants.TABLE_STATE)
        .whereIn(constants.COLUMN_STATE_ID, ids)
        .catch(e => {
            console.error(e);
        });

    if (rawStates.length === 0) return null;

    let states = [];

    for (let rawState of rawStates) {
        let state = new State(
            rawState.stateId,
            rawState.name,
            rawState.treasuryAmt,
            rawState.desc,
            rawState.expenses
        );

        let regions = await regionServices.getRegionByStateId(state.stateID);

        let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

        state.summarise(regions, tradeAgreements);

        states.push(state);
    }

    return states;
}

/**
 * Gets all states of the given IDs.
 * The states are summarised without taking into account trade.
 * @param {Array} ids must be an array of integers.
 * @returns {Array} array of state objects if successful, null otherwise.
 */
const getStateAllByIdsWithoutTrade = async (ids) => {
    let rawStates = await knex
        .select('*')
        .from(constants.TABLE_STATE)
        .whereIn(constants.COLUMN_STATE_ID, ids)
        .catch(e => {
            console.error(e);
        });

    if (rawStates.length === 0) return null;

    let states = [];

    for (let rawState of rawStates) {
        let state = new State(
            rawState.stateId,
            rawState.name,
            rawState.treasuryAmt,
            rawState.desc,
            rawState.expenses
        );

        let regions = await regionServices.getRegionByStateId(state.stateID);

        state.summarise(regions);

        states.push(state);
    }

    return states;
}

/**
 * Gets a state of a given ID.
 * @param {Number} id must be an integer.
 * @returns {State} State object if successful, null otherwise.
 */
const getStateById = async (id) => {
    let rawState = await knex
        .select('*')
        .from(constants.TABLE_STATE)
        .where(constants.COLUMN_STATE_ID, id)
        .catch(e => {
            console.error(e);
        });

    if (rawState.length === 0) return null;

    rawState = rawState[0];

    let state = new State(rawState.stateId, rawState.name, rawState.treasuryAmt, rawState.desc, rawState.expenses);

    let regions = await regionServices.getRegionByStateId(state.stateID);

    let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

    state.summarise(regions, tradeAgreements);

    return state;
}

/**
 * Gets the admin cost of the given state ID.
 * @param {Number} id must be an integer.
 * @returns a positive number if successful, -1 otherwise.
 */
const getAdminCostByStateId = async (id) => {
    let resValue = 0;

    let facilityCount = await facilityServices.getFacilityCountByStateId(id);

    if (facilityCount === -1) {
        resValue = -1;
        return resValue;
    }

    let adminCost = 20 * facilityCount * 0.016 * facilityCount;

    resValue = adminCost;

    return resValue;
}

/**
 * Creates a new state.
 * @param {State} state must be a state object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addState = async (state) => {
    let resStatus = true;

    await knex
        .insert({
            name: state.stateName,
            treasuryAmt: state.treasuryAmt,
            desc: state.desc,
            expenses: state.expenses
        })
        .into(constants.TABLE_STATE)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
};

/**
 * Updates the information of a state.
 * @param {State} state must be a state object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateState = async (state) => {
    let resStatus = true;

    await knex(constants.TABLE_STATE)
        .where({ stateId: state.stateID })
        .update({
            name: state.stateName,
            treasuryAmt: state.treasuryAmt,
            desc: state.desc,
            expenses: state.expenses
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Updates the treasury amount of the state of a given ID.
 * @param {State} state must be a state object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateStateTreasuryByStateId = async (id, treasuryAmt) => {
    let resStatus = true;

    await knex(constants.TABLE_STATE)
        .where({ stateId: id })
        .update({ treasuryAmt: treasuryAmt })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Deletes the state of a given ID. Will fail if the state has regions.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteStateById = async (id) => {
    let resStatus = true;

    let hasRegions = await knex
        .select(1)
        .from(constants.TABLE_REGION)
        .where(constants.COLUMN_STATE_ID, id)
        .catch(e => {
            console.log(e);
            resStatus = false;
        });

    if (hasRegions.length !== 0) {
        resStatus = false;
    } else {
        await knex(constants.TABLE_STATE)
            .where({ stateId: id })
            .del()
            .catch(e => {
                console.error(e);
                resStatus = false;
            });
    }

    return resStatus;
}

exports.getStateList = getStateList;
exports.getStateById = getStateById;
exports.getStateAllByIds = getStateAllByIds;
exports.getStateAllByIdsWithoutTrade = getStateAllByIdsWithoutTrade;
exports.getAdminCostByStateId = getAdminCostByStateId;
exports.addState = addState;
exports.updateState = updateState;
exports.updateStateTreasuryByStateId = updateStateTreasuryByStateId;
exports.getStateAll = getStateAll;
exports.deleteStateById = deleteStateById;

// FOR DEBUGGING
// getStateList()
//     .then(data => console.log(data));
// getStateById(1)
//     .then(data => console.log(data));
//getAdminCostByStateId(7).then(data => console.log(data));
// addState('Cla Lar', 0, 'Kingdom of Cla Lar');
// addState('Cypra', 0);
// addState('Tranos');
// addState('Commonwealth of Five Clans')
//     .then(data => console.log(data));
// addState('Kingdom of Qasim')
//     .catch(e => console.log(e));
// let stateToUpdate = new State(5, 'Cypra', 0, 'Kingdom of Cypra', 0, 0, 0, 0, []);
// updateState(stateToUpdate)
//      .then(console.log("Updated."));
// deleteStateById(8)
//     .then(data => console.log(data));