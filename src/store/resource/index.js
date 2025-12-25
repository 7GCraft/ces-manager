import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

export default {
  state() {
    return {
        viewedRegionResources:[]
    };
  },
  actions: actions,
  mutations: mutations,
  getters: getters,
};
