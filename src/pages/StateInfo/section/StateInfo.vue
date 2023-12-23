<template>
    <div class="mt-4 flex flex-col space-y-2 max-w-3xl mx-auto my-1 mb-4">
        <h4 class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/4 mx-auto bg-havelockBlue text-white py-1 tracking-wider">State Info</h4>
        <div class="grid grid-cols-2 gap-y-10">
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl font-semibold px-1">Finances</h4>
                <div class="border-b-2 border-yellow-500 w-1/2 "></div>
                <div class="leading-8 tracking-wider">
                <p class="pt-1">Treasury: <span class="font-semibold">{{ treasury ? treasury.toFixed(2) :'' }}G</span></p>
                <p class=" ">Total Income:<span class="font-semibold"> {{ totalIncome ? totalIncome.toFixed(2):'' }}G</span></p>
                <p class="">Next Season Income:<span class="font-semibold">{{nextIncome ? nextIncome.toFixed(2):'' }}G</span> </p>
                <p class="pt-1">Administration Cost:<span class="font-semibold">{{adminCost? adminCost.toFixed(2):'' }}G</span> </p>
                <p class="">Admin Cost Modifier:<span class="font-semibold"> {{ adminCostModifier }}%</span></p>
                <p class="">Military, Diplomatic & Misc. Expenses: <span class="font-semibold">{{ expenses ? expenses.toFixed(2):'' }}G</span></p>
                <p class=""> Total Expenses:<span class="font-semibold"> {{totalExpenses? totalExpenses.toFixed(2):'' }}G</span></p>
            </div>
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Development</h4>
                <div class="border-b-2 border-blue-500 w-1/2 "></div>
                <div class="leading-8 tracking-wider">
                <p class="pt-1">Total Population:<span class="font-semibold"> {{ population }} Pop</span></p>
                <p class="pt-1">Average Dev Level:<span class="font-semibold">Level {{ averageDevLevel }}</span> </p>
                <p class="pt-1">Facility Count:<span class="font-semibold">{{ facilityCount}} Facilities</span></p>
                </div>
            </div>
            <div class="text-left px-4 flex flex-col space-y-1">
                <h4 class="text-xl px-1 font-semibold">Food</h4>
                <div class="border-b-2 border-green-500 w-1/2 "></div>
                <div class="leading-8 tracking-wider">
                    <p class="pt-1">Total Food Produced:<span class="font-semibold">{{ totalFoodProduced }} Food</span></p>
                    <p class="pt-1">Total Food Consumed: <span class="font-semibold">{{ totalFoodConsumed }} Food</span></p>
                    <p class="pt-1">Total Food Available:<span class="font-semibold">{{ totalFoodBalance}} Food</span></p>
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
        },
        population(){
            return this.stateInfo.TotalPopulation
        }
    }
}
</script>