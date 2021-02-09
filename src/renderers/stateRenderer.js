const { app, remote } = require('electron');
const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');
require('bootstrap');

console.log("Page Opened");

$(function(){
    //Load all state info on page open
    getStateInfo();
    //Delete state
    btnDeleteState_onClick();
    //Update State
    frmUpdateState_onSubmit();
})


function getStateInfo(){
    ipcRenderer.send("State:getStateInfo", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.on("State:getStateInfoOK", function(e, res){
        $('#lblStateName').text(res.StateName);
        $('#lblDescription').text(res.Desc);
        $('#lblStateTreasury').text(res.TreasuryAmt);
        $('#lblTotalIncome').text(res.TotalIncome);
        $('#lblFoodProduced').text(res.TotalFoodProduced);
        $('#lblFoodConsumed').text(res.TotalFoodConsumed);
        $('#lblFoodAvailable').text(res.TotalFoodAvailable);
        $('#lblAvgDevelopment').text(res.AvgDevLevel);

        $('#txtStateName').val(res.StateName);
        $('#nmbTreasury').val(res.TreasuryAmt);
        $('#txtDescription').val(res.Desc);
    });

    ipcRenderer.send("State:getRegionsForState", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.on("State:getRegionsForStateOK", (e, res) => {
        res.forEach(region => {
            $('#listOfRegions').append('<li class="individualRegion" id="Region'+region.RegionID+'"><a href=#>'+region.RegionName+'</a><span class="totalIncome">'+region.RegionTotalIncome+'</span><span class="totalFood">'+region.RegionTotalFood+'</span></li>')
        });
       
    });
}

function btnDeleteState_onClick() {
    $('#btnDeleteState').on('click', (e) => {
        e.preventDefault();

        ipcRenderer.send("State:deleteState", parseInt(window.process.argv.slice(-1)))
        ipcRenderer.once("State:deleteStateOK", (e, res) => {
            if(res){
                alert("Successfully deleted state");
                ipcRenderer.send("State:ClosePageOnDelete");
            }
            else{
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting state</div>')
            }
        });
    });
}

function frmUpdateState_onSubmit() {
    $('#frmUpdateState').on('submit', (e) => {
        e.preventDefault();

        let stateObj = {};

        stateObj["StateID"] =  parseInt(window.process.argv.slice(-1))
        stateObj["StateName"] = $('#txtStateName').val();
        stateObj["TreasuryAmt"] = ($('#nmbTreasury').val() == "") ? 0 : parseInt($('#nmbTreasury').val());
        stateObj["Desc"] = $('#txtDescription').val();

        console.log(stateObj);

        ipcRenderer.send("State:updateState", stateObj);
        ipcRenderer.once("State:updateStateOK", (e, res) => {
            if(res){
                // $('#stateMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated state</div>');
                // $('.regionList').empty();
                // getStateInfo();
                alert("Successfully updated state");
                ipcRenderer.send("State:ReloadPageOnUpdate");
            }
            else{
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating state</div>');
            }

            $('#mdlUpdateState').modal('toggle');
        });
    });
}