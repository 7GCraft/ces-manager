const electron = require('electron');
const { ipcRenderer } = electron;
const $ = require('jquery');

$(function () {
    loadFrontPage();
    handleButtonandSubmitCalls();
})

//Functions that load everything to front page are placed here
function loadFrontPage() {

    //Load all states into State List
    getStateList();
    //Get All Resources
    getAllResourceTiers();
    //Get All regions by State ID
    getAllRegionsByStateId();
}

function handleButtonandSubmitCalls() {
    //Add state
    frmAddState_onSubmit();

    //Add Region
    frmAddRegion_onSubmit();

    //Update Resources (resources.html)
    btnUpdateResources_onClick();
    //Add Resource
    frmAddResource_onSubmit();
    //Delete Resource
    frmDeleteResource_onSubmit();
}

/**
 * Loading related functions
 */
function getStateList() {
    ipcRenderer.send('State:getStateList');
    ipcRenderer.once('State:getStateListOK', function (e, res) {
        console.log(res);
        $('#stateContainer').append('<ul id="ulStateList"></ul>')
        res.forEach(state => {
            $('#ulStateList').append('<li><a class="states" href="#" data-id="State' + state.stateID + '"  onclick=openStatePage(this.getAttribute("data-id"))>' + state.stateName + '</a></li>')
        });
    });
}

function getAllResourceTiers() {
    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function (e, res) {
        //console.log(res);
        res.forEach(resourceTier => {
            $('#listsOfResourceTiers').append('<div class="resourceContainer"><h4>' + resourceTier.ResourceTierName + '(' + resourceTier.ResourceTierTradePower * 100 + '%)' + '</h4><ul class="resourceSortable" id="ResourceTier' + resourceTier.ResourceTierID + '"><li ondragover="dragOver(event)"></li></ul></div>')

            resourceTier.Resources.forEach(resource => {
                $('#ResourceTier' + resourceTier.ResourceTierID).append('<li class="individualResource" draggable="true" ondragover="dragOver(event)" ondragstart="dragStart(event)" id="Resource' + resource.ResourceID + '">' + resource.ResourceName + '</li>')

                $('#selResourceDelete').append($('<option>', {
                    value: resource.ResourceID,
                    text: resource.ResourceName
                }));
            });

            $('#selResourceTier').append($('<option>', {
                value: resourceTier.ResourceTierID,
                text: resourceTier.ResourceTierName
            }));
        });
    });
}

function getAllRegionsByStateId() {
    ipcRenderer.send('Region:getAllRegionsByStateId');
    ipcRenderer.once('Region:getAllRegionsByStateIdOK', (e, res) => {
        res.forEach(state => {
            if (Array.isArray(state.Regions) && state.Regions.length) {
                $('#listOfRegionsByState').append('<div class="regionContainer"><h5>' + state.stateName + '</h5><ul class="regionsList" id="StateRegion' + state.stateID + '"></ul></div>')

                state.Regions.forEach(region => {
                    $('#StateRegion' + state.stateID).append('<li class="individualRegion" id="Region' + region.RegionID + '" onclick=openRegionPage(this.getAttribute("id"))><a href=#>' + region.RegionName + '</a><span class="totalIncome">' + region.RegionTotalIncome + '</span><span class="totalFood">' + region.RegionTotalFood + '</span></li>')
                });
            }
        });
    });

    ipcRenderer.send('Region:getStatesForAdd');
    ipcRenderer.once('Region:getStatesForAddOK', (e, res) => {

        res.forEach(state => {
            $('#selState').append($('<option>', {
                value: state.stateID,
                text: state.stateName
            }));
        });
    });

    ipcRenderer.send('Region:getBiomesForAdd');
    ipcRenderer.once('Region:getBiomesForAddOK', (e, res) => {
        console.log(res);

        res.forEach(biome => {
            $('#selBiome').append($('<option>', {
                value: biome.biomeId,
                text: biome.biomeName
            }));
        });
    });

    ipcRenderer.send('Region:getDevelopmentForAdd');
    ipcRenderer.once('Region:getDevelopmentForAddOK', (e, res) => {
        res.forEach(dev => {
            $('#selDevelopment').append($('<option>', {
                value: dev.developmentId,
                text: dev.developmentName
            }));
        });

    });

    ipcRenderer.send('Region:getCorruptionForAdd');
    ipcRenderer.once('Region:getCorruptionForAddOK', (e, res) => {
        res.forEach(corruption => {
            $('#selCorruption').append($('<option>', {
                value: corruption.corruptionId,
                text: corruption.corruptionName
            }));
        });

    });
}

/**
 * End of Loading related functions
 */

/**
 * Start of Button and Submit event related functions
 */

function frmAddState_onSubmit() {
    $('#frmAddState').on('submit', function (e) {
        e.preventDefault();

        let stateObj = {};

        stateObj["stateName"] = $('#txtStateName').val();
        stateObj["treasuryAmt"] = ($('#nmbTreasury').val() == "") ? 0 : parseInt($('#nmbTreasury').val());
        stateObj["desc"] = $('#txtDescription').val();

        ipcRenderer.send('State:addState', stateObj);
        ipcRenderer.once('State:addStateOK', (e, res) => {
            if (res) {
                $('#stateListMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added state</div>')
                $('#ulStateList').remove();
                getStateList();
            }
            else {
                $('#stateListMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding state</div>')
            }

            $('#mdlAddState').modal('toggle');
        });
    });
}

function frmAddRegion_onSubmit() {
    $('#frmAddRegion').on('submit', (e) => {
        e.preventDefault();

        let regionObj = {};

        let isValid = true;
        const regionName = $('#txtRegionName').val();
        const population = $('#nmbPopulation').val();

        if (regionName == null || regionName == '') {
            isValid = false;
            $('#txtRegionName').addClass('is-invalid');
        }
        else {
            $('#txtRegionName').removeClass('is-invalid');
        }

        if (population == null || population == '') {
            isValid = false;
            $('#nmbPopulation').addClass('is-invalid');
            $('#nmbPopulationMessage').text('Population cannot be empty');
        }
        else if (parseInt(population) <= 0) {
            isValid = false;
            $('#nmbPopulation').addClass('is-invalid');
            $('#nmbPopulationMessage').text('Population cannot be less or equal to zero');
        }
        else {
            $('#nmbPopulation').removeClass('is-invalid');
        }

        if (!isValid) {
            return;
        }

        regionObj['regionName'] = $('#txtRegionName').val();
        regionObj['state'] = { 'stateId': parseInt($('#selState').val()) };
        regionObj['corruption'] = { 'corruptionId': parseInt($('#selCorruption').val()) };
        regionObj['biome'] = { 'biomeId': parseInt($('#selBiome').val()) };
        regionObj['development'] = { 'developmentId': parseInt($('#selDevelopment').val()) };
        regionObj['population'] = parseInt($('#nmbPopulation').val());
        regionObj['desc'] = $('#txtDescRegion').val();

        console.log(regionObj);
          regionObj['regionName'] = $('#txtRegionName').val();
          regionObj['state'] = {'stateId' : parseInt($('#selState').val())};
          regionObj['corruption'] = {'corruptionId': parseInt($('#selCorruption').val())};
          regionObj['biome'] = {'biomeId' : parseInt($('#selBiome').val())};
          regionObj['development'] = {'developmentId' :parseInt( $('#selDevelopment').val())};
          regionObj['population'] = parseInt($('#nmbPopulation').val());
          regionObj['desc'] = $('#txtDescRegion').val();
          regionObj['taxRate'] = parseFloat($('#nmbTaxRate').val());

          //console.log(regionObj);

        ipcRenderer.send('Region:addRegion', regionObj);
        ipcRenderer.once('Region:addRegionOK', (e, res) => {
            if (res) {
                $('#regionListMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added region</div>')
                $('#listOfRegionsByState').empty();
                getAllRegionsByStateId();
            }
            else {
                $('#regionListMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding region</div>')
            }
            $('#mdlAddRegion').modal('toggle');
        });
    })
}

function btnUpdateResources_onClick() {
    $('#btnUpdateResources').on('click', function (e) {
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
        ipcRenderer.once("Resource:updateResourceAllOK", (e, res) => {
            if (res) {
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated resources</div>')
            }
            else {
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating resources</div>')
            }
        })
    });
}

function frmAddResource_onSubmit() {
    $('#frmAddResource').on('submit', (e) => {
        e.preventDefault();

        let newResourceObj = {};

        let resourceTierID = $('#selResourceTier').val();
        let resourceName = $('#txtResourceName').val();

        newResourceObj["ResourceTierID"] = resourceTierID
        newResourceObj["ResourceName"] = resourceName


        ipcRenderer.send("Resource:addResource", newResourceObj);
        ipcRenderer.once("Resource:addResourceOK", (e, res) => {
            if (res) {
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added resource</div>')
                $('.resourceContainer').remove();
                getAllResourceTiers();
            }
            else {
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding resource</div>')
            }

            $('#mdlAddResource').modal('toggle');
        })
    });
}

function frmDeleteResource_onSubmit() {
    $('#frmDeleteResource').on('submit', (e) => {
        e.preventDefault();

        let selectedResources = $('#selResourceDelete').val();
        ipcRenderer.send("Resource:deleteResourceById", selectedResources);
        ipcRenderer.once("Resource:deleteResourceByIdOk", (e, res) => {
            if (res) {
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully deleted resources</div>')
                $('.resourceContainer').remove();
                getAllResourceTiers();
            }
            else {
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting resources</div>')
            }

            $('#mdlDeleteResource').modal('toggle');
        });

    })
}

/**
 * End of Button and Submit event related functions
 */
//Called in home.html
function nextSeason() {
    const item = 'testVal';
    ipcRenderer.send('test', item);
}

//Called in getStateList()
function openStatePage(ID) {
    let stateID = ID.replace('State', '');
    //alert(stateID);
    ipcRenderer.send('State:openStatePage', stateID);
}

//called on region click

function openRegionPage(ID) {
    let regionID = ID.replace('Region', '');
    ipcRenderer.send('Region:openRegionPage', regionID);
}
