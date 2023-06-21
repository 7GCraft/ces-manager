<template>
  <the-landing v-if="!landed"></the-landing>
  <the-homepage v-if="landed"></the-homepage>
</template>

<script>
import TheHomepage from './pages/TheHomepage.vue'
import TheLanding from './pages/TheLanding.vue';

export default {
  name: 'App',
  components: {
    TheHomepage,
    TheLanding
  },
  data(){
    return{
      isLanded: false
    }
  },
  mounted(){
    if(localStorage.getItem('landed')){
      this.isLanded = true
    }
  }
}
</script>

    TheHomepage
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}
</style>
