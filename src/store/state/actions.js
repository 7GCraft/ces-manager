export default {
    getAllStates(context){
        window.ipcRenderer.send("State:getStateList");
        window.ipcRenderer.once("State:getStateListOK", (e, res) => {
        let stateList = res.sort((a,b)=>{
            return a.stateName.localeCompare(b.stateName);
          });
          context.commit('setAllStates',stateList)
      });
    }
}