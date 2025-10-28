<template>
  <div>Hello 2</div>
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
