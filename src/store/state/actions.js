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
        context.commit('addNewState',payload)
      });
    }
}