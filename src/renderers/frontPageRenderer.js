const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');

$(function(){
    loadFrontPage();
    handleButtonandSubmitCalls();
})

/**
 * Start of functions called on dom load
 * These functions will be called in each templates of home.html, regionList.html, resources.html, stateList.html, and tradeAgreementList.html
 */

 //Functions that load everything to front page are placed here
function loadFrontPage() {

    //Load all states into State List
    getStateList();
    //Get All Resources
    getAllResourceTiers();
}

function handleButtonandSubmitCalls() {
    //Update Resources (resources.html)
    btnUpdateResources_onClick();
    frmAddResource_onSubmit();
}

/**
 * Loading related functions
 */
function getStateList(){
    ipcRenderer.send('StateList:getStateList');
    ipcRenderer.once('StateList:getStateListOK', function(e, res){
        res.forEach(state => {
            $('#ulStateList').append('<li><a class="states" href="#" data-id="'+state.StateID+'"  onclick=openStatePage(this.getAttribute("data-id"))>'+ state.StateName + '</a></li>')
        });
    });
}

function getAllResourceTiers(){
    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function(e, res){
        //console.log(res);
        res.forEach(resourceTier => {
            $('#listsOfResourceTiers').append('<div class="resourceContainer"><h4>'+ resourceTier.ResourceTierName + '('+resourceTier.ResourceTierTradePower * 100+'%)' +'</h4><ul class="resourceSortable" id="ResourceTier'+resourceTier.ResourceTierID+'"><li ondragover="dragOver(event)"></li></ul></div>')
            
            $('#selResourceTier').append($('<option>', {
                value: resourceTier.ResourceTierID,
                text: resourceTier.ResourceTierName
            }));
            
            resourceTier.Resources.forEach(resource => {
                $('#ResourceTier'+resourceTier.ResourceTierID).append('<li class="individualResource" draggable="true" ondragover="dragOver(event)" ondragstart="dragStart(event)" id="Resource'+resource.ResourceID+'">'+resource.ResourceName+'</li>')
            });
        });
    });
}

/**
 * End of Loading related functions
 */

 /**
  * Start of Button and Submit event related functions
  */

  function btnUpdateResources_onClick(){
    $('#btnUpdateResources').on('click', function(e){
        let resourceJsonObj = [];
        let resourceTiers = $('#listsOfResourceTiers').find('.resourceSortable');

        $.each(resourceTiers, (i, val) => {
            let resourceTierID = $(val).attr('id').replace('ResourceTier', '');
            let resources = $(val).find('.individualResource');

            $.each(resources, (j, val2) => {
                let resourceID = $(val2).attr('id').replace('Resource', '');
                let resourceName = $(val2).text();

                resource = {}
                resource["ResourceID"] = resourceID;
                resource["ResourceName"] = resourceName;
                resource["ResourceTierID"] = resourceTierID;

                resourceJsonObj.push(resource);
            })
        })

        //console.log(resourceJsonObj);

        ipcRenderer.send("Resource:updateResourceAll", resourceJsonObj);
        ipcRenderer.once("Resource:updateResourceAllOk", (e, res) => {
            if(res){
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated resources</div>')
            }
            else{
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating resources</div>')
            }
        })
    });
  }

  function frmAddResource_onSubmit(){
    $('#frmAddResource').on('submit', (e) => {
        e.preventDefault();
        
        let newResourceObj = {};

        let resourceTierID = $('#selResourceTier').val();
        let resourceName = $('#txtResourceName').val();

        newResourceObj["ResourceTierID"] = resourceTierID
        newResourceObj["ResourceName"] = resourceName


        ipcRenderer.send("Resource:addResource", newResourceObj);
        ipcRenderer.once("Resource:addResourceOK", (e, res) => {
            if(res){
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added resource</div>')
                $('.resourceContainer').remove();
                getAllResourceTiers();
            }
            else{
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding resource</div>')
            }

            $('#mdlAddResource').modal('toggle');
        })
    });
  }

  /**
   * End of Button and Submit event related functions
   */
//Called in home.html
function nextSeason(){
    const item = 'testVal';
    ipcRenderer.send('test', item);
}

//Called in getStateList()
function openStatePage(ID){
    //alert(ID);
    ipcRenderer.send('StateList:openStatePage', ID);
}

