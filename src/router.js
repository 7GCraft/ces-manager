import {createRouter, createWebHistory} from 'vue-router'
import HomePage from './pages/HomePage'
import StateList from './pages/StateList'
import RegionList from './pages/RegionList'
import TradeAgreement from './pages/TradeAgreement'
import ResourceTier from './pages/ResourceTier'

const router = createRouter({
    history: createWebHistory(),
    routes : [
        {path:'/', component: HomePage, props: true},
        {path:'/state-list', component:StateList},
        {path:'/region-list', component:RegionList, props:true},
        {path:'/trade-agreement',component: TradeAgreement,props:true},
        {path:'/resource-tier', component:ResourceTier, props: true}
    ]
})

export default router;