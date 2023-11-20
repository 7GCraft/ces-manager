<template>
    <div class="mt-4 flex flex-col space-y-2 max-w-3xl mx-auto my-1 mb-4">
        <h4 class="text-2xl mb-4 ">State Info</h4>
        <div class="grid grid-cols-2 gap-y-10">
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl font-semibold px-1">Finances</h4>
                <div class="border-b-2 border-yellow-500 w-1/2 "></div>
                <div class="leading-8 tracking-wider">
                <p class="pt-1">Treasury: <span class="font-semibold">{{ treasury }}G</span></p>
                <p class=" ">Total Income:<span class="font-semibold"> {{ totalIncome }}G</span></p>
                <p class="">Next Season Income: {{ nextIncome }}</p>
                <p class="pt-1">Administration Cost: {{ adminCost }}G</p>
                <p class="">Admin Cost Modifier: {{ adminCostModifier }}%</p>
                <p class="">Military, Diplomatic & Misc. Expenses: {{ expenses }}G</p>
                <p class=""> Total Expenses: {{ totalExpenses }}G</p>
            </div>
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Development</h4>
                <div class="border-b-2 border-blue-500 w-1/2 "></div>
                <div class="leading-8 tracking-wider">
                <p class="pt-1">Total Population: {{ population }} Pop</p>
                <p class="pt-1">Average Development Level: {{ averageDevLevel }}</p>
                <p class="pt-1">Facility Count:{{ facilityCount}} Facilities</p>
                </div>
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Food</h4>
                <div class="border-b-2 border-green-500 w-1/2 "></div>
                <div class="leading-8 tracking-wider">
                    <p class="pt-1">Total Food Produced:{{ totalFoodProduced }} Food</p>
                    <p class="pt-1">Total Food Consumed: {{ totalFoodConsumed }}</p>
                    <p class="pt-1">Total Food Available:{{ totalFoodBalance}} Facilities</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    mounted(){
        console.log('secrets of ',this.stateInfo)
    },
    props:['stateInfo'],
    computed:{
        treasury(){
            return this.stateInfo.treasuryAmt
        },
        totalIncome(){
            return this.stateInfo.TotalIncome
        },
        adminCost(){
            return this.stateInfo.adminCost
        },
        adminCostModifier(){
            return (this.stateInfo.adminRegionModifier *100) +100
        },
        expenses(){
            return this.stateInfo.expenses
        },
        totalExpenses(){
            return this.expenses + this.stateInfo.adminCost
        },
        nextIncome(){
            return this.totalIncome - this.totalExpenses
        },
        averageDevLevel(){
            return this.stateInfo.AvgDevLevel
        },
        facilityCount(){
            return this.stateInfo.facilityCount
        },
        totalFoodProduced(){
            return this.stateInfo.TotalFoodProduced
        },  
        totalFoodConsumed(){
            return this.stateInfo.TotalFoodConsumed
        },
        totalFoodBalance(){
            return this.stateInfo.TotalFoodAvailable
        }
    }
}
</script>