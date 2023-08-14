<template>
  <the-landing @landed="setLanding" v-if="!hasLanded"></the-landing>
  <!--Background Container-->
  <div v-else class="min-h-screen w-screen bg-gray-100 p-10 px-16 z-0">
    <!--App Container-->
    <div class="flex flex-row text-center shadow-lg bg-white h-fit">
      <!--Sidebar -->
      <div
        class="hidden w-1/5 md:flex flex-col justify-between bg-gray-300 text-blue-400 border border-white border-x-2"
      >
      <div class="sticky left-0 top-0">
        <div class="p-2 border-white border flex justify-center">
          <img src="./assets/ces_logo.png" class="h-24 hover:scale-110" />
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="/">Home</router-link>
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="state-list">State List</router-link>
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="region-list">Region List</router-link>
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="trade-agreement">Trade Agreement</router-link>
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="resource-tier">Resource Tier</router-link>
        </div>
      </div>
      </div>
      <!--Content-->
      <div class="md:w-4/5 w-full flex flex-col">
        <router-view
          :state-list="stateList"
          :region-data="stateRegion"
          :resource-list="resourceList"
          :date="date"
          :biome-list="biomeList"
          :corruption-list="corruptionLevelList"
          :development-list="developmentLevelList"
          @advance-season="advanceSeason"
          @add-region="addNewRegion"
          @add-state="addNewState"
          @open-state="openState()"
          @save-new-resources="addNewResources"
        ></router-view>
      </div>
    </div>
    <!--Sidebar Menu for small screen-->
    <Teleport to="#app">
    <div class="md:hidden flex flex-row 
  justify-between sticky text-center bottom-0
  bg-gray-200 mx-810 text-blue-400 border-2 border-white space-x-0">
    
        <div class="flex-1 py-4 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="/">Home</router-link>
        </div>
        <div class="flex-1 py-4 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="state-list">State List</router-link>
        </div>
        <div class="flex-1 py-4 border-white border hover:text-white hover:bg-blue-400">
          <router-link to="region-list">Region List</router-link>
        </div>
        <div class="flex-1 py-4 border-white border hover:text-white hover:bg-blue-400">
          <a href="">Trade Agreement</a>
        </div>
        <div class="flex-1 py-4 border-white border hover:text-white hover:bg-blue-400">
          <a href="">Resource Tiers</a>
        </div>
    </div>
  </div>
</template>

<script>
import TheLanding from "./pages/TheLanding.vue";
export default {
  name: "App",
  components: {
    TheLanding,
  },
  data() {
    return {
      hasLanded: false,
    };
  },
  methods: {
    addNewState(data){
      let addStateData = {...data}
      console.log(addStateData,'report')
      window.ipcRenderer.send("State:addState",addStateData);
      window.ipcRenderer.once("State:addStateOK", (e, res) => {
        console.log(res,'state added')
      });
    },
    addNewRegion(data){
      const {regionName,stateId,corruptionId,biomeId,developmentId, population, taxRate, desc} = data
      let addRegionObj = {
        biome: {biomeId},
        corruption: {corruptionId},
        desc,
        development: {developmentId},
        population,
        regionName,
        state: {stateId},
        taxRate
      }
      window.ipcRenderer.send("Region:addRegion",JSON.stringify(addRegionObj));
      window.ipcRenderer.once("Region:addRegionOK", (e, res) => {
        console.log(res,'legiun added')
      });
    },
    addNewResources(newResourceList){
      console.log(newResourceList,'nueva resource list')
      window.ipcRenderer.send("Resource:updateResourceAll",JSON.stringify(newResourceList));
      window.ipcRenderer.once("Resource:updateResourceAllOK", (e, res) => {
        console.log(res,'legiun added')
      });
    },
    setLanding() {
      this.hasLanded = true;
      localStorage.setItem("landed", true);
    },
    getAllRegions() {
      this.$store.dispatch("getAllRegions");
    },
    getCurrentSeason() {
      this.$store.dispatch("getCurrentDate");
    },
    getStateList() {
      this.$store.dispatch("getAllStates");
    },
    getAllResources() {
      this.$store.dispatch("getAllResources");
    },
    getAllBiomes() {
      this.$store.dispatch("getAllBiomes");
    },
    getAllDevelopmentLevel() {
      this.$store.dispatch("getAllDevLevel");
    },
    getAllCorruptionLevel() {
      this.$store.dispatch("getAllCorruptionLevels");
    },
    initializeHomeData() {
      this.getCurrentSeason();
      this.getStateList();
      this.getAllRegions();
      this.getAllResources();
      this.getAllBiomes();
      this.getAllCorruptionLevel();
      this.getAllDevelopmentLevel();
    },
    initializeStateInfoData(id) {
      this.$store.dispatch("getStateInfo", id);
      this.$store.dispatch("getStateFacilities", id);
      this.$store.dispatch("getStateTrade", id);
    },
    navigateToPage() {
      const route = window.process.argv[window.process.argv.length - 2];
      console.log(route, "isthis route");
      if (route.includes("Home")) {
        this.initializeHomeData();
        this.$router.push("/home/welcome");
      } else if (route.includes("State")) {
        const stateId = route.split("-")[1];
        this.$router.push(`/state/${stateId}/info`);
        this.initializeStateInfoData(stateId);
      } else {
        const regionId = route.split("-")[1];
        this.$router.push(`/region/${regionId}/info`);
      }
    },
    openStatePage(id) {
      console.log("the id", id);
      window.ipcRenderer.send("State:openStatePage", id);
    },
    descendingPropertySort(arr, propertyName) {
      arr.sort(function (x, y) {
        if (x[propertyName] > y[propertyName]) {
          return 1;
        }
        if (x[propertyName] < y[propertyName]) {
          return -1;
        }
        return 0;
      });
    },
  },
  mounted() {
    if (localStorage.getItem("landed")) {
      this.hasLanded = true;
    }
    this.initializeHomeData();

    this.navigateToPage();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
