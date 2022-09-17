<template>
    <b-nav id="nav" :vertical="vertical || false" :class="styling" :align="align || ''">
        <b-nav-item v-for="item in items" :active="item.active" v-bind:key="item.text">
            {{item.text}}
        </b-nav-item>
    </b-nav>
  </template>
  
  <script>
  export default {
    name: 'Nav',
    props:{
        items: Array,
        vertical: Boolean,
        styling: String
    }
  }
  </script>
  
  <style>

  </style>
  