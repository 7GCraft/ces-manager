const path = require('path');
const State = require('../models/stateModel')

let dummyStates = [new State('SAL','Sal Set', 10000), new State('ALQ','Al Qasim', 20000), new State('TOY','Toya', 30000)]
const getStateInfo = (id) =>{
    return dummyStates.find(state => state.StateID == id);
}

const getListofState = () => {
    return dummyStates;
}

exports.getStateInfo = getStateInfo;
exports.getListofState = getListofState;