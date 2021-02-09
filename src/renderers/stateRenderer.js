const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');
require('bootstrap');

console.log("Page Opened");

$(function(){
    getStateInfo();
})


function getStateInfo(){
    ipcRenderer.send("State:getStateInfo");
    ipcRenderer.on("State:getStateInfoOK", function(e, res){
        $('#lblStateName').text(res.StateName);
        $('#lblDescription').text(res.Desc);
        $('#lblStateTreasury').text(res.TreasuryAmt);
        $('#lblTotalIncome').text(res.TotalIncome);
        $('#lblFoodProduced').text(res.TotalFoodProduced);
        $('#lblFoodConsumed').text(res.TotalFoodConsumed);
        $('#lblFoodAvailable').text(res.TotalFoodAvailable);
        $('#lblAvgDevelopment').text(res.AvgDevLevel);
    });

    ipcRenderer.send("State:getRegionsForState", parseInt(window.process.argv.slice(-1)));
    ipcRenderer.on("State:getRegionsForStateOK", (e, res) => {
        res.forEach(region => {
            $('#listOfRegionsByState').append('<li class="individualRegion" id="Region'+region.RegionID+'"><a href=#>'+region.RegionName+'</a><span class="totalIncome">'+region.RegionTotalIncome+'</span><span class="totalFood">'+region.RegionTotalFood+'</span></li>')
        });
       
    });
}