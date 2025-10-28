<template>
  <div>Region : {{ regionInfo.regionName }}</div>
</template>

<script>
export default {
  mounted() {
    
  },
  computed:{
        regionInfo(){
            return this.$store.getters.getViewedRegionInfo;
        },
    }
};
</script>
