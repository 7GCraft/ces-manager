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
    <tbody>
      <tr
        v-for="region in regions"
        :key="region.RegionID"
        class="border-2 border-black"
      > 
        <td class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800`" 
        @click="$emit(open-region-page,id)">{{ region.RegionName }}</td>
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
  props: ["id", "regions"],
  emits:["open-region-page"]
};
</script>
