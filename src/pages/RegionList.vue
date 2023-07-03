<template>
  <div
    class="px-20 mx-auto w-full text-center py-24 pt-16 flex flex-col space-y-5"
  >
  <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none ">
      Region List
    </h1>
     <!--Searchbar Container-->
     <div class="relative  ">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none"
      >
        <svg
          aria-hidden="true"
          class="w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        type="search"
        id="default-search"
        class="block w-full p-4 pl-10 md:px-24 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Search Mockups, Logos..."
        v-model="stateFilter"
      />
      <button
        type="submit"
        class="text-white absolute right-1 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Search
      </button>
    </div>
    <!-- Region Table Container-->
    <div class="flex flex-col border-2 border-gray-50 shadow-lg p-4 bg-gray-100" v-for="state in regionData" :key="state.stateID">
        <h1 class="mb-4 text-xl tracking-tight leading-none " >
            {{state.stateName}}
        </h1>
        <region-table :regions="state.Regions"></region-table>
    </div>
  </div>
</template>

<script>
import regionTable from '@/components/RegionTable.vue';
export default {
    props:['regionData'],
    components:{
        regionTable
    },
    mounted(){
        console.log(this.regionData,'region')
    }
}
</script>