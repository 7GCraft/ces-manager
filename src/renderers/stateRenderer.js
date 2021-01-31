const electron = require('electron');
const ipc = electron.ipcRenderer;
const $ = require('jquery');

console.log("Page Opened");

$(function(){
    console.log("DOMContentLoaded");
    ipc.send('stateInfoLoaded', 'SAL');
    ipc.on("resultSent", function(e, res){
        $('#lblStateName').text(res.StateName);
        $('#lblStateTreasury').text(res.Treasury);
    });
})