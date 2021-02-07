const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const StateListItem = require(config.paths.stateListItemModel);
const State = require(config.paths.stateModel);

const getStateList = async function() {
    let stateList = [];

    let rawStateList = await knex
        .select([constants.COLUMN_STATE_ID, 'name'])
        .from(constants.TABLE_STATE);
    
    for (let rawState of rawStateList) {
        let state = new StateListItem(rawState.stateId, rawState.name);

        stateList.push(state);
    }

    return stateList;
}

const getStateById = async function(id) {
    let rawState = await knex
        .select('*')
        .from(constants.TABLE_STATE)
        .where(constants.COLUMN_STATE_ID, id);
    
    rawState = rawState[0];
    
    let state = new State(rawState.stateId, rawState.name, rawState.treasuryAmt, rawState.desc, 0, 0, 0, 0, []);

    return state;
}

exports.getStateList = getStateList;
exports.getStateById = getStateById;

// FOR DEBUGGING
// getStateList()
//     .then(data => console.log(data));
// getStateById(1)
//     .then(data => console.log(data));