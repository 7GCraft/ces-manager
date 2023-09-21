import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/Home/HomePage";
import homeStart from './pages/Home/sections/HomeStart'
import stateList from "./pages/Home/sections/StateList";
import regionList from "./pages/Home/sections/RegionList";
import tradeAgreement from "./pages/Home/sections/TradeAgreement";
import resourceTier from "./pages/Home/sections/ResourceTier";

import RegionPage from './pages/RegionInfo/RegionPage'
import regionComponents from './pages/RegionInfo/sections/RegionComponents'
import regionDevelopment from './pages/RegionInfo/sections/RegionDevelopment'
import regionFacilities from './pages/RegionInfo/sections/RegionFacilities'
import regionInfo from './pages/RegionInfo/sections/RegionInfo'
import regionCorruption from './pages/RegionInfo/sections/RegionCorruption'

import StatePage from './pages/StateInfo/StatePage'
import stateInfo from './pages/StateInfo/section/StateInfo'
import stateRegions from './pages/StateInfo/section/StateRegions'
import stateFacilities from './pages/StateInfo/section/StateFacilities'
import stateTrade from './pages/StateInfo/section/StateTrade'
import stateResources from './pages/StateInfo/section/StateResources'



const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/home",
      component: HomePage,
      props: true,
      children: [
        { path: "welcome", component: homeStart },
        { path: "state-list", component: stateList },
        { path: "region-list", component: regionList, props: true },
        { path: "trade-agreement", component: tradeAgreement, props: true },
        { path: "resource-tier", component: resourceTier, props: true },
      ],
    },
    {
      path: "/state/:stateId",
      component: StatePage,
      props: true,
      children: [
        { path: "regions", component: stateRegions },
        { path: "facilities", component: stateFacilities },
        { path: "resources", component: stateResources },
        { path: "trade-agreement", component: stateTrade },
        { path: "info", component: stateInfo },
      ],
    },
    {
      path: "/region/:regionId",
      component: RegionPage,
      props: true,
      children: [
        { path: "/development", component: regionDevelopment },
        { path: "/corruption", component: regionCorruption },
        { path: "/facilities", component: regionFacilities },
        { path: "/components", component: regionComponents },
        { path:'/',component: regionInfo}
      ],
    },
  ],
});

export default router;
