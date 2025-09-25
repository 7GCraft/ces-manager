export default {
  getCurrentDate(context) {
    let resultantDate = {};
    window.ipcRenderer.send("General:getCurrentSeason");
    window.ipcRenderer.once("General:getCurrentSeasonOK", (e, res) => {
      let { season, year } = res;
      resultantDate.season = season;
      resultantDate.year = year;
      context.commit("setDate", resultantDate);
    });
  },
  advanceSeason(context) {
    window.ipcRenderer.send("General:advancingSeason");
    window.ipcRenderer.once("General:advancingSeasonOK", () => {
      context.dispatch("getCurrentDate");
    });
  },
  openRegionPage(context,id) {
    console.log(context,'he who is alexander')
    window.ipcRenderer.send("Region:openRegionPage",id);
    window.ipcRenderer.once("Region:openRegionPageOK", () => {
      console.log("Open Region Success")
    });
  }
};
