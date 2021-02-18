const {ipcRenderer} = require('electron');
require('bootstrap');
const $ = require('jquery');

$(function(){
    //Get all region info
    getRegionInfo();
    //get all facility related info
    getFacilitiesInfo();
    //Get all component related info
    getComponentsInfo();
    //event handler for component display change
    rbsComponentsDisplay_onChange();
    //update region
    frmUpdateRegion_onSubmit();
    //delete region
    btnDeleteRegion_onClick();
    //handles events for addUpdateComponent
    addUpdateComponent_handler();
    //handle delete component events
    deleteComponent_handler();
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
        //console.log(res);
        
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
    
}

function getFacilitiesInfo() {
    let facilityIds = [];
    ipcRenderer.send('Facility:getFacilitiesByRegion',  parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Facility:getFacilitiesByRegionOK', (e, res) => {
        $('#selFacility').append('<option selected value="">NONE</option>');
        res.forEach(facility => {
            let foodOutput = (facility.foodOutput == 0) ? '' : '<span class="valueFood">Food Output: ' + facility.foodOutput + '</span><br/>';
            let moneyOutput = (facility.moneyOutput == 0) ? '' : '<span class="valueMoney">Money Output: ' + facility.moneyOutput + '</span><br/>';
            let resource = (facility.resource == null) ? '' : '<span class="valueResource">Resource: ' + facility.resource.ResourceName + '</span><br/>';

            let noOutput = (foodOutput == '' && moneyOutput == '' && resource == '') ? 'No Output for this facility<br/>' : ''
            $('#facilityList').append(
                
                '<div class="card">'+
                    '<div class="card-header" id="FacilityHeading'+facility.facilityId+'">'+
                        ' <h2 class="mb-0">'+
                            '<button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#FacilityCollapse'+facility.facilityId+'"" aria-expanded="false" aria-controls="FacilityCollapse'+facility.facilityId+'">'+
                            facility.facilityName
                            +'</button>'+
                        '</h2>'+
                    '</div>'+
                    '<div id="FacilityCollapse'+facility.facilityId+'" class="collapse" aria-labelledby="FacilityHeading'+facility.facilityId+'" data-parent="#facilityList">'+
                        '<div class="card-body">'+
                        '<div class="row">'+
                        '<div class="column" id="Facility'+facility.facilityId+'">'+
                            foodOutput + moneyOutput + resource + noOutput +
                        '</div>'+
                        '<div class="column"><ul  id="FacilityComponents'+facility.facilityId+'"></ul></div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '</div>'
            )
            facilityIds.push(facility.facilityId);
            $('#selFacility').append($('<option>', {
                value: facility.facilityId,
                text: facility.facilityName
            }));
        });
    });

    

    ipcRenderer.send('Component:getComponentByFacilityId', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Component:getComponentByFacilityIdOK', (e, res) => {
        console.log(facilityIds);
        res.forEach(components => {
            if(components != null){
                components.forEach(component => {
                    let facilityId = facilityIds.find( id => id == component.facilityId);
    
                    if(!component.isChild){
                        $('#FacilityComponents'+facilityId).append('<li id="ComponentFacility'+component.componentId+'"><b>'+component.componentName+'</b></li>')
                    }
                    else{
                        $('#ComponentFacility'+component.parentId).append('<ul><li id="ComponentFacility'+component.componentId+'"><b>'+component.componentName+'</b></li></ul>')
                    }
                })
            }
        })
        
    })

}

function getComponentsInfo() {
    ipcRenderer.send('Component:getComponentList', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Component:getComponentListOK', (e, res) => {
       setComponentList(res);
       $('#selParent').append('<option selected value="">NONE</option>');

       res.forEach(component => {
           $('#selParent').append($('<option>', {
            value: component.componentId,
            text: component.componentName
        }));
       });
    });

    ipcRenderer.send('Component:getAllComponentTypes');
    ipcRenderer.once('Component:getAllComponentTypesOK', (e, res)=>{
        //console.log(res);
        res.forEach(componentType => {
            $('#selComponentType').append($('<option>', {
                value: componentType.componentTypeId,
                text: componentType.componentTypeName
            }));
        })
    });

    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function(e, res){
        $('#selResource').append('<option selected value="">NONE</option>');
        res.forEach(resourceTier => {
            resourceTier.Resources.forEach(resource => {
                $('#selResource').append($('<option>', {
                    value: resource.ResourceID,
                    text: resource.ResourceName
                }));
            });
        });
    });
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

        //console.log(regionObj);

        ipcRenderer.send('Region:updateRegion', regionObj);
        ipcRenderer.once('Region:updateRegionOK', (e, res) => {
            if(res){
                alert("Successfully updated region");
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

function addUpdateComponent_handler(){
    $('#chkChild').on('click', () => {
        $('#componentParentField').toggle(this.checked);
    })

    $('#btnAddComponent').on('click', () => {
        $('#frmAddUpdateComponent').trigger('reset');
        $('#hdnComponentId').val(undefined);
        $('#txtValue').show();
        $('#selResource').hide();
        $('#componentParentField').hide();
        $('#selFacility').attr('disabled', false);
        $('#chkChild').attr('disabled', false);
        //console.log($('#hdnComponentId').val());
    })

    $('#selComponentType').on('change', () => {
        $('#txtValue').val('');
        $('#selResource').val(null);
        //console.log($('#selComponentType').val());
        if($('#selComponentType').val() == 3){
            $('#txtValue').hide();
            $('#selResource').show();
            $('#selResource').attr('required', true);
            $('#txtValue').attr('required', false);
        }
        else{
            $('#txtValue').show();
            $('#selResource').hide();
            $('#selResource').attr('required', false);
            $('#txtValue').attr('required', true);
        }
    })

    $('#selFacility').on('change', () => {
        if($('#selFacility').val() != ''){
            $('#chkChild').prop('checked', false);
            $('#componentParentField').hide();
            $('#chkChild').attr('disabled', true);
        }
        else{
            $('#chkChild').removeAttr('disabled');
        }
    })

    $('#frmAddUpdateComponent').on('submit', e => {
        e.preventDefault();

        let componentObj = {};

        componentObj['componentName'] = $('#txtComponentName').val();
        componentObj['componentType'] = {'componentTypeId': $('#selComponentType').val()};
        componentObj['regionId'] = parseInt(window.process.argv.slice(-1));
        componentObj['facilityId'] = ($('#selFacility').val() == '') ? null : $('#selFacility').val();

        if($('#chkChild').is(':checked')){
            componentObj['isChild'] = true;
            componentObj['parentId'] = $('#selParent').val();
        }
        else{
            componentObj['isChild'] = false;
        }

        if($('#selComponentType').val() == 3){
            componentObj['value'] = {'resourceId':  $('#selResource').val()};
        }
        else{
            let componentTypeId = $('#selComponentType').val();

            componentObj['value'] = (componentTypeId == 1 || componentTypeId == 4 || componentTypeId == 5) ? parseInt($('#txtValue').val()) : $('#txtValue').val()


           
        }

        componentObj['activationTime'] = $('#nmbActivation').val();

        if( $('#hdnComponentId').val() == ''){
            ipcRenderer.send('Component:addComponent', componentObj);
            ipcRenderer.once('Component:addComponentOK', (e, res) => {
                if(res){
                    alert("Successfully added component");
                    ipcRenderer.send("ReloadPageOnUpdate");
                }
                else{
                    $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding component</div>');
                }
            });
        }
        else{
            componentObj['componentId'] = $('#hdnComponentId').val();

            ipcRenderer.send('Component:updateComponent', componentObj);
            ipcRenderer.once('Component:updateComponentOK', (e, res) => {
                if(res){
                    alert("Successfully updated component");
                    ipcRenderer.send("ReloadPageOnUpdate");
                }
                else{
                    $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating component</div>');
                }
                $('#mdlAddUpdateComponent').modal('toggle');
            });
        }
    })
}

function deleteComponent_handler() {
    $('#btnDeleteComponent').on('click', (e) => {
        e.preventDefault();
        let componentId = $('#btnDeleteComponent').data('componentId').replace('Component', '');
        
        ipcRenderer.send('Component:deleteComponent', componentId);
        ipcRenderer.on('Component:deleteComponentOK', (e, res) => {
            if(res){
                alert("Successfully deleted component");
                ipcRenderer.send("ReloadPageOnUpdate");
            }
            else{
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting component</div>')
            }

            $('#mdlDeleteComponent').modal('toggle');
        })
    })
}

function setComponentList(res){
    if(Array.isArray(res) && res.length){
        let childComponents = []
        res.forEach(component => {
            if(!component.isChild){
                let valueId = (component.componentType.componentTypeId == 3) ? component.value.ResourceID : component.value;
                let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : component.value;
                let activation = (component.activationTime > 0) ? ' Activation Time: ' + component.activationTime : '';
                $('#componentsList').append('<li id="Component'+
                component.componentId
                +'" data-facility-id="'+
                component.facilityId
                +'" data-component-type-id="'+
                component.componentType.componentTypeId
                +'" data-is-child="'+
                component.isChild
                +'" data-component-name="'+
                component.componentName
                +'" data-value="'+
                valueId
                +'" data-activation="'+
                component.activationTime
                +'"><b>'+
                component.componentName
                +'</b> <input type="image" src="../images/icons/edit.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlAddUpdateComponent" onclick=populateUpdateComponentForm("Component'+component.componentId+'")>&nbsp;<input type="image" src="../images/icons/delete.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlDeleteComponent" onclick=setComponentIdForDelete("Component'+component.componentId+'")> <span class="parentComponent"><span class="value'+
                component.componentId
                +'">'+
                valueText
                +' ('+
                component.componentType.componentTypeName
                +')</span>'+
                activation
                +'</span></li>');

                switch(component.componentType.componentTypeId){
                    case 1:
                        $('.value'+component.componentId).attr('class', ' valuePopulation');
                        break;
                    case 2:
                        $('.value'+component.componentId).attr('class', ' valueBuilding');
                        break;
                    case 3:
                        $('.value'+component.componentId).attr('class', ' valueResource');
                        break;
                    case 4:
                        $('.value'+component.componentId).attr('class', ' valueFood');
                        break;
                    case 5:
                        $('.value'+component.componentId).attr('class', ' valueMoney');
                        break;
                    case 6:
                        $('.value'+component.componentId).attr('class', ' valueSpecial');
                        break;
                }
            }
            else{
                childComponents.push(component);
            }
        })
        
            childComponents.forEach(component => {
                if($('#Component' + component.parentId).length){
                    let valueId = (component.componentType.componentTypeId == 3) ? component.value.ResourceID : component.value;
                    let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : component.value;
                    let activation = (component.activationTime > 0) ? ' Activation Time: ' + component.activationTime : '';

                    $('#Component' + component.parentId).append('<ul><li id="Component'+
                    component.componentId
                    +'" data-facility-id="'+
                    component.facilityId
                    +'" data-component-type-id="'+
                    component.componentType.componentTypeId
                    +'" data-is-child="'+
                    component.isChild
                    +'" data-component-name="'+
                    component.componentName
                    +'" data-value="'+
                    valueId
                    +'" data-activation="'+
                    component.activationTime
                    +'" data-parent="'+
                    component.parentId
                    +'"><b>'+
                    component.componentName
                    +'</b> <input type="image" src="../images/icons/edit.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlAddUpdateComponent" onclick=populateUpdateComponentForm("Component'+component.componentId+'")>&nbsp;<input type="image" src="../images/icons/delete.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlDeleteComponent" onclick=setComponentIdForDelete("Component'+component.componentId+'")> <span class="childComponent"><span id="value'+
                    component.componentId
                    +'">'+
                    valueText
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
                }
            })

        //console.log(childComponents);
    }
    else{
        $('#componentsList').append('<li>NO COMPONENTS AVAILABLE</li>')
    }
}

function populateUpdateComponentForm(componentId){
    let splicedComponentId = componentId.replace('Component', '');
    let facilityId = $('#'+componentId).data("facilityId");
    let componentTypeId = $('#'+componentId).data("componentTypeId");
    let isChild =  $('#'+componentId).data("isChild");
    let componentName = $('#'+componentId).data("componentName");
    let value = $('#'+componentId).data("value");
    let activationTime = $('#'+componentId).data("activation");
    let parent = $('#'+componentId).data("parent");

    $('#hdnComponentId').val(splicedComponentId);
    $('#txtComponentName').val(componentName);
    $('#selComponentType').val(componentTypeId);
    $('#selFacility').val(facilityId);
    $('#chkChild').prop('checked', isChild);

    if(isChild){
        $('#componentParentField').show();
        $('#selParent').val(parent);
    }
    else{
        $('#componentParentField').hide();
    }

    if(componentTypeId == 3){
        $('#txtValue').hide();
        $('#selResource').show();

        $('#selResource').val(value);
    }
    else{
        $('#txtValue').show();
        $('#selResource').hide();
        
        $('#txtValue').val(value);
    }

    if(facilityId != null){
        $('#chkChild').attr('disabled', true);
        $('#componentParentField').hide();
        if(isChild){
            $('#selFacility').attr('disabled', true);
        }
        else{
            $('#selFacility').attr('disabled', false);
        }
    }
    else{
        $('#chkChild').attr('disabled', false);
        $('#selFacility').attr('disabled', false);
    }
    $('#nmbActivation').val(activationTime);
    //console.log($('#hdnComponentId').val());
}

function setComponentIdForDelete(componentId){
        $('#btnDeleteComponent').attr('data-component-id', componentId);
}