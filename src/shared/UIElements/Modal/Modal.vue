<template>
  <b-modal
    :id="id"
    :title="title"
    v-model="showModal"
    :header-bg-variant="styling.headerBackground || ''"
    :header-text-variant="styling.headerText || ''"
    :body-bg-variant="styling.bodyBackground || ''"
    :body-text-variant="styling.bodyText || ''"
    :footer-bg-variant="styling.footerBackground || ''"
    :footer-text-variant="styling.footerText || ''"
    :sizing="styling.size || ''"
  >
    <slot />
  </b-modal>
</template>

<script>
export default {
  name: "Modal",
  props: {
    show: Boolean,
    id: String,
    title: String,
    styling: Object,
  },
  data(){
    return{
        showModal: this.show
    }
  },
  components: {},
};
</script>

<style></style>
