export default {
  getStateFacilities(context, payload) {
    window.ipcRenderer.send("Facility:getFacilitiesByState", payload);
    window.ipcRenderer.once("Facility:getFacilitiesByStateOK", (e, res) => {
      context.commit("setViewedStateFacilities", res);
    });
  },
};
