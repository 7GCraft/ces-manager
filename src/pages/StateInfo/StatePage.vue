<template>
  <div class="text-center w-full p-4">
    <h4 class="text-3xl p-2 py-4 border-2 border-2-gray-50 shadow-md">
      {{ stateInfo.stateName }}
    </h4>
    <div class="mt-4 text-lg font-medium flex flex-row space-x-2 justify-center w-full mx-auto text-center   ">
      <ul class="px-8 flex flex-row py-3 border-b-2 w-2/3  mx-auto justify-between ">
        <li class="">
          <router-link class=" py-4 border-2 border-transparent   active:dark:hover:text-gray-300"
            to="info">Info</router-link>
        </li>
        <li class="">
          <router-link
            class="  py-4 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="regions">Regions</router-link>
        </li>
        <li class="">
          <router-link
            class="py-4  mx-1 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="facilities">Facilities</router-link>
        </li>
        <li class="">
          <router-link
            class=" py-4  border-transparent mx-1 active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="resources">Resources</router-link>
        </li>
        <li class="">
          <router-link
            class="  py-4 border-b-2 border-transparent mx-1 active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="trade-agreement">Trade</router-link>
        </li>
      </ul>
    </div>
    <router-view :state-info="stateInfo" :state-resources-by-region="groupedStateResources"
      :state-resource-count="stateResourceCount" :state-facility-data="groupedStateFacilities"></router-view>
  </div>
</template>

<script>

export default {
  mounted() {
    console.log(this.stateInfo, 'medusa')
  },
  data(){
    return {
      
    }
  },
  methods: {
    groupDataByRegion(data) {
      const groupedData = {};
      for (const objEl of data) {
        const regionName = objEl.regionName;
        if (!groupedData[regionName]) {
          groupedData[regionName] = []
        }
        groupedData[regionName].push(objEl)
      }
      return structuredClone(groupedData)
    },
    countResource(data) {
      let resourceCount = {};
      for (let resource of data) {
        if (!resourceCount[resource.value]) {
          resourceCount[resource.value] = 0;
        }
        resourceCount[resource.value]++
      }
      return resourceCount;
    },

  getFacilityCategory(item) {
    switch (true) {
    case item.includes('barrack') ||
         item.includes('archer') ||
         item.includes('stable') ||
         item.includes('blacksmith') ||
         item.includes('drill') ||
         item.includes('siege') ||
         item.includes('port'):
      return 'Military';

    case item.includes('market') ||
         item.includes('kiln') ||
         item.includes('maker') ||
         item.includes('pleasure') ||
         item.includes('tavern') ||
         item.includes('theatre') ||
         item.includes('arena') ||
         item.includes('smith'):
      return 'Economy';

    case item.includes('garden') ||
         item.includes('region') ||
         item.includes('monument') ||
         item.includes('library') ||
         item.includes('university') ||
         item.includes('school') ||
         item.includes('granary') ||
         item.includes('canal'):
      return 'Government';

    case item.includes('farm') ||
         item.includes('trader') ||
         item.includes('mine') ||
         item.includes('mill') ||
         item.includes('plantation') ||
         item.includes('potter') ||
         item.includes('lumber') ||
         item.includes('horse farm') ||
         item.includes('well') ||
         item.includes('vineyard') ||
         item.includes('translator') ||
         item.includes('quarry'):
      return 'Food and Resource';

    default:
      return 'Misc';
  }
  },
  groupFacilitiesByCategory(facilityData){
   
    let newFacilities = {};
      for(let facility of facilityData){

        const facilityName = facility.facilityName.toLowerCase()
        let facilityCategory = this.getFacilityCategory(facilityName)
        if(!newFacilities[facilityCategory]){
          newFacilities[facilityCategory] = [];
        }
        newFacilities[facilityCategory].push(facility)
      }
    
    return newFacilities
  },
  groupFacilityByRegion(facilityData){
    let data = {...facilityData}
    for(let category in data){
      data[category] = this.groupDataByRegion(data[category])
    }
    return data;
  },
},
  computed: {
    stateInfo() {
      return this.$store.getters.getViewedStateInfo;
    },
    groupedStateFacilities() {
      return this.groupFacilityByRegion(this.groupFacilitiesByCategory(this.$store.getters.getViewedStateFacilities));
    },
    groupedStateResources() {
      return this.groupDataByRegion(this.$store.getters.getViewedStateResources);
    },
    stateResourceCount() {
      return this.countResource(this.$store.getters.getViewedStateResources)
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
.active {
  border-bottom: 2px solid blue;
  color: blue;
  font-weight: bold;
}
</style>