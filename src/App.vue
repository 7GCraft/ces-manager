<template>
  <the-landing @landed="setLanding" v-if="!isLanded"></the-landing>
  <!--Background Container-->
  <div v-else class="min-h-screen w-screen bg-gray-100 p-10 px-16">
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
          @advance-season="advanceSeason"
        ></router-view>
      </div>
    </div>
    
   
  </div>
  <!--Sidebar Menu for small screen-->
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
      isLanded: false,
      date: {
        season: null,
        year: null,
      },
      stateList: [],
      stateRegion: [],
      resourceList:[]
    };
  },
  methods: {
    setLanding() {
      this.isLanded = true;
      localStorage.setItem("landed", true);
    },
    getAllRegions(){
      window.ipcRenderer.send("Region:getAllRegionsByStateId");
      window.ipcRenderer.once("Region:getAllRegionsByStateIdOK", (e, res) => {
        this.stateRegion = res;
        this.descendingPropertySort(this.stateRegion,'stateName')
        this.stateRegion.forEach(state=> this.descendingPropertySort(state.Regions,'RegionName'))
      });
    },
    getCurrentSeason() {
      window.ipcRenderer.send("General:getCurrentSeason");
      window.ipcRenderer.once("General:getCurrentSeasonOK", (e, res) => {
        this.date.season = res.season;
        this.date.year = res.year;
      });
    },
    getStateList() {
      window.ipcRenderer.send("State:getStateList");
      window.ipcRenderer.once("State:getStateListOK", (e, res) => {
        this.stateList = res;
        this.descendingPropertySort(this.stateList,'stateName')
      });
    },
    getAllResources(){
      window.ipcRenderer.send("Resource:getAllResourceTiers");
      window.ipcRenderer.once("Resource:getAllResourceTiersOK", (e,res) => {
        this.resourceList = res;
      });
 
     
    },
    descendingPropertySort(arr,propertyName){
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
    advanceSeason() {
      window.ipcRenderer.send("General:advancingSeason");
      window.ipcRenderer.once("General:advancingSeasonOK", () => {
        this.getCurrentSeason();
      });
    },
  },
  mounted() {
    if (localStorage.getItem("landed")) {
      this.isLanded = true;
    }
    this.getCurrentSeason();
    this.getStateList();
    this.getAllRegions();
   
    this.getAllResources();
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
