<template>
    <div class="mt-4 flex flex-col space-y-2 max-w-3xl mx-auto my-1 mb-4 w-full">
   <div class="text-center w-full p-4">
  <h4 class="text-3xl p-2 py-4 border-2 border-2-gray-50 shadow-md">
      {{ regionInfo.regionName }}
    </h4>
    </div>
    <div
      class="my-4 text-lg font-medium flex flex-row space-x-2 justify-center w-full mx-auto text-center"
    >
      <ul
        class="px-8 flex flex-row py-3 border-b-2 w-3/4 mx-auto justify-between"
      >
        <li class="">
          <router-link
            class="py-4 border-2 border-transparent active:dark:hover:text-gray-300 " 
            to="info"
            >Info</router-link
          >
        </li>
        <li class="">
          <router-link
            class="py-4 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="regions"
            >Facilities</router-link
          >
        </li>
        <li class="">
          <router-link
            class="py-4 mx-1 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="facilities"
            >Components</router-link>
          >
        </li>
        
      </ul>
    </div>
      <router-view :region-info="regionInfo"></router-view>
    </div>

 
</template>

<script>
export default {
  mounted() {
    console.log(this.regionInfo,'essence of region info');
  },
  computed:{
        regionInfo(){
            return this.$store.getters.getViewedRegionInfo;
        },
      
    }
};
</script>
