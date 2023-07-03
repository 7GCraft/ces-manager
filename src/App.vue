<template>
  <the-landing @landed="setLanding" v-if="!isLanded"></the-landing>
  <!--Background Container-->
  <div v-else class="min-h-screen w-screen bg-gray-100 p-10 px-16">
    <!--App Container-->
    <div class="flex flex-row text-center shadow-lg bg-white h-fit">
      <!--Sidebar -->
      <div
        class="w-1/5 flex flex-col bg-gray-300 text-blue-400 border border-white border-x-2"
      >
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
          <a href="">Region List</a>
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <a href="">Trade Agreement</a>
        </div>
        <div class="p-6 border-white border hover:text-white hover:bg-blue-400">
          <a href="">Resource Tiers</a>
        </div>
      </div>
      <!--Content-->
      <div class="w-4/5 flex flex-col">
        <router-view
          :state-list="stateList"
          :date="date"
          @advance-season="advanceSeason"
        ></router-view>
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
      isLanded: false,
      date: {
        season: null,
        year: null,
      },
      stateList: [],
    };
  },
  methods: {
    setLanding() {
      this.isLanded = true;
      localStorage.setItem("landed", true);
    },
    getCurrentSeason() {
      console.log("hello");
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
        this.stateList.sort(function (x, y) {
          if (x.stateName > y.stateName) {
            return 1;
          }
          if (x.stateName < y.stateName) {
            return -1;
          }
          return 0;
        });
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
