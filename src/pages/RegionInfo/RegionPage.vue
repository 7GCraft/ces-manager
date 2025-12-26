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
      @toggle-delete-facility="toggleDeleteFacilityModal"
    ></router-view>
  </div>
  <modal-dialog v-if="showFacilityDeletionModal">
    <template v-slot:header>
      <div class="w-full h-full font-semibold text-xl p-5">
        <h1>Facility Deletion Confirmation Modal</h1>
      </div>
    </template>
    <template v-slot:body>
      <div class="w-full h-full text-lg flex flex-col space-y-4">
        <p>
          Are you sure you want to delete ID ({{ deletedFacilityId }})
          {{ deletedFacility.facilityName }} in Region
          {{ regionInfo.regionName }}
        </p>
        <p class="text-red-600 font-bold">This is permanent.</p>
      </div>
    </template>
    <template v-slot:footer>
      <div
        class="flex mx-auto items-center w-full sm:w-full flex-col sm:flex-row space-y-4 justify-center sm:justify-end sm:space-y-0 sm:space-x-8"
      >
        <button
          type="button"
          data-modal-toggle="confirmation-modal"
          href="#"
          @click="deleteFacility"
          class="inline-flex w-1/2 mx-auto sm:w-fit sm:mx-0 justify-center items-center mx-auto py-4 sm:px-8 text-base font-medium text-center text-white rounded-lg bg-green-700 hover:text-green-700 hover:ring-4 hover:ring-green-700 hover:bg-white focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
        >
          Confirm
        </button>
        <button
          type="button"
          data-modal-toggle="confirmation-modal"
          href="#"
          @click="toggleDeleteFacilityModal"
          class="w-1/2 mx-auto inline-flex sm:mx-0 justify-center items-center px-10 py-4 sm:px-8 text-base font-medium sm:w-fit text-center text-white rounded-lg bg-red-700 hover:text-red-700 hover:ring-4 hover:ring-red-700 hover:bg-white focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
        >
          Cancel
        </button>
      </div>
    </template>
  </modal-dialog>
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
  data() {
    return {
      showFacilityDeletionModal: false,
      deletedFacility: "",
      deletedFacilityId: "",
    };
  },
  methods: {
    toggleDeleteFacilityModal(facility) {
      this.deletedFacility = "";
      this.deletedFacilityId = "";
      this.showFacilityDeletionModal = !this.showFacilityDeletionModal;
      console.log(facility, "storsu");
      if (facility && typeof facility === "object") {
        this.deletedFacility = facility;
        this.deletedFacilityId = facility.facilityId;
      }
    },
    deleteFacility() {
      this.$store.dispatch("deleteRegionFacility", this.deletedFacilityId);

      this.toggleDeleteFacilityModal();
    },
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
