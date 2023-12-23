export default {
  setAllStates(state, payload) {
    state.stateList = [...payload];
    console.log(state, "new state");
  },
  addNewState(state, payload) {
    state.stateList.push(payload);
  },
  setViewedStateInfo(state, payload) {
    state.viewedState.info = payload;
    console.log("yoo");
  },
  setViewedStateFacilities(state, payload) {
    state.viewedState.facilities = payload;
  },
  setViewedStateResources(state, payload) {
    state.viewedState.resources = payload;
  },
  setViewedStateRegions(state, payload) {
    state.viewedState.regions = payload;
  },
  setViewedStateTradeAgreements(state, payload) {
    state.viewedState.trade = payload;
  },
};
