import {createRouter, createWebHistory} from 'vue-router'
import HomePage from './pages/HomePage'
import StateList from './pages/StateList'
import RegionList from './pages/RegionList'

const router = createRouter({
    history: createWebHistory(),
    routes : [
        {path:'/', component: HomePage, props: true},
        {path:'/state-list', component:StateList},
        {path:'/region-list', component:RegionList}
    ]
})

export default router;