export default{
    setAllStates(state,payload){
        state.stateList = [...payload]
        console.log(state,'new state')
    },
    addNewState(state,payload){
        state.stateList.push(payload)
    },
    setViewedStateInfo(state,payload){
        state.viewedStateInfo = payload;
        console.log('yoo')
    }

}