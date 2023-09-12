<template>
  <div class="px-4 mx-auto lg:w-fit w-full text-center py-24 pt-16 flex flex-col space-y-5">
    <h1 class="mb-4 text-4xl font-semibold tracking-tight leading-none">
      Resource Tier List
    </h1>
    <!--Resource Tier Container-->
    <div class="md:grid-cols-6 sm:grid-cols-4 grid-cols-2 grid gap-4">
      <div class="flex flex-col space-y-2 "
        :class="{ 'bg-blue-100': isDragging, 'bg-red-200': resourceTier.isDraggedOver }"
        @dragover.prevent="dragOverList(resourceTier)" @drop="onDragDrop(resourceTier, tierIndex)"
        @dragleave="leaveDraggedOverList(resourceTier)" @dragenter.prevent
        v-for=" (resourceTier, tierIndex) in resourceList" :key="resourceTier.ResourceTierID">
        <h2 class="text-xl font-semibold border py-4 px-3 bg-black text-white">{{ resourceTier.ResourceTierName }}</h2>
        <div @dragstart="startDrag(index, resourceTier, tierIndex)" @dragend="stopDrag" draggable="true"
          v-for="(resource, index) in resourceTier.Resources" :key="resource.ResourceName"
          class="border p-3 bg-gray-100 cursor-pointer "
          :class="{ 'bg-yellow-200': resource.isChanged && resourceTier.ResourceTierID !== resource.originTierIndex }">{{
            resource.ResourceName }}</div>
      </div>
    </div>
    <div class="relative py-12 mx-auto border-2 border-red-500 
    bg-red-300 w-3/5"
    @dragover.prevent="dragOverList(resourceTier)" @drop="onDragDrop(resourceTier, tierIndex)"
        @dragleave="leaveDraggedOverList(resourceTier)" @dragenter.prevent>

    </div>
    <!--Add State Button Container-->
    <div class="pt-2 flex justify-center space-x-2">
      <button type="button" @click="toggleAddStateModal" href="#" class="inline-flex justify-center 
             items-center py-4 px-5 text-base font-medium 
             text-center text-white rounded-lg bg-green-700
              hover:bg-green-800 focus:ring-4 focus:ring-blue-300
               dark:focus:ring-green-900">
        Add Resource

      </button>
      <button v-if="isChanging" type="button" @click="onResourceSubmit" href="#" class="inline-flex justify-center 
             items-center py-4 px-5 text-base font-medium 
             text-center text-white rounded-lg bg-blue-700
              hover:bg-blue-800 focus:ring-4 focus:ring-blue-300
               dark:focus:ring-blue-900">
        Submit Changes

      </button>

    </div>
    <!---->
   
  </div>
</template>

<script>

export default {
  props: ["resourceList"],
  emits: ['save-new-resources'],
  mounted() {
    console.log(this.resourceList, 'resources');
    for (let tier of this.resourceList) {
      tier.isDraggedOver = false
      for (let resources of tier.Resources) {
        resources.isChanged = false
        resources.originTierIndex = tier.ResourceTierID
      }
    }
    this.tierResourceList = structuredClone(this.resourceList);
    console.log(this.tierResourceList, 'tier Resourcce list')
  },
  data() {
    return {
      isChanging: false,
      isDragging: false,
      draggedResourceIdx: '',
      originTierIdx: null,
      targetTierIdx: null,
      originTier: null,
      tierResourceList: [],
    }
  },
  methods: {
    startDrag(resourceIndex, tier, tierIndex) {
      this.isDragging = true
      this.draggedResourceIdx = resourceIndex

      this.originTier = tier
      this.originTierIdx = tierIndex

    },
    stopDrag() {
      this.isDragging = false
      console.log('consolation')
    },
    dragOverList(tier) {
      tier.isDraggedOver = true
    },
    leaveDraggedOverList(tier) {
      tier.isDraggedOver = false
    },
    onDragDrop(tier, index) {
      this.targetTierIdx = index

      tier.isDraggedOver = false
      if (this.originTier.ResourceTierID === tier.ResourceTierID) {
        return;
      }

      let newOriginTier = { ...this.originTier }
      console.log(this.draggedResourceIdx, 'television')
      let targetElement = newOriginTier.Resources.splice(this.draggedResourceIdx, 1)
      targetElement[0].isChanged = true;
      targetElement[0].ResourceTierID = tier.ResourceTierID
      console.log(targetElement, 'new guys')

      let newTier = { ...tier }
      newTier.Resources.push(targetElement[0])
      let newResourceTierList = structuredClone(this.tierResourceList);
      newResourceTierList.splice(this.originTierIdx, 1, newOriginTier)
      newResourceTierList.splice(this.targetTierIdx, 1, newTier)

      this.tierResourceList = [...newResourceTierList]
      this.isChanging = true;
    },
    onDragDropDelete(){
      // this.targetTierIdx = index

      // tier.isDraggedOver = false
      // if (this.originTier.ResourceTierID === tier.ResourceTierID) {
      //   return;
      // }

      // let newOriginTier = { ...this.originTier }
      // console.log(this.draggedResourceIdx, 'television')
      // let targetElement = newOriginTier.Resources.splice(this.draggedResourceIdx, 1)
      // targetElement[0].isChanged = true;
      // targetElement[0].ResourceTierID = tier.ResourceTierID
      // console.log(targetElement, 'new guys')

      // let newTier = { ...tier }
      // newTier.Resources.push(targetElement[0])
      // let newResourceTierList = structuredClone(this.tierResourceList);
      // newResourceTierList.splice(this.originTierIdx, 1, newOriginTier)
      // newResourceTierList.splice(this.targetTierIdx, 1, newTier)

      // this.tierResourceList = [...newResourceTierList]
      // this.isChanging = true;
    },
    onResourceSubmit() {
      let newResources = []
      for (let tier of this.tierResourceList) {
        for (let resource of tier.Resources) {
          console.log(resource,'nueva resource')
          newResources.push({
            ResourceID: resource.ResourceID.toString(),
            ResourceName: resource.ResourceName.toString(),
            ResourceTierID: resource.ResourceTierID.toString()
          })
        }
      }
      console.log(newResources,'new-result')
      this.$emit('save-new-resources', newResources)
    }
  }
};
</script>