const { app, remote } = require('electron');
const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');
const fs = require('fs');
require('bootstrap');

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
        $('#lblStateName').text(res.stateName);
        $('#lblDescription').text(res.desc);
        $('#lblStateTreasury').text(res.treasuryAmt);
        $('#lblTotalIncome').text(res.TotalIncome);
        $('#lblFoodProduced').text(res.TotalFoodProduced);
        $('#lblFoodConsumed').text(res.TotalFoodConsumed);
        $('#lblFoodAvailable').text(res.TotalFoodAvailable);
        $('#lblAvgDevelopment').text(res.AvgDevLevel);

        $('#txtStateName').val(res.stateName);
        $('#nmbTreasury').val(res.treasuryAmt);
        $('#txtDescription').val(res.desc);
    });

    ipcRenderer.send("State:getRegionsForState", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.on("State:getRegionsForStateOK", (e, res) => {
        res.forEach(region => {
            $('#listOfRegions').append('<li class="individualRegion" id="Region'+region.RegionID+'"><a href=#>'+region.RegionName+'</a><span class="totalIncome">'+region.RegionTotalIncome+'</span><span class="totalFood">'+region.RegionTotalFood+'</span></li>')
        });
       
    });

    fs.readdir('src/images', (err, files) => {
        if(err){
            console.log(err)
        }
        else{

            for(let file of files) {
                let id = file.match(/(\d+)/);

                if( parseInt(window.process.argv.slice(-1)) == id[0]){
                    console.log(file);
                    $('.jumbotron').css('background-image', 'url(../images/'+file+')');
                    $('.jumbotron').css('background-size', 'contain');
                    break;
                }
            }
            
        }
    })
}

function btnDeleteState_onClick() {
    $('#btnDeleteState').on('click', (e) => {
        e.preventDefault();

        ipcRenderer.send("State:deleteState", parseInt(window.process.argv.slice(-1)))
        ipcRenderer.once("State:deleteStateOK", (e, res) => {
            if(res){
                alert("Successfully deleted state");
                ipcRenderer.send("ClosePageOnDelete");
            }
            else{
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

        stateObj["stateID"] =  parseInt(window.process.argv.slice(-1))
        stateObj["stateName"] = $('#txtStateName').val();
        stateObj["treasuryAmt"] = ($('#nmbTreasury').val() == "") ? 0 : parseInt($('#nmbTreasury').val());
        stateObj["desc"] = $('#txtDescription').val();

        console.log(stateObj);

        ipcRenderer.send("State:updateState", stateObj);
        ipcRenderer.once("State:updateStateOK", (e, res) => {
            if(res){
                // $('#stateMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated state</div>');
                // $('.regionList').empty();
                // getStateInfo();
                alert("Successfully updated state");
                ipcRenderer.send("ReloadPageOnUpdate");
            }
            else{
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating state</div>');
            }

            $('#mdlUpdateState').modal('toggle');
        });
    });
}