import { createRouter, createWebHistory } from 'vue-router'


import HomePage from './pages/Home/HomePage'
import WelcomePage from './pages/Home/WelcomePage'
import StateList from './pages/Home/StateList'
import RegionList from './pages/Home/RegionList'
import TradeAgreement from './pages/Home/TradeAgreement'
import ResourceTier from './pages/Home/ResourceTier'

import StateInfo from './pages/StateInfo/StateInfo'

import RegionInfo from './pages/RegionInfo/RegionInfo'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/home', component: HomePage, props: true,
            children: [
                {path: '/landing', component: WelcomePage, props: true},
                { path: '/state-list', component: StateList },
                { path: '/region-list', component: RegionList, props: true },
                { path: '/trade-agreement', component: TradeAgreement, props: true },
                { path: '/resource-tier', component: ResourceTier, props: true }
            ]
        },
        {
            path:'/state-info/:stateId',component: StateInfo, props: true,
            children: [
                { path: '/general', component: StateList },
                { path: '/regions', component: StateList },
                { path: '/facilities', component: StateList },
                { path: '/resources', component: StateList },
                { path: '/trade-agreements', component: StateList },
            ]
        },
        {
            path:'/region-info/:regionId',component: RegionInfo, props: true,
            children: [
                { path: '/general', component: StateList },
                {path: '/regions'}
            ]
        }
    ]
})

export default router;