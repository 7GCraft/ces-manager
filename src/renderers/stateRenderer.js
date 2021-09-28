const electron = require('electron');
const { ipcRenderer } = electron;
const $ = require('jquery');
const fs = require('fs');
require('bootstrap');

$(function () {
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
    ipcRenderer.send("State:getStateInfo", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once("State:getStateInfoOK", function (e, res) {
        let count = 1;
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

        $('#tblResources').empty();
        res.ProductiveResources.forEach(resource => {
            let tierStr = () => {
                switch (resource.ResourceTierID) {
                    case 1: return 'Tier I';
                    case 2: return 'Tier II';
                    case 3: return 'Tier III';
                    case 4: return 'Tier IV';
                    case 5: return 'Tier V';
                    case 6: return 'Tier VI';
                }
            }
            $('#tblResources').append('<tr><th scope="row">' + count + '</th><td>' + resource.ResourceName + '</td><td>' + tierStr() + '</td></tr>')
            count++;
        })
    });

    getRegions();
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

                if (parseInt(window.process.argv.slice(-1)) == id[0]) {
                    $('.jumbotron').css('background-image', `url(../images/${file})`);
                    $('.jumbotron').css('background-size', 'contain');
                    break;
                }
            }

        }
    })
}

function getRegions() {
    ipcRenderer.send("State:getRegionsForState", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once("State:getRegionsForStateOK", (e, res) => {
        $('#listOfRegions').empty();
        if (Array.isArray(res) && res.length) {
            res.forEach(region => {
                $('#listOfRegions').append('<li class="individualRegion" id="Region' + region.RegionID + '"><a href=# onclick=openRegionPage(this.parentNode.getAttribute("id")) >' + region.RegionName + '</a><span class="totalIncome">' + region.RegionTotalIncome + '</span><span class="totalFood">' + region.RegionTotalFood + '</span><span class="population">' + region.Population + '</span></li>')
            });
        }
    });
}

function getTradeAgreements() {
    ipcRenderer.send('Trade:getTradeAgreementsByStateId', parseInt(window.process.argv.slice(-1)));
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

        ipcRenderer.send("State:deleteState", parseInt(window.process.argv.slice(-1)))
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

function frmUpdateState_onSubmit() {
    $('#frmUpdateState').on('submit', (e) => {
        e.preventDefault();

        let stateObj = {};

        stateObj["stateID"] = parseInt(window.process.argv.slice(-1))
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