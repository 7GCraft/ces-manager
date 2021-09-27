const electron = require('electron');
const { ipcRenderer } = electron;
const $ = require('jquery');
const fs = require('fs');
require('bootstrap');

// START UTILITY FUNCTIONS
function getProcessArgObj() {
    return JSON.parse(window.process.argv.slice(-1));
}

function getResourceTierLabel(resourceTierID) {
    switch (resourceTierID) {
        case 1: return 'Tier I';
        case 2: return 'Tier II';
        case 3: return 'Tier III';
        case 4: return 'Tier IV';
        case 5: return 'Tier V';
        case 6: return 'Tier VI';
    }
}
// END UTILITY FUNCTIONS

$(function () {
    //Assign tooltip to question mark icon beside productive header in resources tab
    $('.questionIcon').tooltip({
        title: 'Have been assigned to a functional facility'
    });
    //Load all state info on page open
    getStateInfo();
    //Delete state
    btnDeleteState_onClick();
    //Update State
    frmUpdateState_onSubmit();
    //Handle events from main page
    pageMain_eventHandler();
    //Handle events from region page
    pageRegion_eventHandler();
})

function getStateInfo() {
    ipcRenderer.send("State:getStateInfo", parseInt(getProcessArgObj()));
    ipcRenderer.once("State:getStateInfoOK", function (e, res) {
        $('#lblStateName').text(res.stateName);
        $('#lblDescription').text(res.desc);
        $('#lblStateTreasury').text(parseFloat(res.treasuryAmt).toFixed(1));
        $('#lblTotalIncome').text(parseFloat(res.TotalIncome).toFixed(2));
        $('#lblExpenses').text(res.expenses);
        $('#lblFoodProduced').text(res.TotalFoodProduced);
        $('#lblFoodConsumed').text(res.TotalFoodConsumed);
        $('#lblFoodAvailable').text(res.TotalFoodAvailable);
        $('#lblPopulation').text(res.TotalPopulation);
        $('#lblAvgDevelopment').text(res.AvgDevLevel);
        $('#lblAdminCost').text(parseFloat(res.adminCost).toFixed(2));
        $('#lblFacilityCount').text(res.facilityCount);
        $('#lblTotalExpenses').text(parseFloat(res.expenses + res.adminCost).toFixed(2));
        $('#lblNextIncome').text(parseFloat(res.TotalIncome - res.expenses - res.adminCost).toFixed(2));

        $('#txtStateName').val(res.stateName);
        $('#nmbTreasury').val(res.treasuryAmt);
        $('#txtDescription').val(res.desc);
        $('#nmbExpenses').val(res.expenses);
    });

    getRegions();
    getResources();
    getTradeAgreements();

    let imagePath = 'src/images';
    if (!fs.existsSync(imagePath)) {
        imagePath = '../' + imagePath;
    }
    fs.readdir(imagePath, (err, files) => {
        if (err) {
            console.log(err)
        }
        else {

            for (let file of files) {
                let id = file.match(/(\d+)/);

                if (parseInt(getProcessArgObj()) == id[0]) {
                    console.log(file);
                    $('.jumbotron').css('background-image', `url(../images/${file})`);
                    $('.jumbotron').css('background-size', 'contain');
                    break;
                }
            }

        }
    })
}

function getRegions() {
    ipcRenderer.send("State:getRegionsForState", parseInt(getProcessArgObj()));
    ipcRenderer.once("State:getRegionsForStateOK", (e, res) => {
        $('#listOfRegions').empty();
        if (Array.isArray(res) && res.length) {
            res.forEach(region => {
                $('#listOfRegions').append('<li class="individualRegion" id="Region' + region.RegionID + '"><a href=# onclick=openRegionPage(this.parentNode.getAttribute("id")) >' + region.RegionName + '</a><span class="totalIncome">' + region.RegionTotalIncome + '</span><span class="totalFood">' + region.RegionTotalFood + '</span><span class="population">' + region.Population + '</span></li>')
            });
        }
    });
}

function getResources() {
    ipcRenderer.send('Resource:getAllResourcesByStateId', parseInt(getProcessArgObj()));
    ipcRenderer.once('Resource:getAllResourcesByStateIdOk', (e, res) => {
        $('#tblResources tr').not('#noResourceRow,#resourceTemplateRow').remove();
        if (Array.isArray(res) && res.length) {
            $('#noResourceRow').hide();
            res.forEach(resource => {
                const resourceRow = createResourceRow(resource);
                $('#tblResources').append(resourceRow);
            });
            indexTable('tblResources', 'numberCell', ['#resourceTemplateRow', '#noResourceRow']);
        }
        else {
            $('#noResourceRow').show();
        }
    })
}

function getTradeAgreements() {
    ipcRenderer.send('Trade:getTradeAgreementsByStateId', parseInt(getProcessArgObj()));
    ipcRenderer.once('Trade:getTradeAgreementsByStateIdOK', (e, res) => {
        $('#tradeAgreements').empty();
        if (Array.isArray(res) && res.length) {
            res.forEach(agreement => {
                let firstHasDisabledResource = false;
                let secondHasDisabledResource = false;

                let resourceProducedFirstState = () => {
                    let resourceStr1 = '';
                    if (agreement.traders[0].resources !== null) {
                        agreement.traders[0].resources.forEach(resource => {
                            if (resource !== null) resourceStr1 += resource.ResourceName + ', ';
                            else firstHasDisabledResource = true;
                        })
                        resourceStr1 = resourceStr1.slice(0, -2);
                    } else {
                        resourceStr1 = 'No traded resources.';
                    }
                    return resourceStr1;
                }

                let resourceProducedSecondState = () => {
                    let resourceStr2 = '';
                    if (agreement.traders[1].resources !== null) {
                        agreement.traders[1].resources.forEach(resource => {
                            if (resource != null) resourceStr2 += resource.ResourceName + ', ';
                            else secondHasDisabledResource = true;
                        })
                        resourceStr2 = resourceStr2.slice(0, -2);
                    } else {
                        resourceStr2 = 'No traded resources.';
                    }
                    return resourceStr2;
                }

                let resources1 = '<td>' + resourceProducedFirstState() + '</td>';
                let resources2 = '<td>' + resourceProducedSecondState() + '</td>';

                if (firstHasDisabledResource) resources1 = '<td class="bg-danger text-white">' + resourceProducedFirstState() + '</td>';
                if (secondHasDisabledResource) resources2 = '<td class="bg-danger text-white">' + resourceProducedSecondState() + '</td>';

                $('#tradeAgreements')
                    .append(
                        '<tr>' +
                        '<td>' + agreement.traders[0].state.stateName + '</td>' +
                        '<td>' + resourceProducedFirstState() + '</td>' +
                        '<td>' + parseFloat(agreement.traders[0].tradePower * 100).toFixed(1) + '%</td>' +
                        '<td>' + parseFloat(agreement.traders[0].tradeValue).toFixed(2) + '</td>' +
                        '<td>' + agreement.traders[1].state.stateName + '</td>' +
                        '<td>' + resourceProducedSecondState() + '</td>' +
                        '<td>' + parseFloat(agreement.traders[1].tradePower * 100).toFixed(1) + '%</td>' +
                        '<td>' + parseFloat(agreement.traders[1].tradeValue).toFixed(2) + '</td>' +
                        '<td>' + agreement.desc + '</td>' +
                        +'</tr>'
                    );
            })
        }
    });
}

function btnDeleteState_onClick() {
    $('#btnDeleteState').on('click', (e) => {
        e.preventDefault();

        ipcRenderer.send("State:deleteState", parseInt(getProcessArgObj()))
        ipcRenderer.once("State:deleteStateOK", (e, res) => {
            if (res) {
                alert("Successfully deleted state");
                ipcRenderer.send("ClosePageOnDelete");
            }
            else {
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting state</div>')
            }
            $('#mdlDeleteState').modal('toggle');
        });
    });
}

/**
 * Create an HTML element from given resource data based on view template
 * @param {Object} resource Resource object with additional CountAll and CountProductive properties
 * @returns {JQuery<HTMLElement>} Row HTML Element
 */
function createResourceRow(resource) {
    let clonedTemplate = $('#resourceTemplateRow').clone().removeAttr('id');
    clonedTemplate.data('resourceData', resource);
    clonedTemplate.find('#nameCell').text(resource.ResourceName);

    let resourceTierLabel = getResourceTierLabel(resource.ResourceTierID);
    clonedTemplate.find('#tierCell').text(resourceTierLabel);

    clonedTemplate.find('#countAllCell').text(resource.CountAll);
    clonedTemplate.find('#countProductiveCell').text(resource.CountProductive);
    return clonedTemplate;
}

/**
 * Index a table by giving number to each rows
 * @param {String} tableId Component's table ID that needs to be indexed
 * @param {String} numberCellId ID attribute of HTML element from row that needs to be given number
 * @param {String[]} excludedRows List of excluded class/id rows to be excluded from indexing
 */
function indexTable(tableId, numberCellId, excludedRows = null) {
    let rows = $(`#${tableId}`).children('tr');
    if (excludedRows !== null) {
        rows = rows.not(excludedRows.join());
    }
    rows.each(function (i, row) {
        $(row).find(`#${numberCellId}`).text(i + 1);
    });
}

function frmUpdateState_onSubmit() {
    $('#frmUpdateState').on('submit', (e) => {
        e.preventDefault();

        let stateObj = {};

        stateObj["stateID"] = parseInt(getProcessArgObj())
        stateObj["stateName"] = $('#txtStateName').val();
        stateObj["treasuryAmt"] = ($('#nmbTreasury').val() == "") ? 0 : parseInt($('#nmbTreasury').val());
        stateObj["expenses"] = ($('#nmbExpenses').val() == "") ? 0 : parseInt($('#nmbExpenses').val());
        stateObj["desc"] = $('#txtDescription').val();

        console.log(stateObj);

        ipcRenderer.send("State:updateState", stateObj);
        ipcRenderer.once("State:updateStateOK", (e, res) => {
            if (res) {
                alert("Successfully updated state");
                ipcRenderer.send("ReloadPageOnUpdate");
            }
            else {
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating state</div>');
            }

            $('#mdlUpdateState').modal('toggle');
        });
    });
}

//called on region click
function openRegionPage(ID) {
    let regionID = ID.replace('Region', '');
    ipcRenderer.send('Region:openRegionPage', regionID);
}

function pageMain_eventHandler() {
    ipcRenderer.on('Region:addRegionOK', regionData_onChange);
    ipcRenderer.on('Trade:addTradeAgreementOK', tradeAgreementData_onChange);
    ipcRenderer.on('Trade:updateTradeAgreementOK', tradeAgreementData_onChange);
    ipcRenderer.on('Trade:deleteTradeAgreementOK', tradeAgreementData_onChange);
    ipcRenderer.on('Resource:updateResourceAllOK', (e, res) => {
        if (res) {
            getStateInfo();
        }
    });
}

function pageRegion_eventHandler() {
    ipcRenderer.on('Region:updateRegionOK', regionData_onChange);
    ipcRenderer.on('Facility:updateFacilityOK', regionData_onChange);
    ipcRenderer.on('Facility:deleteFacilityOK', regionData_onChange);
    ipcRenderer.on('Component:addComponentOK', regionData_onChange);
    ipcRenderer.on('Component:updateComponentOK', regionData_onChange);
    ipcRenderer.on('Component:deleteComponentOK', regionData_onChange);
}

function regionData_onChange(e, res) {
    if (res) {
        getStateInfo();
    }
}

function tradeAgreementData_onChange(e, res) {
    if (res) {
        getStateInfo();
    }
}