import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

export default {
  state() {
    return {
      regionList: [],
      biomeList: [],
      developmentLevelList: [],
      corruptionLevelList: [],
      viewedRegion: {
        info: {},
        resources: [],
        facilities: [],
        components:[],
      },
    };
  },
  actions: actions,
  mutations: mutations,
  getters: getters,
};
