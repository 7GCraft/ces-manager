import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

export default {
  state() {
    return {
      stateList: [],
      viewedState: {
        info: {},
        resources: [],
        regions: [],
        facilities: [],
        trade: [],
      },
    };
  },
  actions: actions,
  mutations: mutations,
  getters: getters,
};
