export default {
  setAllResources(state, payload) {
    console.log("payload of resources", payload);
    state.resourceList = payload;
  },
  setViewedRegionResources(state, payload) {
    state.viewedRegionResources = ["Gold"];
    console.log("dimnt stronk,", payload, state);
  },
};
