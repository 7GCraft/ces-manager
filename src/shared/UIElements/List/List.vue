<template>
  <div :id="id">
    <b-list-group>
      <b-list-group-item 
      v-for="item in items" 
      v-bind:key="item.id"
      :href="item.link ? item.link : ''"
      :variant="item.style"
      > 
      {{item.name}}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  props: {
    items: Array,
    id: String,
  },
};
</script>

<style></style>
