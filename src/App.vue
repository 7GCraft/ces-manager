<template>
  <the-landing @landed="setLanding" v-if="!isLanded"></the-landing>
  <the-homepage v-if="isLanded"></the-homepage>
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
  methods: {
    setLanding(){
      this.isLanded = true
      localStorage.setItem('landed',true)
    }
  },
  mounted(){
    if(localStorage.getItem('landed')){
      this.isLanded = false
    }
  },


}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}
</style>
