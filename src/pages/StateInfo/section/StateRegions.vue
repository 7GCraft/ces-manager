<template>
  <div class="mt-4 flex flex-col space-y-2 max-w-4xl mx-auto my-1 mb-4">
    <h4
      class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/3 mx-auto bg-havelockBlue text-white py-1 tracking-wider"
    >
      State Regions
    </h4>
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="region in stateRegionData"
        :key="region.regionName"
        class="border p-4 border-gray-200 shadow-lg"
      >
        <div
          class="text-center text-lg font-semibold p-2 text-center border bg-black text-white mx-auto"
        >
          {{ region.regionName }}
        </div>
        <div class="text-left flex flex-col space-y-2 mt-2">
          <span>
            <p>Biome: {{ region.biome.biomeName }}</p>
          </span>
          <span class=""
            ><h6 class="text-lg">Development</h6>
            <div class="w-1/2 border-b-2 border-blue-700 mb-1"></div>
            <p class="">Level: {{ region.development.developmentName }}</p>
            <p class="">Population: {{ region.population }} Pop</p>
            <p class="">Used Population: {{ region.usedPopulation }} Pop</p>
            <p class="">
              Expected Growth: {{ region.expectedPopulationGrowth }} Pop
            </p>
          </span>

          <span class=""
            ><h6 class="text-lg">Corruption</h6>
            <div class="w-1/2 border-b-2 border-red-600 mb-1"></div>
            <p class="">Level: {{ region.corruption.corruptionName }}</p>
            <p class="">Rate: {{ region.corruption.corruptionRate * 100 }}%</p>
          </span>
          <span class=""
            ><h6 class="text-lg">Finances</h6>
            <div class="w-1/2 border-b-2 border-yellow-400 mb-1"></div>
            <p class="">Income: {{ region.totalIncome }}G</p>
            <p class="">Tax Rate: {{ region.taxRate * 100 }}%</p>
          </span>
          <span class=""
            ><h6 class="text-lg">Food</h6>
            <div class="w-1/2 border-b-2 border-green-500 mb-1"></div>
            <p class="">Food Produced: {{ region.totalFoodProduced }} Food</p>
            <p class="">
              Food Consumption: {{ region.totalFoodConsumed }} Food
            </p>
            <p class="">Food Available: {{ region.totalFoodAvailable }} Food</p>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["state-region-data"],
  mounted() {
    setTimeout(() => {
      console.log(
        this.stateRegionData,
        "we speak of an empire worth restoring",
      );
    }, 500);
  },
};
</script>
