<template>
    <div class="text-center w-full p-4">{{ stateInfo.stateName }}</div>
    <router-view></router-view>
</template>

<script>
export default {
    mounted(){
        let stateName = this.$route.params.stateId
        console.log('we are here',stateName)
        console.log(this.stateInfo,'brahman')
        setTimeout(()=>{
            console.log(this.stateInfo,'lakasha this state info')
            console.log(this.stateFacilities,'lakasha this facilities')
            console.log(this.stateResources,'lakasha this resources')
            console.log(this.stateRegions,'lakasha this regions')
            console.log(this.stateTradeAgreements,'lakasha this trade')
        },1000)
    },
    methods(){

    },
    computed:{
        stateInfo(){
            return this.$store.getters.getViewedStateInfo;
        },
        stateFacilities(){
            return this.$store.getters.getViewedStateFacilities;
        },
        stateResources(){
            return this.$store.getters.getViewedStateResources;
        },
        stateRegions(){
            return this.$store.getters.getViewedStateRegions;
        },
        stateTradeAgreements(){
            return this.$store.getters.getViewedStateTradeAgreements;
        }
    }
}
</script>