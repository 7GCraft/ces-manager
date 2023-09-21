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
    },
    methods(){

    },
    computed:{
        stateInfo(){
            return this.$store.getters.getViewedStateInfo;
        },
        stateRegions(){
            
        }
    }
}
</script>