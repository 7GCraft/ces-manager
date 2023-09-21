export default {
    getAllStates(context){
        window.ipcRenderer.send("State:getStateList");
        window.ipcRenderer.once("State:getStateListOK", (e, res) => {
        let stateList = res.sort((a,b)=>{
            return a.stateName.localeCompare(b.stateName);
          });
          context.commit('setAllStates',stateList)
      });
    },
    addNewState(context,payload){
      console.log(payload)
      window.ipcRenderer.send("State:addState",payload);
      window.ipcRenderer.once("State:addStateOK", () => {
        context.dispatch('getAllRegions')
        context.commit('addNewState',payload)
      });
    },
    getStateRegions(context,payload){
      window.ipcRenderer.send("State:getRegionsForState",payload);
      window.ipcRenderer.once("State:getRegionsForStateOK",(e,res)=>{
        context.commit('setViewedStateInfo',res)
        console.log('we went this far',res)
      })
    },
    getStateInfo(context,payload){
      window.ipcRenderer.send("State:getStateInfo",payload);
      window.ipcRenderer.once("State:getStateInfoOK",(e,res)=>{
        context.commit('setViewedStateInfo',res)
        console.log('we went this far',res)
      })
    }
}