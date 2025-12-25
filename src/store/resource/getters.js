export default {
  getResourceList(state) {
    return state.resourceList;
  },

  getRegionResource(state){
    console.log("explin how sttes work",state)
    return state.viewedRegionResources;
  }
};
