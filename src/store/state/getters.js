export default {
    getStateList(state){
        return state.stateList
    },
    getViewedStateInfo(state){
        return state.viewedStateInfo;
    },
    getViewedStateRegions(state){
        return state.viewedStateInfo.regions
    },
    getViewedStateFacilities(state){
        return state.viewedStateInfo.facilities;
    },
    getViewedStateResources(state){
        return state.viewedStateInfo.resources;
    },
    getViewedStateTradeAgreements(state){
        return state.viewedStateInfo.tradeAgreements;
    }
}