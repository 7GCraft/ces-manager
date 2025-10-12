<template>
  <div>Hello</div>
</template>

<script>
export default {
  mounted() {},
  computed:{
        stateInfo(){
            return this.$store.getters.getViewedStateInfo;
        },
      
    }
};
</script>
