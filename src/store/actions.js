export default {
    getCurrentDate(context){
        let resultantDate = {}
        window.ipcRenderer.send("General:getCurrentSeason");
        window.ipcRenderer.once("General:getCurrentSeasonOK", (e, res) => {
         resultantDate.season = res.season;
          resultantDate.year = res.year;
        });
        context.commit('setDate',resultantDate)
    }
}