const config = require('./config.json');
const constants = config.constants;
const errors = config.errors;
const knex = require('knex')(config.knexConfig);

const StateListItem = require(config.paths.stateListItemModel);
const State = require(config.paths.stateModel);

/**
 * Gets a list of state IDs and names.
 * @returns {Array} Array of state list items if successful, null otherwise.
 */
const getStateList = async function() {
    let stateList = [];

    let rawStateList = await knex
        .select([constants.COLUMN_STATE_ID, 'name'])
        .from(constants.TABLE_STATE)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });
    
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
const getStateById = async function(id) {
    let rawState = await knex
        .select('*')
        .from(constants.TABLE_STATE)
        .where(constants.COLUMN_STATE_ID, id)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return null;
        });
    
    rawState = rawState[0];
    
    // TODO: INTEGRATE WITH REGIONS AND RESOURCES
    let state = new State(rawState.stateId, rawState.name, rawState.treasuryAmt, rawState.desc, 0, 0, 0, 0, []);

    return state;
}

/**
 * Creates a new state.
 * @param {String} name must be a non-null string.
 * @param {Number} treasuryAmt must be an integer.
 * @param {String} desc is optional. Must be a string.
 * @returns {Number} ID of the new state if successful, -1 otherwise.
 */
const addState = async (name, treasuryAmt = 0, desc = null) => {
    let newStateId = await knex
        .insert({name: name, treasuryAmt: treasuryAmt, desc: desc})
        .into(constants.TABLE_STATE)
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return -1;
        });

    return newStateId[0];
};

/**
 * Updates the information of a state.
 * @param {State} state must be a state object.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateState = async(state) => {
    let test = await knex(constants.TABLE_STATE)
        .where({stateId: state.StateID})
        .update({
            name: state.StateName,
            treasuryAmt: state.TreasuryAmt,
            desc: state.Desc
        })
        .catch(e => {
            console.log(errors.queryError, '\n', e);
            return false;
        });
    
    console.log(test);

    return true;
}

exports.getStateList = getStateList;
exports.getStateById = getStateById;
exports.addState = addState;
exports.updateState = updateState;

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
let stateToUpdate = new State(5, 'Cypra', 0, 'Kingdom of Cypra', 0, 0, 0, 0, []);
updateState(stateToUpdate)
     .then(console.log("Updated."));