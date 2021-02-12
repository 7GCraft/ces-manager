const config = require('./config.json');
const constants = config.constants;
const regionServices = require(config.paths.regionServices);
const knex = require('knex')(config.knexConfig);

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
    
    let state = new State(rawState.stateId, rawState.name, rawState.treasuryAmt, rawState.desc);
    
    let regions = await regionServices.getRegionByStateId(state.stateID);

    state.summarise(regions);

    return state;
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
            desc: state.desc
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
        .where({stateId: state.stateID})
        .update({
            name: state.stateName,
            treasuryAmt: state.treasuryAmt,
            desc: state.desc
        })
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
            .where({stateId: id})
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
exports.addState = addState;
exports.updateState = updateState;
exports.deleteStateById = deleteStateById;

// FOR DEBUGGING
// getStateList()
//     .then(data => console.log(data));
// getStateById(1)
//     .then(data => console.log(data));
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