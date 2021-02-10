const {ipcRenderer} = require('electron');
require('bootstrap');
const $ = require('jquery');

$(function(){
    getRegionInfo()
});

function getRegionInfo(){
    ipcRenderer.send('Region:getRegionInfo', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.on('Region:getRegionInfoOK', (e, res) => {
        $('#lblRegionName').text(res.regionName);
        $('#lblDescription').text(res.desc);
        $('#lblBiome').text(res.biome.biomeName)
        $('#lblOwner').text(res.state.stateName);
        $('#lblPopulation').text(res.population);
        $('#lblTotalRegionIncome').text(res.totalIncome);
        $('#lblRegionFoodProduced').text(res.totalFoodProduced);
        $('#lblRegionFoodConsumed').text(res.totalFoodConsumed);
        $('#lblRegionFoodAvailable').text(res.totalFoodAvailable);
        $('#lblPopulationGrowth').text(res.expectedPopulationGrowth);

        $('#lblDevelopmentLevel').text(res.development.developmentName);
        $('#lblPopulationCap').text(res.development.populationCap);
        $('#lblMilitaryTier').text(res.development.militaryTier);
        $('#lblGrowthModifier').text(res.development.growthModifier);
        $('#lblShrinkageModifier').text(res.development.shrinkageModifier);

        $('#lblCorruptionName').text(res.corruption.corruptionName);
        $('#lblCorruptionRate').text(res.corruption.corruptionRate * 100 + '%');

        if(res.productiveResources.length > 0){
            res.productiveResources.forEach(resource => {
                $('#lblResourcesProduced').append(resource + ', ')
                $('#lblResourcesProduced').text().slice(0, -2);
            });
        }
        else{
            $('#lblResourcesProduced').text("NONE");
        }
    });
}