<template>
  <table class="table-auto" :id="id">
    <thead>
      <tr class="border-2 border-black">
        <th>Name</th>
        <th>Money</th>
        <th>Food</th>
        <th>Total Pop</th>
        <th>Used Pop</th>
      </tr>
    </thead>
    <tbody >
      <tr v-for="region in regions" :key="region.RegionID" class="border-2 border-black">
        <td>{{ region.RegionName }}</td>
        <td>{{ region.RegionTotalIncome }}</td>
        <td>{{ region.RegionTotalFood }}</td>
        <td>{{ region.Population }}</td>
        <td>{{ region.UsedPopulation }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
    props:['id','regions']
}
</script>