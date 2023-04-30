<template>
<div class=" w-screen h-screen p-4 px-4 md:px-8 lg:px-16">
  <!-- Content goes here -->
  <div class="flex flex-row shadow-lg p-8 w-fit border border-4">
  <div class="base-menu flex flex-col bg-white ">
        <div class="flex flex-col space-y-2 md:flex-row items-center md:space-y-0 md:space-x-4 border border-gray-200 p-2 px-4">
        <img src="./assets/ces_logo.png" class="rounded-full bg-transparent object-fill h-24 round-xl"/>
         
        <h2 class="font-semibold text-xl  ">
          CES Application
        </h2>
      </div>
        <div class="flex-col flex border border-gray-200">
         <a class="hover:bg-blue-200 p-2 hover:font-semibold border-b border-gray-200">Home </a>
         <a class="hover:bg-blue-200 p-2 hover:font-semibold border-gray-200 border">State List</a>
         <a class="hover:bg-blue-200 p-2 hover:font-semibold border-gray-200 border">Region List</a>
         <a class="hover:bg-blue-200 p-2 hover:font-semibold border-gray-200 border">Trade Agreement</a>
         <a class="hover:bg-blue-200 p-2 hover:font-semibold border-gray-200 border">Resource List</a>
        </div>
      </div>
      <div class="state-list flex flex-col space-y-0 items-center py-0 border border-gray-200" >
        <h3 class=" px-24 py-4 bg-gray-500 text-white text-2xl w-full  border-gray-500 border-4">State List</h3>
        <ul class="flex w-full flex-wrap flex-col items-center justify-start mb-6 text-gray-900 dark:text-white">
    <li class="w-full bg-gray-700 text-white p-2">
        <a href="#" class="mr-4 hover:underline md:mr-6 py-2 px-100 ">Sal Set</a>
    </li>
    <li class="w-full bg-gray-700 text-white p-2">
        <a href="#" class="mr-4 hover:underline md:mr-6 py-2 px-100 ">Sal Set</a>
    </li>
    <li class="w-full bg-gray-700 text-white p-2">
        <a href="#" class="mr-4 hover:underline md:mr-6 py-2 px-100 ">Sal Set</a>
    </li>
    <li class="w-full bg-gray-700 text-white p-2">
        <a href="#" class="mr-4 hover:underline md:mr-6 py-2 px-100 ">Sal Set</a>
    </li>
    <li class="w-full bg-gray-700 text-white p-2">
        <a href="#" class="mr-4 hover:underline md:mr-6 py-2 px-100 ">Sal Set</a>
    </li>
    <li class="w-full bg-gray-700 text-white p-2">
        <a href="#" class="mr-4 hover:underline md:mr-6 py-2 px-100 ">Sal Set</a>
    </li>
   
        </ul>
      </div>
    </div>
  </div>
  <the-homepage></the-homepage>
</template>

<script>
import TheHomepage from './pages/TheHomepage.vue'
// import { ipcRenderer } from 'electron'


export default {

  name: 'App',
  components: {
    TheHomepage
  },
  mounted(){
    // ipcRenderer.send('State:getStateList');
    // ipcRenderer.once('State:getStateListOK', function (e, res) {
    //     console.log(res);
    // });
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
