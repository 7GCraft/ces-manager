<template>
    <div class="mt-4 flex flex-col space-y-2 max-w-4xl mx-auto my-1 mb-4">
        <h4 class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/3 mx-auto bg-havelockBlue text-white py-1 tracking-wider">State Trade</h4>
        <div class="grid grid-cols-3">
            <div v-for="tradeAgreement in stateTradeAgreements" :key="tradeAgreement.tradeAgreementId" class="border p-2 flex flex-col space-y-2">
                <h4 className="bg-black border w-full text-white p-1 text-2xl">{{ tradeAgreement.traders.map((trader)=>trader.state.stateName).join(" - ")}}</h4>
                <div v-for="(trader,index) in tradeAgreement.traders" :key="index" class="flex flex-col space-y-2">
                    <h4 class="text-xl font-semibold border-b-2 border-ceruleanBlue bg-ceruleanBlue border text-white text-center mx-auto  w-1/2 text-left text-xl px-1 capitalize  my-2 tracking-wide">{{ trader.state.stateName }}</h4>
                    <h6 class="">Traded Resources:</h6>
                    <div class="grid grid-cols-3 gap-2 px-4">
                        <h5 class="bg-fernGreen text-white text-xs py-1 px-1" v-for="resource in trader.resources" :key="resource.ResourceID">{{ resource.ResourceName }}</h5>
                    </div>
                    <p>Trade Power: {{ (trader.tradePower*100).toFixed(2) }}%</p>
                    <p>Trade Income: {{ trader.tradeValue.toFixed(2) }}G</p>
                    <div>

                    </div>
                </div>
            </div>

        </div>
        </div>
</template>

<script>
export default {
    props:['state-trade-agreements'],
    mounted(){
        setTimeout(()=>{
            console.log('TRADE',this.stateTradeAgreements)
        },500)
    }
}
</script>