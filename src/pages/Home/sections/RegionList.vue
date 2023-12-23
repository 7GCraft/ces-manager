<template>
  <div
    class="px-8 mx-auto lg:w-3/4 w-full text-center py-24 pt-10 flex flex-col space-y-5"
  >
    <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none">
      Region List
    </h1>
    <!--Add State Button Container-->

    <!--Searchbar Container-->
    <div class="relative mx-20">
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
    <div
      class="flex flex-col border-2 border-gray-50 shadow-lg p-4 space-y-4"
      v-for="state in availableState"
      :key="state.stateID"
    >
      <button
        @click="toggleOpen(state.stateName)"
        class="bg-gray-100 flex flex-row px-4 justify-between text-center py-5 w-full mx-auto border text-2xl leading-5"
      >
        {{ state.stateName }}
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
        :class="{ hidden: !isOpen[state.stateName] }"
      >
        <div class="flex justify-end">
          <button
            type="button"
            @click="toggleAddRegionModal(state.stateName, state.stateID)"
            href="#"
            class="inline-flex justify-right group items-center py-3 px-4 text-base font-medium text-center text-white rounded-lg bg-fernGreen hover:bg-white hover:text-fernGreen hover:ring-4 hover:ring-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
          >
            Add Region
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
        <region-table :regions="state.Regions"></region-table>
      </div>
    </div>
    <modal-dialog v-if="showAddRegionModal">
      <template v-slot:header>
        <div class="w-full h-full font-semibold text-xl p-5">
          <h1>Add Region Modal</h1>
        </div>
      </template>
      <template v-slot:body>
        <div class="w-full h-full text-lg flex flex-col space-y-4 max-w-xl">
          <form class="flex flex-col space-y-5 sm:w-3/4">
            <div class="regionList-form-control">
              <label for="state-name">Region Name</label>
              <input
                id="region-name"
                class="pl-2"
                v-model="addRegionFormData.regionName"
                placeholder="Region Name"
              />
            </div>
            <div class="regionList-form-control">
              <label for="state-name">State Name</label>
              <select
                disabled
                class="w-1/2"
                v-model="addRegionFormData.stateId"
                id="state-name"
              >
                <option :value="addRegionFormData.stateId">
                  {{ stateName }}
                </option>
              </select>
            </div>
            <div class="regionList-form-control">
              <label for="corruption-level">Corruption Level</label>
              <select
                class="w-1/2"
                v-model="addRegionFormData.corruptionId"
                id="corruption-level"
              >
                <option
                  v-for="corruption in corruptionList"
                  :key="corruption.corruptionId"
                  :value="corruption.corruptionId"
                >
                  {{ corruption.corruptionName }}
                </option>
              </select>
            </div>
            <div class="regionList-form-control">
              <label for="biome">Biome</label>
              <select
                class="w-1/2"
                v-model="addRegionFormData.biomeId"
                id="biome"
              >
                <option
                  v-for="biome in biomeList"
                  :key="biome.biomeId"
                  :value="biome.biomeId"
                >
                  {{ biome.biomeName }}
                </option>
              </select>
            </div>
            <div class="regionList-form-control">
              <label for="development-level">Development Level</label>
              <select
                class="w-1/2"
                v-model="addRegionFormData.developmentId"
                id="development-level"
              >
                <option
                  v-for="development in developmentList"
                  :key="development.developmentId"
                  :value="development.developmentId"
                >
                  {{ development.developmentName }}
                </option>
              </select>
            </div>
            <div class="regionList-form-control">
              <label for="state-name">Population</label>
              <input
                type="number"
                id="state-name"
                class="pl-2"
                v-model="addRegionFormData.population"
                placeholder="Population"
              />
            </div>
            <div class="regionList-form-control">
              <label for="state-name">Tax Rate</label>
              <input
                type="number"
                id="state-name"
                class="pl-2"
                v-model="addRegionFormData.taxRate"
                placeholder="Tax Rate"
              />
            </div>
            <div class="regionList-form-control">
              <label for="state-name">Description</label>
              <textarea
                id="state-name"
                class="w-1/2"
                v-model="addRegionFormData.desc"
                placeholder="Description"
              />
            </div>
          </form>
        </div>
      </template>
      <template v-slot:footer>
        <div
          class="flex flex-col sm:flex-row space-y-4 sm:justify-between sm:space-y-0 sm:space-x-8"
        >
          <button
            type="button"
            href="#"
            @click="addRegion"
            class="inline-flex justify-center items-center py-4 px-6 text-base font-medium text-center text-white rounded-lg bg-green-700 hover:text-green-700 hover:ring-4 hover:ring-green-700 hover:bg-white focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
          >
            Confirm
          </button>
          <button
            type="button"
            data-modal-toggle="confirmation-modal"
            href="#"
            @click="toggleAddRegionModal"
            class="inline-flex justify-center items-center py-4 px-6 text-base font-medium text-center text-white rounded-lg bg-red-700 hover:text-red-700 hover:ring-4 hover:ring-red-700 hover:bg-white focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
          >
            Cancel
          </button>
        </div>
      </template>
    </modal-dialog>
  </div>
</template>

<script>
import regionTable from "@/components/RegionTable.vue";
export default {
  props: ["regionData", "developmentList", "biomeList", "corruptionList"],
  emits: ["add-region"],
  components: {
    regionTable,
  },
  mounted() {
    console.log(this.regionData, "region");
    for (let state of this.regionData) {
      this.isOpen[state.stateName] = true;
    }
    console.log(this.developmentList);
  },
  data() {
    return {
      stateFilter: "",
      isOpen: {},
      showAddRegionModal: false,
      stateName: "",
      addRegionFormData: {
        regionName: "",
        stateId: null,
        corruptionId: "",
        biomeId: "",
        developmentId: "",
        population: null,
        taxRate: null,
        desc: "",
      },
    };
  },
  methods: {
    addRegion() {
      this.$emit("add-region", this.addRegionFormData);
      this.toggleAddRegionModal();
    },
    toggleOpen(stateName) {
      this.isOpen[stateName] = !this.isOpen[stateName];
    },
    toggleAddRegionModal(stateName, stateId) {
      this.stateName = stateName;
      this.addRegionFormData.stateId = stateId;
      this.showAddRegionModal = !this.showAddRegionModal;
    },
  },
  computed: {
    availableState() {
      return this.regionData.filter((state) =>
        state.stateName.includes(this.stateFilter),
      );
    },
  },
};
</script>
