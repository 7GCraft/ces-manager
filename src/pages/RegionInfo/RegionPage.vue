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
            class="py-4 border-2 border-transparent active:dark:hover:text-gray-300"
            to="info"
            >Info</router-link
          >
        </li>
        <li class="">
          <router-link
            class="py-4 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="facilities"
            >Facilities</router-link
          >
        </li>
        <li class="">
          <router-link
            class="py-4 mx-1 border-transparent active: rounded-t-lg hover:text-gray-600 hover:border-gray-300 active:dark:hover:text-gray-300"
            to="facilities"
            >Components</router-link
          >
          >
        </li>
      </ul>
    </div>
    <router-view
      :region-info="regionInfo"
      :region-facility-data="groupedRegionFacility"
    ></router-view>
  </div>
</template>

<script>
export default {
  mounted() {
    setTimeout(() => {
      console.log(this.groupedRegionFacility, "essence of region info");
    }, 2000);
  },
  computed: {
    regionInfo() {
      return this.$store.getters.getViewedRegionInfo;
    },
    regionFacility() {
      return this.$store.getters.getViewedRegionFacilities;
    },
    groupedRegionFacility() {
      return this.groupFacilitiesByCategory(this.regionFacility);
    },
  },
  methods: {
    groupFacilitiesByCategory(facilityData) {
      let newFacilities = {};
      for (let facility of facilityData) {
        const facilityName = facility.facilityName.toLowerCase();
        let facilityCategory = this.getFacilityCategory(facilityName);
        if (!newFacilities[facilityCategory]) {
          newFacilities[facilityCategory] = [];
        }
        newFacilities[facilityCategory].push(facility);
      }

      return newFacilities;
    },

    getFacilityCategory(item) {
      switch (true) {
        case item.includes("farm") ||
          item.includes("chicken") ||
          item.includes("trader") ||
          item.includes("mine") ||
          item.includes("mill") ||
          item.includes("plantation") ||
          item.includes("potter") ||
          item.includes("lumber") ||
          item.includes("horse farm") ||
          item.includes("well") ||
          item.includes("vineyard") ||
          item.includes("translator") ||
          item.includes("quarry") ||
          item.includes("fishing"):
          return "food and resource";

        case item.includes("market") ||
          item.includes("kiln") ||
          item.includes("maker") ||
          item.includes("pleasure") ||
          item.includes("tavern") ||
          item.includes("theatre") ||
          item.includes("arena") ||
          item.includes("smith") ||
          item.includes("trade"):
          return "economy";

        case item.includes("barrack") ||
          item.includes("archer") ||
          item.includes("stable") ||
          item.includes("blacksmith") ||
          item.includes("drill") ||
          item.includes("siege") ||
          item.includes("port"):
          return "military";

        case item.includes("garden") ||
          item.includes("region") ||
          item.includes("monument") ||
          item.includes("library") ||
          item.includes("university") ||
          item.includes("school") ||
          item.includes("granary") ||
          item.includes("canal"):
          return "government";

        default:
          return "misc";
      }
    },
  },
};
</script>
