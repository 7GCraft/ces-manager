<template>
  <div id="tab">
    <b-tabs
      class=""
      content-class="mt-3"
      :fill="fill || false"
      :pills="pill || false"
      :align="align || 'left'"
      :end="end || false"
    >
      <b-tab
        :key="item.title"
        v-for="item in items"
        :title="item.title"
        :active="item.active || false"
      >
        {{ item.content }}
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
export default {
  name: "Tabs",
  components: {},
  props: {
    items: Array,
    fill: Boolean,
    pill: Boolean,
    align: String,
    end: Boolean,
  },
};
</script>

<style></style>
