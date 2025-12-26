export default {
  getStateFacilities(context, payload) {
    window.ipcRenderer.send("Facility:getFacilitiesByState", payload);
    window.ipcRenderer.once("Facility:getFacilitiesByStateOK", (e, res) => {
      context.commit("setViewedStateFacilities", res);
    });
  },
  getRegionFacilities(context, payload) {
    window.ipcRenderer.send("Facility:getFacilitiesByRegion", payload);
    window.ipcRenderer.once("Facility:getFacilitiesByRegionOK", (e, res) => {
      context.commit("setViewedRegionFacilities", res);
      console.log(res, "lllslslssssssssssssssss");
    });
  },
};
