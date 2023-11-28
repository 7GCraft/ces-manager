<template>
     <div class="mt-4 flex flex-col space-y-2 max-w-8xl mx-auto my-1 mb-4 px-10">
        <h4 class="text-2xl mb-4 ">State Facilities</h4>
        <div class="grid grid-cols-2 gap-y-10">
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl font-semibold px-1">Economy</h4>
                <div class="border-b-2 border-yellow-500 w-1/2 "></div>
                <div class="grid grid-cols-2">
                <div v-for="(regionFacilities,regionName) in stateFacilities" :key="regionName" class="grid">
                    <div class="flex flex-row mb-1">
                        <div class="p-2 border">{{  regionName  }}</div>
                        <div class="flex flex-col" >
                            <div v-for="facility in regionFacilities" :key="facility" >{{ facility.facilityName }}</div>
                           
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Military and Recruitment</h4>
                <div class="border-b-2 border-red-500 w-1/2 "></div>
               
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Government and Public</h4>
                <div class="border-b-2 border-blue-500 w-1/2 "></div>
                
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Food and Production</h4>
                <div class="border-b-2 border-green-500 w-1/2 "></div>
                
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Misc</h4>
                <div class="border-b-2 border-purple-500 w-1/2 "></div>
                
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:['state-facilities'],
    mounted(){
        setTimeout(()=>{
            console.log(this.stateFacilities)
        },500)
      
    }
}
</script>