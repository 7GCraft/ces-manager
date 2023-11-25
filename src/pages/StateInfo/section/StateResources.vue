<template>
    <div class="mt-4 flex flex-col space-y-3 max-w-3xl mx-auto my-1 mb-4 py-5 pb-10">
        <h4 class="text-2xl mb-4 ">State Resources</h4>
        <div class="grid grid-cols-3 gap-y-10 gap-x-5 pb-4">
            <div v-for="(resources,regionName) in stateResourcesByRegion" :key="regionName" class="flex flex-col h-fit border-gray-100 shadow-md ">
                <div class="text-center text-lg font-semibold p-2 text-center border bg-ceruleanBlue text-white"  >{{ regionName }}</div>
                <div class="flex flex-col justify-between items-center w-full " v-for="resource in resources" :key="resource">
                   <div class="flex flex-row justify-between w-full ">
                    <h4 class="border py-2 w-full text-lg "> {{ resource.value }}</h4>
                    <h4 class="border py-2 w-full text-lg" :class="{'bg-red-200':resource.isFunctional === 0}">{{ resource.isFunctional === 1 ? 'Extracted' : 'Not Extracted' }}</h4>
                   </div>

                </div>
            </div>
        </div>
        <h4 class="text-center font-bold text-2xl my-4"> Total Resources:  <span v-for="(resourceCount,resourceName,index) in stateResourceCount" :key="resourceName" class="font-normal"> {{ resourceCount }} {{ resourceName  }}{{ index < Object.keys(stateResourceCount).length - 1 ? ', ': ' '  }}</span> </h4>
    </div>
</template>

<script>
export default {
    props:['state-resources-by-region','state-resource-count'],
    mounted(){
        setTimeout(()=>{
            console.log(this.stateResourceCount,'madagascar')
        },500)
    }
}
</script>