<template>
  <div class="text-center w-full p-4">
    <h4 class="text-3xl p-2 py-4 border-2 border-2-gray-50 shadow-md">
      {{ stateInfo.stateName }}
    </h4>
    <div
      class="mt-4 text-lg font-medium flex flex-row space-x-2 justify-center w-full mx-auto text-center   "
    >
      <ul class="px-8 flex flex-row py-3 border-b-2 w-2/3  mx-auto justify-between ">
        <li class="">
          <router-link
            class=" py-4 border-2 border-transparent   active:dark:hover:text-gray-300"
            to="info"
            >Info</router-link>
        </li>
        <li class="">
          <router-link
            class="  py-4 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="regions"
            >Regions</router-link>
        </li>
        <li class="">
          <router-link
            class="py-4  mx-1 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="facilities"
            >Facilities</router-link>
        </li>
        <li class="">
          <router-link
            class=" py-4  border-transparent mx-1 active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="resources"
            >Resources</router-link>
        </li>
        <li class="">
          <router-link
            class="  py-4 border-b-2 border-transparent mx-1 active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="trade-agreement"
            >Trade</router-link>
        </li>
      </ul>
    </div>
    <router-view :state-info="stateInfo"></router-view>
  </div>
</template>

<script>

export default {
  mounted() {
      console.log(this.stateInfo,'medusa')
  },
  methods() {},
  computed: {
    stateInfo() {
      return this.$store.getters.getViewedStateInfo;
    },
    stateFacilities() {
      return this.$store.getters.getViewedStateFacilities;
    },
    stateResources() {
      return this.$store.getters.getViewedStateResources;
    },
    stateRegions() {
      return this.$store.getters.getViewedStateRegions;
    },
    stateTradeAgreements() {
      return this.$store.getters.getViewedStateTradeAgreements;
    },
  },
};
</script>

<style scoped>
    .active{
        border-bottom: 2px solid blue;
        color: blue;
       font-weight:bold;
    }
</style>