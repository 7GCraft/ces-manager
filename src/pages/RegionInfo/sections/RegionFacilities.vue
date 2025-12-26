<template>
  <div
    class="mt-4 flex flex-col space-y-2 max-w-8xl mx-auto my-1 mt-4 mb-4 px-10"
  >
    <h4
      class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/4 mx-auto bg-havelockBlue text-white py-1 tracking-wider"
    >
      State Facilities
    </h4>
    <div class="grid grid-cols-2 gap-y-10 gap-x-4">
      <div
        class="text-left px-4 flex flex-col space-y-1 h-fit border-gray-200 border shadow-lg py-4 space-y-4"
        v-for="(regionFacilities, categoryName) in regionFacilityData"
        :key="categoryName"
      >
        <div>
          <h4
            class="text-2xl font-semibold px-1 capitalize text-center my-2 tracking-wide"
          >
            {{ categoryName }}
          </h4>
          <div
            class="border-b-4 w-1/3 mx-auto"
            :class="{
              'border-red-500': categoryName === 'military',
              'border-yellow-500': categoryName === 'economy',
              'border-green-500': categoryName === 'food and resource',
              'border-blue-500': categoryName === 'misc',
              'border-purple-500': categoryName === 'government',
            }"
          ></div>
        </div>

        <div class="grid grid-cols-1 gap-x-2 gap-y-2 mx-auto w-full">
          <div class="grid">
            <div class="flex flex-row mb-1 w-full">
              <div class="flex flex-col w-2/3 mx-auto space-y-1">
                <div
                  class="bg-gray-700 hover:bg-red-700 cursor-pointer text-gray-200 font-semibold hover:text-white text-center py-2 px-auto border-2 border-gray-600 hover:border-transparent rounded"
                  v-for="facility in regionFacilities"
                  :key="facility"
                  @click="$emit('toggleDeleteFacility', facility)"
                >
                  {{ facility.facilityName }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["region-facility-data"],
  emits: ["toggleDeleteFacility"],
  mounted() {
    setTimeout(() => {
      console.log("THIS IS LIFE", this.regionFacilityData);
    }, 2000);
  },
  methods: {
    findCategoryColors(name) {
      return name;
    },
  },
};
</script>
