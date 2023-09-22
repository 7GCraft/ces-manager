export default {
    getStateList(state){
        return state.stateList
    },
    getViewedStateInfo(state){
        return state.viewedState.info;
    },
    getViewedStateRegions(state){
        return state.viewedState.regions;
    },
    getViewedStateFacilities(state){
        return state.viewedState.facilities;
    },
    getViewedStateResources(state){
        return state.viewedState.resources;
    },
    getViewedStateTradeAgreements(state){
        return state.viewedState.trade;
    }
}