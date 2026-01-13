export default {
  getAllResources(context) {
    window.ipcRenderer.send("Resource:getAllResourceTiers");
    window.ipcRenderer.once("Resource:getAllResourceTiersOK", (e, res) => {
      context.commit("setAllResources", res);
    });
  },
  getResourcesByStateId(context, payload) {
    window.ipcRenderer.send("Resource:getAllResourcesByStateId", payload);
    window.ipcRenderer.once("Resource:getAllResourcesByStateIdOK", (e, res) => {
      console.log("rasengan hebat", res);
      context.commit("setViewedStateResources", res);
    });
  },
  getResourceByRegionId(context, payload) {
    console.log("lapis la la la", payload);
    window.ipcRenderer.send("Resource:getAllResourcesByRegionId", {
      stateId: payload.stateId,
      regionId: payload.regionId,
    });
    window.ipcRenderer.once(
      "Resource:getAllResourcesByRegionIdOK",
      (e, res) => {
        console.log("lapis la la la", res);
        context.commit("setViewedRegionResources", res);
      }
    );
  },
};
