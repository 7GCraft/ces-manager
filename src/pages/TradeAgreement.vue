<template>
  <div
    class="px-4 mx-auto w-full text-center py-24 pt-16 flex flex-col space-y-5"
  >
    <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none">
      Trade Agreement List
    </h1>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 grid-cols-1 ">
    <div
      class="flex flex-col border-2 border-gray-50 shadow-lg p-4 space-y-4"
      v-for="trade in tradeAgreementList"
      :key="trade.tradeAgreementID"
    >
      <button
        
        class="bg-gray-100 flex flex-row px-4 justify-between text-center py-5 w-full mx-auto border text-2xl leading-5"
      >
        <span v-for="trader in trade.traders" :key="trader.state.stateID"> {{ trader.state.stateName }}</span>
        <svg
          data-accordion-icon
          class="w-6 h-6 rotate-180 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
      <div
        class="flex flex-col space-y-4 pt-2"
      
      >
      <div class=" grid grid-cols-2">
        <div class="border-r-2" v-for="trader in trade.traders" :key="trader.state.stateID">
            <h3 class="text-xl">{{ trader.state.stateName }}</h3>
            <div class="xs:grid-cols-1 md:grid-cols-2  grid p-2 gap-3"> 
                <div class="border-1 bg-black p-1 text-white" v-for="resource in trader.resources" :key="resource.ResourceTierID">{{ resource.ResourceName }}</div>
            </div>
            <h3>{{ Math.round(trader.tradePower) * 100 }}%</h3>
            <h3>{{ Math.round(trader.tradeValue) }}</h3>
        </div>
       
      </div>
        <div class="flex justify-center space-x-4">
          <button
            type="button"
            @click="toggleAddRegionModal(state.stateName, state.stateID)"
            href="#"
            class="inline-flex justify-right group items-center py-3 px-4 text-base font-medium text-center text-white rounded-lg bg-fernGreen hover:bg-white hover:text-fernGreen hover:ring-4 hover:ring-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
          >
            Modify
            <svg
              class="group-hover:bg-fernGreen ml-1 group-hover:rounded-full"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            type="button"
            @click="toggleAddRegionModal(state.stateName, state.stateID)"
            href="#"
            class="inline-flex justify-right group items-center py-3 px-4 text-base font-medium text-center text-white rounded-lg bg-fernGreen hover:bg-white hover:text-fernGreen hover:ring-4 hover:ring-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
          >
            Delete
            <svg
              class="group-hover:bg-fernGreen ml-1 group-hover:rounded-full"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
</div>
  </div>
</template>

<script>
export default {
  props: ["tradeAgreementList"],
  mounted() {
    console.log(this.tradeAgreementList, "rossiyta");
  },
};
</script>