export default{
    setAllResources(state,payload){
        console.log('payload of resources',payload)
        state.resourceList = payload
    }
}