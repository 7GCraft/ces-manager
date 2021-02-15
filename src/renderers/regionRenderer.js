const {ipcRenderer} = require('electron');
require('bootstrap');
const $ = require('jquery');

$(function(){
    //Get all region info including components and facilities
    getRegionInfo()
    //event handler for component display change
    rbsComponentsDisplay_onChange();
    //update region
    frmUpdateRegion_onSubmit();
    //delete region
    btnDeleteRegion_onClick();
});

function getRegionInfo(){
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

    ipcRenderer.send('Region:getRegionInfo', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Region:getRegionInfoOK', (e, res) => {
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
                $('#lblResourcesProduced').append(resource.ResourceName + ', ')
            });
            $('#lblResourcesProduced').val().slice(0, -2);
        }
        else{
            $('#lblResourcesProduced').text("NONE");
        }

        $('#txtRegionName').val(res.regionName);
        $('#selState').val(res.state.stateID)
        $('#selCorruption').val(res.corruption.corruptionId)
        $('#selBiome').val(res.biome.biomeId)
        $('#selDevelopment').val(res.development.developmentId)
        $('#nmbPopulation').val(res.population);
        $('#txtDescRegion').val(res.desc);
    });

    ipcRenderer.send('Component:getComponentList', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Component:getComponentListOK', (e, res) => {
       setComponentList(res);
    })
}

function rbsComponentsDisplay_onChange() {
    $('input[type=radio][name=componentDisplay]').on('change', e => {
        e.preventDefault

        $('#componentsList').empty();

        switch($('input[name=componentDisplay]:checked').val()){
            case 'all':
                ipcRenderer.send('Component:getComponentList', parseInt(window.process.argv.slice(-1)));
                ipcRenderer.once('Component:getComponentListOK', (e, res) => {
                    setComponentList(res);
                })
                break;
            case 'used':
                ipcRenderer.send('Component:getUsedComponentList', parseInt(window.process.argv.slice(-1)));
                ipcRenderer.once('Component:getUsedComponentListOK', (e, res) => {
                    setComponentList(res);
                })
                break;
            case 'unused':
                ipcRenderer.send('Component:getUnusedComponentList', parseInt(window.process.argv.slice(-1)));
                ipcRenderer.once('Component:getUnusedComponentListOK', (e, res) => {
                    setComponentList(res);
                })
                break;
        }
    })
}

function frmUpdateRegion_onSubmit() {
    $('#frmUpdateRegion').on('submit', function(e){
        e.preventDefault();

        let regionObj = {};

        regionObj['regionId'] = parseInt(window.process.argv.slice(-1));
        regionObj['regionName'] = $('#txtRegionName').val();
        regionObj['state'] = {'stateId' : parseInt($('#selState').val())};
        regionObj['corruption'] = {'corruptionId': parseInt($('#selCorruption').val())};
        regionObj['biome'] = {'biomeId' : parseInt($('#selBiome').val())};
        regionObj['development'] = {'developmentId' :parseInt( $('#selDevelopment').val())};
        regionObj['population'] = parseInt($('#nmbPopulation').val());
        regionObj['desc'] = $('#txtDescRegion').val();

        console.log(regionObj);

        ipcRenderer.send('Region:updateRegion', regionObj);
        ipcRenderer.once('Region:updateRegionOK', (e, res) => {
        if(res){
            alert("Successfully updated state");
            ipcRenderer.send("ReloadPageOnUpdate");
        }
        else{
            $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating region</div>');
        }

        $('#mdlUpdateRegion').modal('toggle');
        });   
    });
}

function btnDeleteRegion_onClick() {
    $('#btnDeleteRegion').on('click', (e) => {
        e.preventDefault();

        ipcRenderer.send("Region:deleteRegion", parseInt(window.process.argv.slice(-1)))
        ipcRenderer.once("Region:deleteRegionOK", (e, res) => {
            if(res){
                alert("Successfully deleted region");
                ipcRenderer.send("ClosePageOnDelete");
            }
            else{
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting region</div>')
            }

        $('#mdlDeleteRegion').modal('toggle');
        });
    })
}

function setComponentList(res){
    if(Array.isArray(res) && res.length){
        let childComponents = []
        res.forEach(component => {
            if(!component.isChild){
                let activation = (component.activationTime > 0) ? ' Activation Time: ' + component.activationTime : '';
                $('#componentsList').append('<li id="Component'+
                component.componentId
                +'"><b>'+
                component.componentName
                +'</b> <span class="parentComponent"><span id="value'+
                component.componentId
                +'">'+
                component.value
                +' ('+
                component.componentType.componentTypeName
                +')</span>'+
                activation
                +'</span></li>');

                switch(component.componentType.componentTypeId){
                    case 1:
                        $('#value'+component.componentId).attr('class', ' valuePopulation');
                        break;
                    case 2:
                        $('#value'+component.componentId).attr('class', 'valueBuilding');
                        break;
                    case 3:
                        $('#value'+component.componentId).attr('class', 'valueResource');
                        break;
                    case 4:
                        $('#value'+component.componentId).attr('class', 'valueFood');
                        break;
                    case 5:
                        $('#value'+component.componentId).attr('class', 'valueMoney');
                        break;
                    case 6:
                        $('#value'+component.componentId).attr('class', ' valueSpecial');
                        break;
                }
            }
            else{
                childComponents.push(component);
            }
        })
        
        while(childComponents.length > 0){
            childComponents.forEach(component => {
                if($('#Component' + component.parentId).length){
                    let activation = (component.activationTime > 0) ? ' Activation Time: ' + component.activationTime : '';

                    $('#Component' + component.parentId).append('<ul><li id="Component'+
                    component.componentId
                    +'"><b>'+
                    component.componentName
                    +'</b> <span class="childComponent"><span id="value'+
                    component.componentId
                    +'">'+
                    component.value
                    +' ('+
                    component.componentType.componentTypeName
                    +')</span> '+
                    activation
                    +'</span></li></ul>');
                    switch(component.componentType.componentTypeId){
                        case 1:
                            $('#value'+component.componentId).attr('class', 'valuePopulation');
                            break;
                        case 2:
                            $('#value'+component.componentId).attr('class', 'valueBuilding');
                            break;
                        case 3:
                            $('#value'+component.componentId).attr('class', 'valueResource');
                            break;
                        case 4:
                            $('#value'+component.componentId).attr('class', 'valueFood');
                            break;
                        case 5:
                            $('#value'+component.componentId).attr('class', 'valueMoney');
                            break;
                        case 6:
                            $('#value'+component.componentId).attr('class', 'valueSpecial');
                            break;
                    }
                    childComponents.pop(component);
                }
            })
        }

        $('.valuePopulation').css('color', '#e68a2e');
        $('.valueBuilding').css('color', 'brown');
        $('.valueResource').css('color', 'purple');
        $('.valueFood').css('color', 'green');
        $('.valueMoney').css('color', '#d1b422');
        $('.valueSpecial').css('color', '#23b8cc');

        //console.log(childComponents);
    }
    else{
        $('#componentsList').append('<li>NO COMPONENTS AVAILABLE</li>')
    }
}