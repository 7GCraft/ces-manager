export default{
    getAllResources(context){
        window.ipcRenderer.send("Resource:getAllResourceTiers");
      window.ipcRenderer.once("Resource:getAllResourceTiersOK", (e,res) => {
        context.commit('setAllResources',res)
      });
    },
    getResourcesByStateId(context,payload){
      
      window.ipcRenderer.send("Resource:getAllResourcesByStateId",payload);
      window.ipcRenderer.once("Resource:getAllResourcesByStateIdOK",(e,res)=>{
        console.log('rasengan hebat',res)
        context.commit('setViewedStateResources',res)
      });
    }
}