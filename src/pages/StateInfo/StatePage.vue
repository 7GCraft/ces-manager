<template>
    <div class="text-center w-full p-4">{{ stateInfo.stateName }}</div>
    <router-view></router-view>
</template>

<script>
export default {
    mounted(){
        let stateName = this.$route.params.stateId
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