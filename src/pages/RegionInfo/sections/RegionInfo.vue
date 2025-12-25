<template>
  <div class="mt-12 flex flex-col space-y-2 max-w-3xl mx-auto  mb-4">
    <h4
      class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/3 mx-auto bg-havelockBlue text-white py-1 tracking-wider px-2"
    >
      Region Info
    </h4>
    <div class="grid md:grid-cols-2 gap-y-10 pb-10 ">
      <div class="text-left px-4 flex flex-col space-y-1">
        <h4 class="text-xl font-semibold px-1">General</h4>
        <div class="border-b-2 border-purple-500 w-1/2"></div>
        <div class="leading-8 tracking-wider">
          <p class="pt-1">
            State: 
            <span class="font-semibold"
              >{{stateName}}</span
            >
          </p>
          <p class="pt-1">
            Biome:
            <span class="font-semibold"
              >{{biome}}</span
            >
          </p>
           <p v-if="resources.length > 0"   class=" ">
           Resources: <span class="font-semibold" :key="resource" v-for="resource in resources">{{ resource }} </span>

          </p>
          
          
        </div>
      </div>
       <div class="text-left px-4 flex flex-col space-y-1">
        <h4 class="text-xl font-semibold px-1">Finances</h4>
        <div class="border-b-2 border-yellow-500 w-1/2"></div>
        <div class="leading-8 tracking-wider">
         <p class="">
            Tax Rate: <span class="font-semibold"
              >{{ taxRate }}%</span
            >
          </p>
         
          <p class="">
            Region Income:<span class="font-semibold">
              {{ totalIncome ? totalIncome.toFixed(2) : "" }}G</span
            >
          </p>
          <p class="pt-1">
            Expected Pop Growth:<span class="font-semibold"
              >{{ populationGrowth}}%</span
            >
          </p>
             <p class="pt-1">
            Corruption Level:<span class="font-semibold"
              >({{ corruptionLevel}}) {{corruption}}</span
            >
          </p>
             <p class="pt-1">
            Corruption Rate:<span class="font-semibold"
              >{{ corruptionRate}}%</span
            >
          </p>
             <!-- <p class="pt-1">
            Growth Rate:<span class="font-semibold"
              >{{ growthModifier}}%</span
            >
          </p>
             <p class="pt-1">
          Shrinkage Rate:<span class="font-semibold"
              >{{ shrinkageModifier}}%</span
            >
          </p> -->
        </div>
      </div>
      <div class="text-left px-4 flex flex-col space-y-1">
        <h4 class="text-xl px-1 font-semibold">Development</h4>
        <div class="border-b-2 border-blue-500 w-1/2"></div>
        <div class="leading-8 tracking-wider">
           <p class="pt-1">
            Development Level:<span class="font-semibold"
              >({{ developmentLevel }})  {{ development}}</span
            >
          </p>
          <p class="pt-1">
            Population: <span class="font-semibold">
              {{ population }}/{{ populationCap }} Pop </span
            > 
          </p>
          <p class="pt-1">
            Productive Population:<span class="font-semibold"
              >{{ usedPopulation }}/{{ population }} Pop</span
            >
          </p>
        
           <p class="pt-1">
            Facility Count:<span class="font-semibold"
              >{{ populationCap }} Facilities</span
            >
          </p>
        </div>
      </div>
      <div class="text-left px-4 flex flex-col space-y-1">
        <h4 class="text-xl px-1 font-semibold">Food</h4>
        <div class="border-b-2 border-green-500 w-1/2"></div>
        <div class="leading-8 tracking-wider">
          <p class="pt-1">
            Total Food Produced:<span class="font-semibold"
              >{{ totalFoodProduced }} Food</span
            >
          </p>
          <p class="pt-1">
            Total Food Consumed:
            <span class="font-semibold">{{ totalFoodConsumed }} Food</span>
          </p>
          <p class="pt-1">
            Total Food Available:<span class="font-semibold"
              >{{ totalFoodBalance }} Food</span
            >
          </p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  mounted() {

  },
  props: ["regionInfo"],
  computed: {
    totalIncome() {
      return this.regionInfo.totalIncome ? this.regionInfo.totalIncome : "";
    },
    taxRate(){
      return this.regionInfo.taxRate *100;
    },
    development() {
      return this.regionInfo.development? this.regionInfo.development.developmentName : "";
    },
    developmentLevel(){
      return this.regionInfo.development?  this.regionInfo.development.developmentId :"";
    },
    growthModifier(){
      return this.regionInfo.development? this.regionInfo.development.growthModifier : "";
    },
        shrinkageModifier(){
      return this.regionInfo.development? this.regionInfo.development.shrinkageModifier : "";
    },
    facilityCount() {
      return 1;
    },
    totalFoodProduced() {
      return this.regionInfo.totalFoodProduced;
    },
    totalFoodConsumed() {
      return this.regionInfo.totalFoodConsumed;
    },
    totalFoodBalance() {
      return this.regionInfo.totalFoodAvailable;
    },
    population() {
      return this.regionInfo.population;
    },
    populationCap(){
      return this.regionInfo.development.populationCap;
    },
    usedPopulation(){
      return this.regionInfo.usedPopulation;
    },
    populationGrowth(){
      return this.regionInfo.expectedPopulationGrowth;
    },
    resources(){
      return this.$store.getters.getRegionResource;
    },
    biome(){
      return this.regionInfo.biome ? this.regionInfo.biome.biomeName : "" ;
    },
    stateName(){
      return  this.regionInfo.state ? this.regionInfo.state.stateName : ""
    },
    corruption(){
      return this.regionInfo.corruption ? this.regionInfo.corruption.corruptionName : "";
    },
    corruptionLevel(){
      return this.regionInfo.corruption ?  this.regionInfo.corruption.corruptionId : "";
    },
    corruptionRate(){
      return this.regionInfo.corruption ?  this.regionInfo.corruption.corruptionRate : "";
    }
  
  },
};
</script>
