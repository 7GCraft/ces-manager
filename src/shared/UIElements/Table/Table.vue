<template>
  <div :id="id">
    <b-row class="m-2">
    <b-col sm="4">
    <div class="input-group mb-3">
      <input v-model="filter" type="text" class="form-control" placeholder="Search" aria-label="filter" >
    </div>
    </b-col>
    </b-row>
    <b-row class="m-2">
    <b-col sm="12">
    <b-table hover
    head-row-variant="dark"
    :items="items" 
    :fields="fields"
    :filter="filter"
    label-sort-asc=""
    label-sort-desc=""
    label-sort-clear=""
    ></b-table>
    </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "Table",
  components: {},
  props: {
    items: Array,
    fields: Array,
    id: String,
  },
  data(){
    return{
        filter: ''
    }
  }
};
</script>

<style></style>
