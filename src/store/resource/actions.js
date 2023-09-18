export default{
    getAllResources(context){
        window.ipcRenderer.send("Resource:getAllResourceTiers");
      window.ipcRenderer.once("Resource:getAllResourceTiersOK", (e,res) => {
        context.commit('setAllResources',res)
      });
    }
}