export default{
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