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
        let count = 1;
        $('#lblStateName').text(res.stateName);
        $('#lblDescription').text(res.desc);
        $('#lblStateTreasury').text(res.treasuryAmt);
        $('#lblTotalIncome').text(res.TotalIncome);
        $('#lblExpenses').text(res.expenses);
        $('#lblFoodProduced').text(res.TotalFoodProduced);
        $('#lblFoodConsumed').text(res.TotalFoodConsumed);
        $('#lblFoodAvailable').text(res.TotalFoodAvailable);
        $('#lblPopulation').text(res.TotalPopulation);
        $('#lblAvgDevelopment').text(res.AvgDevLevel);

        $('#txtStateName').val(res.stateName);
        $('#nmbTreasury').val(res.treasuryAmt);
        $('#txtDescription').val(res.desc);

        res.ProductiveResources.forEach(resource => {
            let tierStr = () => {
                switch(resource.ResourceTierID){
                    case 1: return 'Tier I';
                    case 2: return 'Tier II';
                    case 3: return 'Tier III';
                    case 4: return 'Tier IV';
                    case 5: return 'Tier V';
                    case 6: return 'Tier VI';
                }
            }
            $('#tblResources').append('<tr><th scope="row">'+count+'</th><td>'+resource.ResourceName+'</td><td>'+tierStr()+'</td></tr>')
            count++;
        })
    });

    ipcRenderer.send("State:getRegionsForState", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.on("State:getRegionsForStateOK", (e, res) => {
        res.forEach(region => {
            $('#listOfRegions').append('<li class="individualRegion" id="Region'+region.RegionID+'" onclick=openRegionPage(this.getAttribute("id"))><a href=#>'+region.RegionName+'</a><span class="totalIncome">'+region.RegionTotalIncome+'</span><span class="totalFood">'+region.RegionTotalFood+'</span></li>')
        });
       
    });

    ipcRenderer.send('Trade:getTradeAgreementsByStateId', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Trade:getTradeAgreementsByStateIdOK', (e, res) => {
          
        res.forEach(agreement => {
            let resourceProducedFirstState = () => {
                let resourceStr1 = '';
                agreement.traders[0].resources.forEach(resource => {
                    resourceStr1 += resource.ResourceName + ', ';
                })
                resourceStr1 = resourceStr1.slice(0, -2);
                return resourceStr1;
            }

            let resourceProducedSecondState = () => {
                let resourceStr2 = '';
                agreement.traders[1].resources.forEach(resource => {
                    resourceStr2 += resource.ResourceName + ', ';
                })
                resourceStr2 = resourceStr2.slice(0, -2);
                return resourceStr2;
            }


            $('#tradeAgreements')
            .append(
                '<tr>'+
                    '<td>'+agreement.traders[0].state.stateName+'</td>'+
                    '<td>'+resourceProducedFirstState()+'</td>'+
                    '<td>'+agreement.traders[0].tradePower * 100 + '%</td>'+
                    '<td>'+parseFloat(agreement.traders[0].tradeValue).toFixed(2)+'</td>'+
                    '<td>'+agreement.traders[1].state.stateName+'</td>'+
                    '<td>'+resourceProducedSecondState()+'</td>'+
                    '<td>'+agreement.traders[1].tradePower * 100 + '%</td>'+
                    '<td>'+parseFloat(agreement.traders[1].tradeValue).toFixed(2)+'</td>'+
                +'</tr>'
            );
        })
    })

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

//called on region click

function openRegionPage(ID){
    let regionID = ID.replace('Region', '');
    ipcRenderer.send('Region:openRegionPage', regionID);
}