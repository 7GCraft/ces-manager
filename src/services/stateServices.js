const path = require('path');
const State = require('../models/stateModel')

let dummyState = new State('SAL','Sal Set', 10000);

const getStateInfo = (id) =>{
    if(dummyState.StateID == id){
        return dummyState;
    }
}

exports.getStateInfo = getStateInfo;