const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const StateListItem = require(config.paths.stateListItemModel);

const getStateList = async function() {
    let stateList = [];

    let rawStateList = await knex
        .select(['stateId', 'name'])
        .from(constants.TABLE_STATE);
    
    for (let rawState of rawStateList) {
        let state = new StateListItem(rawState.stateId, rawState.name);

        stateList.push(state);
    }

    return stateList;
}

exports.getStateList = getStateList;

// FOR DEBUGGING
// getStateList()
//     .then(data => console.log(data));