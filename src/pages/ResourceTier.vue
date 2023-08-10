<template>
  <div
    class="px-4 mx-auto lg:w-fit w-full text-center py-24 pt-16 flex flex-col space-y-5"
  >
    <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none">
      Resource Tier List
    </h1>
    <!--Resource Tier Container-->
    <div class="md:grid-cols-6 sm:grid-cols-4 grid-cols-2 grid gap-4">
      <div
        class="flex flex-col space-y-2 "
        :class="{'bg-blue-100': true}"
        v-for="resourceTier in resourceList"
        :key="resourceTier.ResourceTierID"
      >
        <h2 class="text-xl font-semibold border py-4 px-3 bg-black text-white">{{ resourceTier.ResourceTierName }}</h2>
        <div draggable="true" v-for="resource in resourceTier.Resources" :key="resource.ResourceName" class="border p-3 bg-gray-100 cursor-pointer ">{{ resource.ResourceName }}</div>
      </div>
    </div>
     <!--Add State Button Container-->
     <div class="pt-2 flex justify-center space-x-2">
            <button type="button" @click="toggleAddStateModal"
             href="#" class="inline-flex justify-center 
             items-center py-4 px-5 text-base font-medium 
             text-center text-white rounded-lg bg-green-700
              hover:bg-green-800 focus:ring-4 focus:ring-blue-300
               dark:focus:ring-green-900">
                Add  Resource
                
            </button>
            <button v-if="isChanging" type="button" @click="toggleAddStateModal"
             href="#" class="inline-flex justify-center 
             items-center py-4 px-5 text-base font-medium 
             text-center text-white rounded-lg bg-blue-700
              hover:bg-blue-800 focus:ring-4 focus:ring-blue-300
               dark:focus:ring-blue-900">
              Submit Changes
               
            </button>
           
        </div>
  </div>
</template>

<script>
export default {
  props: ["resourceList"],
  mounted() {
    console.log(this.resourceList);
  },
  data(){
    return{
      isChanging: false,
      isDragging: false
    }
  }
};
</script>