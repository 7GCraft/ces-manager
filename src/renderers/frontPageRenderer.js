
const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');

$(function(){
    initializeFrontPageIpcRenderers();
})

/**
 * Start of functions called on dom load
 * These functions will be called in each templates of home.html, regionList.html, resources.html, stateList.html, and tradeAgreementList.html
 */

 //IPCRenderers are placed here
function initializeFrontPageIpcRenderers() {

    //Load all states into State List
    ipcRenderer.send('StateList:getStateList');
    ipcRenderer.on('StateList:getStateListOK', function(e, res){
        res.forEach(state => {
            $('#ulStateList').append('<li><a class="states" href="#" data-id="'+state.StateID+'"  onclick=openStatePage(this.getAttribute("data-id"))>'+ state.StateName + '</a></li>')
        });
    });

    //Test Get All Resource Tiers
    ipcRenderer.send('Resource:getAllResourceTiers');
}

//Called in home.html
function nextSeason(){
    const item = 'testVal';
    ipcRenderer.send('test', item);
}

//Called  in ipcRenderer StateList:getStateListOK
function openStatePage(ID){
    //alert(ID);
    ipcRenderer.send('StateList:openStatePage', ID);
}

