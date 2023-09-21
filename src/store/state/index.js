import actions from './actions'
import mutations from './mutations'
import getters from './getters'


export default {
    state(){
        return{
            stateList: [],
            viewedStateInfo: {},
        }
    },
    actions : actions,
    mutations: mutations,
    getters: getters,
 
}


