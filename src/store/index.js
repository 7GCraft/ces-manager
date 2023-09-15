import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import {createStore} from 'vuex'

import stateModule from './state/index.js'
import regionModule from './region/index.js'
import componentModule from './component/index.js'
import facilityModule from './facility/index.js'
import resourceModule from './resource/index.js'
import tradeModule from './trade/index.js'


export default createStore({
    state(){
        return{
            date: {
                season: null,
                year: null,
              },
              hasLanded: false,

        }
    },
    actions : actions,
    mutations: mutations,
    getters: getters,
    module:{
        state: stateModule,
        region: regionModule,
        component: componentModule,
        facility: facilityModule,
        resource: resourceModule,
        trade: tradeModule
    }
})


