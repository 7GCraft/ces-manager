import actions from './actions'
import mutations from './mutations'
import getters from './getters'


export default {
    state(){
        return{
            regionList: [],
            biomeList: [],
            developmentLevelList:[],
            corruptionLevelList:[]
        }
    },
    actions : actions,
    mutations: mutations,
    getters: getters,
}


