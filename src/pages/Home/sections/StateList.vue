<template>
  <div
    class="px-4 mx-auto max-w-2xl text-center py-24 pt-16 flex flex-col space-y-5"
  >
    <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none">
      State List
    </h1>
    <!--Searchbar Container-->
    <div class="relative">
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
        placeholder="Search State"
        v-model="stateFilter"
      />
    </div>

    <!--State List Container-->
    <div
      class="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      <div
        @click="$emit('open-state', state.stateId)"
        class="border-gray-50 p-4 bg-black text-white cursor-pointer hover:bg-blue-500"
        v-for="state in availableStates"
        :key="state.stateId"
      >
        {{ state.stateName }}
      </div>
    </div>
    <!--Add State Button Container-->
    <div class="">
      <button
        type="button"
        @click="toggleAddStateModal"
        href="#"
        class="inline-flex justify-center items-center py-4 px-6 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
      >
        Add State
        <svg
          class="ml-4"
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
  <modal-dialog v-if="showAddStateModal">
    <template v-slot:header>
      <div class="w-full h-full font-semibold text-xl p-5">
        <h1>Add State Modal</h1>
      </div>
    </template>
    <template v-slot:body>
      <div class="w-full h-full text-lg flex flex-col space-y-4 max-w-xl">
        <form class="flex flex-col space-y-5 sm:w-3/4">
          <div class="regionList-form-control">
            <label for="state-name">State Name</label>
            <input
              id="state-name"
              class="pl-2"
              v-model="addStateFormData.stateName"
              placeholder="Region Name"
            />
          </div>
          <div class="regionList-form-control">
            <label for="state-treasury">Treasury</label>
            <input
              id="state-treasury"
              type="number"
              class="pl-2"
              v-model="addStateFormData.treasuryAmt"
              placeholder="Treasury"
            />
          </div>
          <div class="regionList-form-control">
            <label for="state-expenses">Expenses</label>
            <input
              id="state-expenses"
              type="number"
              class="pl-2"
              v-model="addStateFormData.expenses"
              placeholder="Expenses"
            />
          </div>
          <div class="regionList-form-control">
            <label for="state-desc">Description</label>
            <textarea
              id="state-desc"
              class="w-1/2"
              v-model="addStateFormData.desc"
              placeholder="Description"
            />
          </div>
        </form>
      </div>
    </template>
    <template v-slot:footer>
        <div
          class="flex mx-auto items-center w-full  sm:w-full flex-col sm:flex-row
           space-y-4 justify-center sm:justify-end sm:space-y-0 
           sm:space-x-8"
        >
          <button
            type="button"
            data-modal-toggle="confirmation-modal"
            href="#"
            @click="addState()"
            class="inline-flex w-1/2 mx-auto sm:w-fit sm:mx-0 justify-center items-center  mx-auto py-4 sm:px-8 text-base font-medium text-center text-white rounded-lg bg-green-700 hover:text-green-700 hover:ring-4 hover:ring-green-700 hover:bg-white focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
          >
            Confirm
          </button>
          <button
            type="button"
            data-modal-toggle="confirmation-modal"
            href="#"
            @click="toggleAddStateModal"
            class=" w-1/2 mx-auto inline-flex sm:mx-0 justify-center items-center px-10  
            py-4 sm:px-8 text-base font-medium sm:w-fit
            text-center text-white rounded-lg bg-red-700 hover:text-red-700 hover:ring-4 hover:ring-red-700 hover:bg-white focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
          >
            Cancel
          </button>
        </div>
      </template>
  </modal-dialog>
</template>

<script>
export default {
  props: ["stateList"],
  emits: ["open-state", "add-state"],
  mounted() {
    console.log(this.stateList, "rasukar");
  },
  data() {
    return {
      stateFilter: "",
      showAddStateModal: false,
      addStateFormData: {
        stateName: "",
        treasuryAmt: null,
        expenses: null,
        desc: "",
      },
    };
  },
  methods: {
    toggleAddStateModal() {
      this.showAddStateModal = !this.showAddStateModal;
    },
    addState() {
      this.$emit("add-state", this.addStateFormData);
      this.toggleAddStateModal();
    },
  },
  computed: {
    availableStates() {
      return this.stateList.filter((state) =>
        state.stateName.includes(this.stateFilter)
      );
    },
  },
};
</script>
