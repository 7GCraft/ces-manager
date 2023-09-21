<template>
  <the-landing @landed="setLanding" v-if="!hasLanded"></the-landing>
  <!--Background Container-->
  <div v-else class="min-h-screen w-screen bg-gray-100 p-10 px-16 z-0">
    <!--App Container-->
    <div class="flex flex-row text-center shadow-lg bg-white h-fit">
      <!--Sidebar -->
      <router-view 
      @openRegionPage="openRegionPage"
      @openStatePage="openStatePage"></router-view>
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
    setLanding() {
      this.hasLanded = true;
      localStorage.setItem("landed", true);
    },
    getAllRegions() {
      this.$store.dispatch('getAllRegions');
    },
    getCurrentSeason() {
      this.$store.dispatch('getCurrentDate');
    },
    getStateList() {
      this.$store.dispatch('getAllStates')
    },
    getAllResources() {
      this.$store.dispatch('getAllResources')
    },
    getAllBiomes() {
      this.$store.dispatch('getAllBiomes');
    },
    getAllDevelopmentLevel() {
      this.$store.dispatch('getAllDevLevel');
    },
    getAllCorruptionLevel() {
      this.$store.dispatch('getAllCorruptionLevels')
    },
    initializeHomeData() {
      this.getCurrentSeason();
      this.getStateList();
      this.getAllRegions();
      this.getAllResources();
      this.getAllBiomes()
      this.getAllCorruptionLevel()
      this.getAllDevelopmentLevel()
    },
    initializeStateInfoData(id){
      this.$store.dispatch('getStateInfo',id)
    },
    navigateToPage(){
      const route = window.process.argv[window.process.argv.length-2];
      console.log(route,'isthis route')
      if(route.includes('Home')){
        this.initializeHomeData();
        this.$router.push('/home/welcome')
      }else if(route.includes('State')){
        const stateId = route.split('-')[1]
        this.$router.push(`/state/${stateId}/info`);
        this.initializeStateInfoData(stateId);
      }else{
        const regionId = route.split('-')[1]
        this.$router.push(`/region/${regionId}/info`);
      }
     
    },
    openStatePage(id) {
      console.log('the id', id)
      window.ipcRenderer.send("State:openStatePage", id);
    }
    ,
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
