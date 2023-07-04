<template>
  <div
    class="px-8 mx-auto lg:w-3/4 w-full text-center py-24 pt-10 flex flex-col space-y-5"
  >
  <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none ">
      Region List
    </h1>
       <!--Add State Button Container-->
      
     <!--Searchbar Container-->
     <div class="relative mx-20  ">
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
        placeholder="Filter by State...."
        v-model="stateFilter"
      />
      
    </div>
    <!-- Region Table Container-->
    <div class="flex flex-col border-2 border-gray-50 shadow-lg p-4 space-y-4 " v-for="state in availableState" :key="state.stateID">
        <button @click="toggleOpen(state.stateName)" class="bg-gray-100 flex flex-row px-4 justify-between text-center py-5 w-full mx-auto  border text-2xl  leading-5 " >
            {{state.stateName}}
            <svg data-accordion-icon class="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>
        <div class="flex flex-col space-y-4 pt-2" :class="{'hidden' : !isOpen[state.stateName]}">
        <div class="flex justify-end" >
            <button type="button" 
             href="#" class="inline-flex justify-right
             items-center py-3 px-4 text-base font-medium 
             text-center text-white rounded-lg bg-fernGreen
              hover:bg-blue-800 focus:ring-4 focus:ring-blue-300
               dark:focus:ring-blue-900">
                Add Region
                <svg class="ml-1" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
           
        </div>
        <region-table :regions="state.Regions"></region-table>
      </div>
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
        for(let state of this.regionData){
          this.isOpen[state.stateName] = true;
        }
        console.log(this.isOpen)
    },
    data(){
      return{
        stateFilter:'',
        isOpen: {}
      }
    },
    methods:{
      toggleOpen(stateName){
        this.isOpen[stateName] = !this.isOpen[stateName]
      }
    },
    computed:{
      availableState(){
        return this.regionData.filter(state=>state.stateName.includes(this.stateFilter))
      }
    }
}
</script>