
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
    getStateList();

    //Test Get All Resource Tiers
    getAllResourceTiers();
}

function getStateList(){
    ipcRenderer.send('StateList:getStateList');
    ipcRenderer.on('StateList:getStateListOK', function(e, res){
        res.forEach(state => {
            $('#ulStateList').append('<li><a class="states" href="#" data-id="'+state.StateID+'"  onclick=openStatePage(this.getAttribute("data-id"))>'+ state.StateName + '</a></li>')
        });
    });
}

function getAllResourceTiers(){
    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.on('Resource:getAllResourceTiersOk', function(e, res){
        //console.log(res);
        res.forEach(resourceTier => {
            $('#listsOfResourceTiers').append('<div class="resourceContainer"><h3>'+ resourceTier.ResourceTierName +'</h3><ul class="resourceSortable" id="ResourceTier'+resourceTier.ResourceTierID+'"><li ondragover="dragOver(event)"></li></ul></div>')
            console.log(resourceTier.ResourceTierID);
            
            resourceTier.Resources.forEach(resource => {
                $('#ResourceTier'+resourceTier.ResourceTierID).append('<li draggable="true" ondragover="dragOver(event)" ondragstart="dragStart(event)" id="Resource'+resource.ResourceID+'">'+resource.ResourceName+'</li>')
            });
        });
    });
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

