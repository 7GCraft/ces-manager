export default{
    addNewRegion(state,payload){
        let stateRegions = [...state.regionList];
        let targetState = stateRegions.find(state=> state.stateID === payload.state.stateId)
        console.log(targetState,'designated bruh')
        targetState.Regions !== null ? targetState.Regions.push(payload) : targetState.Regions = [payload]
   
        state.regionList = [...stateRegions]
    },
    setAllRegions(state,payload){
        state.regionList = [...payload]
        console.log(state,'yo')
    },
    setAllBiomes(state,payload){
        state.biomeList = [...payload]
    },
    setAllDevLevels(state,payload){
        state.developmentLevelList = payload
    },
    setAllCorruptionLevels(state,payload){
        state.corruptionLevelList = payload
        console.log('state',state)
    }
}