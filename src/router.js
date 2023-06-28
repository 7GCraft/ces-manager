import {createRouter, createWebHistory} from 'vue-router'
import HomePage from './pages/HomePage'
import StateList from './pages/StateList'

const router = createRouter({
    history: createWebHistory(),
    routes : [
        {path:'/', component: HomePage, props: true},
        {path:'/state-list', component:StateList}
    ]
})

export default router;