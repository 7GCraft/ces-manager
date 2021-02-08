const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');

console.log("Page Opened");

$(function(){
    console.log('DOMLOADED');
    
    ipcRenderer.send("State:getStateInfo");
    ipcRenderer.on("State:getStateInfoOK", function(e, res){
        console.log("MAP FROM DB")
        $('#lblStateName').text(res.StateName);
        $('#lblStateTreasury').text(res.TreasuryAmt);
    });
})
