export default {
    getAllRegions(context) {
        window.ipcRenderer.send("Region:getAllRegionsByStateId");
        window.ipcRenderer.once("Region:getAllRegionsByStateIdOK", (e, res) => {
            let regionList = res.sort((a, b) => {
                return a.stateName.localeCompare(b.stateName);
            });
            context.commit('setAllRegions', regionList);
        });
    },
    getAllBiomes(context) {
        window.ipcRenderer.send("Region:getBiomesForAdd");
        window.ipcRenderer.once("Region:getBiomesForAddOK", (e, res) => {
            context.commit('setAllBiomes', res)
        });
    },
    getAllDevLevel(context){
        window.ipcRenderer.send("Region:getDevelopmentForAdd");
      window.ipcRenderer.once("Region:getDevelopmentForAddOK", (e,res) => {
        context.commit('setAllDevLevels',res)
       
      });
    },
    getAllCorruptionLevels(context){
        window.ipcRenderer.send("Region:getCorruptionForAdd");
        window.ipcRenderer.once("Region:getCorruptionForAddOK", (e,res) => {
          context.commit('setAllCorruptionLevels',res)
        })
    }
}