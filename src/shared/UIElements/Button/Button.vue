<template>
  <b-button
    :variant="type"
    :size="size"
    :disabled="!state"
    v-on:click="onclick"
    :id="id"
    ><slot/></b-button
  >
</template>

<script>
export default {
  name: "Button",
  components: {},
  props: {
    id:String,
    onclick: Function,
    type: String,
    state: Boolean,
    size: String,
    name: String,
  },
};
</script>

<style></style>
