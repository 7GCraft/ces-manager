<template>
  <div
    class="px-4 mx-auto lg:w-3/4 w-full text-center py-24 pt-16 flex flex-col space-y-5"
  >
    <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none">
      Resource Tier List
    </h1>
    <!--Resource Tier Container-->
    <div class="md:grid-cols-6 sm:grid-cols-4 grid-cols-2 grid gap-4">
      <div
        class="flex flex-col space-y-2"
        v-for="resourceTier in resourceList"
        :key="resourceTier.ResourceTierID"
      >
        <h2 class="text-xl font-semibold border py-4 px-3 bg-black text-white">
          {{ resourceTier.ResourceTierName }}
        </h2>
        <div
          v-for="resource in resourceTier.Resources"
          :key="resource.ResourceName"
          class="border p-3 bg-gray-100"
        >
          {{ resource.ResourceName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["resourceList"],
  mounted() {
    console.log(this.resourceList);
  },
};
</script>
