<template>
  <state-list></state-list>
</template>

<script>
  import StateList from './pages/StateList.vue'

export default {

  name: 'App',
  components: {
    StateList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
