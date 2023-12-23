<template>
    <div class="mt-4 flex flex-col space-y-2 max-w-4xl mx-auto my-1 mb-4">
        <h4 class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/3 mx-auto bg-havelockBlue text-white py-1 tracking-wider">State Military</h4>
        <div class="grid grid-cols-2 gap-5">
            <div v-for="(regionFacility,regionName) in stateMilitaryFacilities" :key="regionName">
                <div class="flex flex-row ">
                    <h4 className="bg-black text-white p-2 text-xl">{{ regionName }}</h4>
                    <div  v-for="(facility,index) in regionFacility" :key="index" class="flex flex-col border  h-fit bg-gray-200    border border-3 border-gray-400 text-center bg-gray-100 ">
                        <span class="px-2 p-1 flex">  {{ facility.facilityName }}</span>
                    </div>
                    <div  v-for="(facility,index) in regionFacility" :key="index" class="border  h-fit bg-gray-200    border border-3 border-gray-400 text-center bg-gray-100 flex flex-col space-x-4">
                        <div class="  border-l border-r  border-gray-400 px-2 p-1 text-xs">{{ findEffect(facility.facilityName.toLowerCase()) }}</div>
                    </div>
                  
                </div>
            </div>

        </div>
    </div>
</template>

<script>
const _ = require("lodash");
export default {
    props:['state-facility-data'],
    mounted(){
        setTimeout(()=>{
            console.log(this.stateMilitaryFacilities,'WE DISCUSS HOW TO RESTORE A LEGION')
        },500)
    },
    computed:{
        stateMilitaryFacilities(){
            let data = this.stateFacilityData;
            let newData = _.merge(data.economy,data['food and resources'])
            console.log(newData,'rossikaya gundam')
            for(let regionObj in newData){
               newData[regionObj] = newData[regionObj].filter(facility=>facility.facilityName.includes('Port'))
                if(newData[regionObj].length <= 0){
                    delete newData[regionObj]
                }
            }
           
            console.log(newData,'chars redemption')
            newData = _.merge(newData,data.military)
            return newData
        },
      
    },
    methods:{
        findEffect(name){
            console.log(name.includes('military port'),'IRS REPORT')
           
            switch(true){
                case name.includes('barrack'):
                    return 'Unlock Melee Infantry, +1 Recruitment';
                case name.includes('stable'):
                    return 'Unlock Cavalry, +1 Recruitment';
                case name.includes('archer'):
                    return 'Unlock Missile Infantry, +1 Recruitment';
                case name.includes('smith'):
                    return 'Unlock Tier II and Tier III recruitment(ground)';
                case name.includes('siege'):
                    return 'Unlock Siege Weapons, +1 Recruitment';
                case name.includes('trade'):
                    return 'Unlock Light Ships';
                case name.includes('trade port'):
                    return 'Unlock Light Ships';
                case name.includes('military port'):
                   return 'Unlock Light, Medium, and Heavy Ships, +1 Naval Recruitment'
            }
        
        }
    }
   
}
</script>