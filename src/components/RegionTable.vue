<template>
  <table class="table-auto" :id="id">
    <thead>
      <tr class="border-2 border-black bg-blue-500 text-white">
        <th class="border-x-2 border-black">Name</th>
        <th class="border-x-2 border-black">Money</th>
        <th class="border-x-2 border-black">Food</th>
        <th class="border-x-2 border-black">Total Pop</th>
        <th class="border-x-2 border-black">Used Pop</th>
      </tr>
    </thead>
    <tbody >
      <tr v-for="region in regions" :key="region.RegionID" class="border-2 border-black">
        <td class="border-x-2 border-black">{{ region.RegionName }}</td>
        <td class="border-x-2 border-black">{{ region.RegionTotalIncome }}</td>
        <td class="border-x-2 border-black">{{ region.RegionTotalFood }}</td>
        <td class="border-x-2 border-black">{{ region.Population }}</td>
        <td class="border-x-2 border-black">{{ region.UsedPopulation }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
    props:['id','regions']
}
</script>