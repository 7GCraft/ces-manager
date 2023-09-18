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
          :region-data="regionList"
          :resource-list="resourceList"
          :date="date"
          :biome-list="biomeList"
          :corruption-list="corruptionLevelList"
          :development-list="developmentLevelList"
          @advance-season="advanceSeason"
          @add-region="addNewRegion"
          @add-state="addNewState"
          @open-state="openState()"
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
  </Teleport>
   
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
  computed:{
    date(){
      return this.$store.getters.getDate
    },
    regionList(){
      return this.$store.getters.getRegionList
    },
    stateList(){
      return this.$store.getters.getStateList
    },
    resourceList(){
      return this.$store.getters.getResourceList
    },  
    biomeList(){
      return this.$store.getters.getBiomeList
    },
    developmentLevelList(){
      return this.$store.getters.getDevLevelList
    },
    corruptionLevelList(){
      return this.$store.getters.getCorruptionLevelList
    }
  },
  methods: {
    addNewState(data){
      let addStateData = {...data}
      this.$store.dispatch('addNewState',addStateData)
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
      this.$store.dispatch('addNewRegion',JSON.stringify(addRegionObj))
    },
    setLanding() {
      this.hasLanded = true;
      localStorage.setItem("landed", true);
    },
    getAllRegions(){
     this.$store.dispatch('getAllRegions');
      console.log(this.$store.getters,'get it all')
    },
    getCurrentSeason() {
      this.$store.dispatch('getCurrentDate');
    },
    getStateList() {
      this.$store.dispatch('getAllStates')
    },
    getAllResources(){
      this.$store.dispatch('getAllResources')
    },
    getAllBiomes(){
      this.$store.dispatch('getAllBiomes');
    },
    getAllDevelopmentLevel(){
      this.$store.dispatch('getAllDevLevel');
    },
    getAllCorruptionLevel(){
      this.$store.dispatch('getAllCorruptionLevels')
    },
    openState(id){
      window.ipcRenderer.send("State:openStatePage",id);
      window.ipcRenderer.once("State:openStatePageOK", (e,res) => {
        console.log(res)
        this.$router.push('/region-list')
      });
    }
    ,
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
      this.$store.dispatch('advanceSeason');
    },
  },
  mounted() {
    if (localStorage.getItem("landed")) {
      this.hasLanded = true;
    }
    if(window.ipcRenderer){
      this.getCurrentSeason();
      this.getStateList();
      this.getAllRegions();
      this.getAllResources();
      this.getAllBiomes()
      this.getAllCorruptionLevel()
      this.getAllDevelopmentLevel()
    }else{
      this.$router.push('region-list')
    }
 
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
