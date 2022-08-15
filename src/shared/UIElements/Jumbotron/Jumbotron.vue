<template>
  <b-jumbotron
    lead="Bootstrap v4 Components for Vue.js 2"
    :bg-variant="type.background"
    :border-variant="type.border"
    :text-variant="type.text"
    :header="header"
  >
    <slot />
  </b-jumbotron>
</template>

<script>
export default {
  name: "Jumbotron",
  props: {
    type: Object,
    header: String,
  },
};
</script>

<style></style>
