import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./pages/HomePage";
import StateList from "./pages/StateList";
import RegionList from "./pages/RegionList";
import TradeAgreement from "./pages/TradeAgreement";
import ResourceTier from "./pages/ResourceTier";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/home",
      component: HomePage,
      props: true,
      children: [
        { path: "/", component: WelcomePage },
        { path: "/state-list", component: StateList },
        { path: "/region-list", component: RegionList, props: true },
        { path: "/trade-agreement", component: TradeAgreement, props: true },
        { path: "/resource-tier", component: ResourceTier, props: true },
      ],
    },
    {
      path: "state/:stateId",
      component: StateInfo,
      props: true,
      children: [
        { path: "/regions", component: stateRegions },
        { path: "/facilities", component: stateFacilities },
        { path: "/resources", component: stateResources },
        { path: "/trade-agreement", component: stateTrade },
        { path: "/", component: stateGeneral },
      ],
    },
    {
      path: "/region/:regionId",
      component: regionInfo,
      props: true,
      children: [
        { path: "/development", component: regionDevelopment },
        { path: "/corruption", component: regionCorruption },
        { path: "/facilities", component: regionFacilities },
        { path: "/components", component: regionComponents },
        { path:'/',component: regionGeneral}
      ],
    },
  ],
});

export default router;
