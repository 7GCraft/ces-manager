<template>
  <section class="h-full">
    <div
      class="px-4 mx-auto max-w-2xl text-center py-24 pt-16 flex flex-col space-y-4"
    >
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none">
        Welcome to the CES App, Gamemaster
      </h1>
      <p class="text-lg font-normal sm:px-16 lg:px-24">
        You can begin your work on managing Clancraft or continue on your
        previous work.
      </p>
      <p class="text-lg font-normal sm:px-16 lg:px-24">
        You can also advance season in this tab, permanently moving time across
        the system.
      </p>
      <p class="text-lg font-normal sm:px-16 lg:px-24">
        The current date is
        <span class="font-bold font-3xl"
          >{{ date.season }} {{ date.year }}
        </span>
      </p>

      <div class="">
        <button
          type="button"
          data-modal-toggle="confirmation-modal"
          href="#"
          @click="toggleConfirmationModal"
          class="inline-flex justify-center items-center py-4 px-6 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
        >
          Advance Season
          <svg
            aria-hidden="true"
            class="ml-2 -mr-1 w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <modal-dialog v-if="showConfirmationModal">
        <template v-slot:header>
            <div class="w-full h-full font-semibold text-xl p-5">
                <h1>Confirmation Modal</h1>
            </div>
        </template>
        <template v-slot:body>
             <div class="w-full h-full text-lg flex flex-col space-y-4">
                <p>Are you sure you want to advance the season?  </p>
                <p class="text-red-600 font-bold">  Warning: this decision will be permanent and there is no way to reverse it!</p>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex flex-col sm:flex-row space-y-4 sm:justify-between sm:space-y-0 sm:space-x-8">
           <button
          type="button"
          data-modal-toggle="confirmation-modal"
          href="#"
          @click="advanceSeason"
          class="inline-flex justify-center items-center py-4 px-6 text-base font-medium text-center text-white rounded-lg bg-green-700
           hover:text-green-700 hover:ring-4 hover:ring-green-700 hover:bg-white focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
        >
          Confirm
         
        </button>
        <button
          type="button"
          data-modal-toggle="confirmation-modal"
          href="#"
          @click="toggleConfirmationModal"
          class="inline-flex justify-center items-center py-4 px-6 text-base font-medium text-center text-white rounded-lg bg-red-700 hover:text-red-700 hover:ring-4 hover:ring-red-700 hover:bg-white focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
        >
          Cancel
         
        </button>
            </div>
        </template>
    </modal-dialog>
  </section>
</template>


<script>
import ModalDialog from '@/components/UI/ModalDialog.vue';
export default {
  components: { ModalDialog },
  props: ["date"],
  emits: ["advance-season"],
  data(){
      return{
          showConfirmationModal: false
      }
  },
  methods:{
      toggleConfirmationModal(){
          this.showConfirmationModal = !this.showConfirmationModal;
      },
      advanceSeason(){
          this.$emit('advance-season')
          this.toggleConfirmationModal()
      }
  }
};
</script>