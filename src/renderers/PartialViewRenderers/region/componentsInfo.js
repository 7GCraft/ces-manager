$(function () {
    //Get all component related info
    getComponentsInfo();
    //Get all facilities for facility ddl
    getFacilitiesList();
    //event handler for component display change
    rbsComponentsDisplay_onChange();
    //handles events for addUpdateComponent
    addUpdateComponent_handler();
    //handle delete component events
    deleteComponent_handler();
    //handle events from main page
    pageMain_eventHandler();
    //handle events from child component modal
    mdlChildComponents_eventHandler();
});

function getComponentsInfo() {
    ipcRenderer.send('Component:getComponentList', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Component:getComponentListOK', (e, res) => {
        setComponentList(res);

        $('#selParent').empty();
        $('#selParent').append('<option selected value="">NONE</option>');
        if (res != null) {
            res.forEach(component => {
                $('#selParent').append($('<option>', {
                    value: component.componentId,
                    text: component.componentName
                }));
            });
        }
    });

    ipcRenderer.send('Component:getAllComponentTypes');
    ipcRenderer.once('Component:getAllComponentTypesOK', (e, res) => {
        $('#selComponentType').empty();
        if (res != null) {
            res.forEach(componentType => {
                $('#selComponentType').append($('<option>', {
                    value: componentType.componentTypeId,
                    text: componentType.componentTypeName
                }));
            })
        }
    });

    getResourceTiers();
}

function getResourceTiers() {
    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function (e, res) {
        $('#selResource').empty();
        $('#selResource').append('<option selected value="">NONE</option>');
        if (res != null) {
            res.forEach(resourceTier => {
                resourceTier.Resources.forEach(resource => {
                    $('#selResource').append($('<option>', {
                        value: resource.ResourceID,
                        text: resource.ResourceName
                    }));
                });
            });
        }
    });
}

function getFacilitiesList() {
    let dataAvailable = false;
    ipcRenderer.send('Facility:getFacilitiesByRegion', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Facility:getFacilitiesByRegionOK', (e, res) => {
        dataAvailable = true;
        $('#selFacility').append('<option selected value="">NONE</option>');
        if (res != null) {
            res.forEach(facility => {
                $('#selFacility').append($('<option>', {
                    value: facility.facilityId,
                    text: facility.facilityName
                }));
            })
        }
    });
}

function rbsComponentsDisplay_onChange() {
    $('input[type=radio][name=componentDisplay]').on('change', e => {
        e.preventDefault

        $('#componentsList').empty();

        switch ($('input[name=componentDisplay]:checked').val()) {
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

function addUpdateComponent_handler() {
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
    })

    $('#selComponentType').on('change', () => {
        $('#txtValue').val('');
        $('#selResource').val(null);
        $('#txtValue').prop('disabled', false);
        if ($('#selComponentType').val() == 3) {
            $('#txtValue').hide();
            $('#selResource').show();
            $('#selResource').attr('required', true);
            $('#txtValue').attr('required', false);
        }
        else {
            $('#txtValue').show();
            $('#selResource').hide();
            $('#selResource').attr('required', false);
            $('#txtValue').attr('required', true);
        }

        if ($('#selComponentType').val() == 2) {
            $('#txtValue').prop('disabled', 'disabled');
            $('#txtValue').attr('required', false);
        }
    })

    $('#selFacility').on('change', () => {
        if ($('#selFacility').val() != '') {
            $('#chkChild').prop('checked', false);
            $('#componentParentField').hide();
            $('#chkChild').attr('disabled', true);
        }
        else {
            $('#chkChild').removeAttr('disabled');
        }
    })

    // $('#nmbActivation').on('change', () => {
    //     const activationTime = parseInt($('#nmbActivation').val());
    //     if (!isNaN(activationTime)) {
    //         if (activationTime > 0) {
    //             $('#selFacility').prop('disabled', 'disabled');
    //             $('#selFacility').val('');
    //         }
    //         else {
    //             $('#selFacility').prop('disabled', false);
    //         }
    //     }
    // })

    $('#frmAddUpdateComponent').on('submit', e => {
        e.preventDefault();

        let componentObj = {};
        let componentTypeId = parseInt($('#selComponentType').val());

        componentObj['componentName'] = $('#txtComponentName').val();
        componentObj['componentType'] = { 'componentTypeId': componentTypeId };
        componentObj['regionId'] = parseInt(window.process.argv.slice(-1));
        componentObj['facilityId'] = ($('#selFacility').val() == '') ? null : $('#selFacility').val();

        if ($('#chkChild').is(':checked')) {
            componentObj['isChild'] = true;
            componentObj['parentId'] = $('#selParent').val();
        }
        else {
            componentObj['isChild'] = false;
        }

        if (componentTypeId == 3) {
            componentObj['value'] = { 'resourceId': $('#selResource').val() };
        }
        else if (componentTypeId == 2) {
            componentObj['value'] = null;
        }
        else {
            componentObj['value'] = (componentTypeId == 1 || componentTypeId == 4 || componentTypeId == 5) ? parseInt($('#txtValue').val() || 0) : $('#txtValue').val();
        }

        componentObj['activationTime'] = $('#nmbActivation').val();

        if (!validate_addUpdateComponent(componentObj, componentTypeId))
            return;

        if ($('#hdnComponentId').val() == '') {
            ipcRenderer.send('Component:addComponent', componentObj);
            ipcRenderer.once('Component:addComponentOK', (e, res) => {
                if (res) {
                    alert("Successfully added component");
                    ipcRenderer.send("ReloadPageOnUpdate");
                }
                else {
                    $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding component</div>');
                }
            });
        }
        else {
            componentObj['componentId'] = $('#hdnComponentId').val();

            ipcRenderer.send('Component:updateComponent', componentObj);
            ipcRenderer.once('Component:updateComponentOK', (e, res) => {
                if (res) {
                    alert("Successfully updated component");
                    ipcRenderer.send("ReloadPageOnUpdate");
                }
                else {
                    $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating component</div>');
                }
                $('#mdlAddUpdateComponent').modal('toggle');
            });
        }
    })
}

/**
 * Validate Add/Update Component Form
 * @param {object} componentObj Submitted component
 * @param {number} componentType Type of submitted component
 * @returns {boolean} Whether submitted component is valid or not
 */
function validate_addUpdateComponent(componentObj, componentType) {
    let isValid = true;
    if (componentType == 1
        && componentObj['value'] > parseInt($('#hdnUnusedPopulation').val())) {
        isValid = false;
        $('#txtValue').addClass('is-invalid');
        $('#lblValueErrMessage').text('Value must not be bigger than unused population');
    }
    else {
        $('#txtValue').removeClass('is-invalid');
    }

    return isValid;
}

function deleteComponent_handler() {
    $('#btnDeleteComponent').on('click', (e) => {
        e.preventDefault();
        let componentId = $('#btnDeleteComponent').data('componentId').replace('Component', '');

        ipcRenderer.send('Component:deleteComponent', componentId);
        ipcRenderer.once('Component:deleteComponentOK', (e, res) => {
            if (res) {
                alert("Successfully deleted component");
                ipcRenderer.send("ReloadPageOnUpdate");
            }
            else {
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting component</div>')
            }

            $('#mdlDeleteComponent').modal('toggle');
        })
    })
}

function setComponentList(res) {
    $('#componentsList').empty();
    if (Array.isArray(res) && res.length) {
        let childComponents = []
        res.forEach((component, i) => {
            if (!component.isChild) {
                let valueId = (component.componentType.componentTypeId == 3) ? component.value.ResourceID : component.value;
                let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : (component.componentType.componentTypeId == 2) ? component.componentName : component.value;
                let activation = getActivationLabel(component.activationTime);
                $('#componentsList').append('<tr id="Component' +
                    component.componentId
                    + '" data-facility-id="' +
                    component.facilityId
                    + '" data-component-type-id="' +
                    component.componentType.componentTypeId
                    + '" data-is-child="' +
                    component.isChild
                    + '" data-component-name="' +
                    component.componentName
                    + '" data-value="' +
                    valueId
                    + '" data-activation="' +
                    component.activationTime
                    + '">'+
                    '<td>'+parseInt(i + 1)+'</td>'+
                    '<td><b>' +
                    component.componentName
                    + '</b></td>'+
                    '<td><span class="value' +
                    component.componentId
                    + '">' +
                    valueText
                    + 
                    '</span></td>'+
                    '<td><span class="value' +
                    component.componentId
                    + '">' +component.componentType.componentTypeName+
                    '</span></td>'+
                    '<td>'+activation+'</td>'+
                    '<td><button class="btn btn-outline-info" id="btnChildComponents'+component.componentId+'" onmouseover="readyChildComponents('+component.componentId+')" onclick="showChildComponents('+component.componentId+')" title="">Show</button></td>'+
                    ' <td><input type="image" src="../images/icons/edit.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlAddUpdateComponent" onclick=populateUpdateComponentForm("Component' + component.componentId + '")>&nbsp;<input type="image" src="../images/icons/delete.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlDeleteComponent" onclick=setComponentIdForDelete("Component' + component.componentId + '")> </td>' +
                    '</tr>');

                switch (component.componentType.componentTypeId) {
                    case 1:
                        $('.value' + component.componentId).attr('class', ' valuePopulation');
                        break;
                    case 2:
                        $('.value' + component.componentId).attr('class', ' valueBuilding');
                        break;
                    case 3:
                        $('.value' + component.componentId).attr('class', ' valueResource');
                        break;
                    case 4:
                        $('.value' + component.componentId).attr('class', ' valueFood');
                        break;
                    case 5:
                        $('.value' + component.componentId).attr('class', ' valueMoney');
                        break;
                    case 6:
                        $('.value' + component.componentId).attr('class', ' valueSpecial');
                        break;
                }
            }
            else {
                childComponents.push(component);
            }
        })

        localStorage.setItem('childComponents', JSON.stringify(childComponents))
       
    }
    else {
        $('#componentsList').append('<li>NO COMPONENTS AVAILABLE</li>')
    }
}

function readyChildComponents(parentId) {
    let childComponents = JSON.parse(localStorage.getItem('childComponents'));
    let hasChild = false;
    
    for(const component in childComponents){
        if(childComponents[component].parentId == parentId){
            hasChild = true;
            break;
        }
    }

    if(!hasChild){
        $('#btnChildComponents'+parentId).attr('title', 'No children exists')
        $('#btnChildComponents'+parentId).tooltip();
        
        console.log(hasChild);
    }
    else{
        $('#btnChildComponents'+parentId).attr('data-toggle', 'modal');
        $('#btnChildComponents'+parentId).attr('data-target', '#mdlChildComponents');
    }
}

function showChildComponents(parentId) {
    let childComponents = JSON.parse(localStorage.getItem('childComponents'));
    childComponents.forEach(component => {
        if(component.parentId == parentId){
            
            let valueId = (component.componentType.componentTypeId == 3) ? component.value.ResourceID : component.value;
            let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : component.value;
            let activation = getActivationLabel(component.activationTime);

            $('#childComponentsList').append('<tr id="Component' +
            component.componentId
            + '" data-facility-id="' +
            component.facilityId
            + '" data-component-type-id="' +
            component.componentType.componentTypeId
            + '" data-is-child="' +
            component.isChild
            + '" data-component-name="' +
            component.componentName
            + '" data-value="' +
            valueId
            + '" data-activation="' +
            component.activationTime
            + '" data-parent="'+
            component.parentId
            +'">'+
            '<td><b>' +
            component.componentName
            + '</b></td>'+
            '<td><span class="value' +
            component.componentId
            + '">' +
            valueText
            + 
            '</span></td>'+
            '<td><span id="value' +
            component.componentId
            + '">' +component.componentType.componentTypeName+
            '</span></td>'+
            '<td>'+activation+'</td>'+
            ' <td><input type="image" src="../images/icons/edit.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlAddUpdateComponent" onclick=populateUpdateComponentForm("Component' + component.componentId + '")>&nbsp;<input type="image" src="../images/icons/delete.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlDeleteComponent" onclick=setComponentIdForDelete("Component' + component.componentId + '")> </td>' +
            '</tr>');
            switch (component.componentType.componentTypeId) {
                case 1:
                    $('.value' + component.componentId).attr('class', ' valuePopulation');
                    break;
                case 2:
                    $('.value' + component.componentId).attr('class', ' valueBuilding');
                    break;
                case 3:
                    $('.value' + component.componentId).attr('class', ' valueResource');
                    break;
                case 4:
                    $('.value' + component.componentId).attr('class', ' valueFood');
                    break;
                case 5:
                    $('.value' + component.componentId).attr('class', ' valueMoney');
                    break;
                case 6:
                    $('.value' + component.componentId).attr('class', ' valueSpecial');
                    break;
            }
            
        }
    })
}

function getActivationLabel(activationTime) {
    let activationLabel = '';
    switch (activationTime) {
        case 0:
            activationLabel = 'Activated';
            break;
        case 1:
            activationLabel = activationTime + ' season';
            break;
        default:
            activationLabel = activationTime + ' seasons';
            break;
    }
    return activationLabel;
}

function emptyChildComponents() {
    $('#childComponentsList').empty();
}

function getRootParentComponent(componentId) {
    const componentElement = $(`#Component${componentId}`);

}

function sortComponents(index){
    let table = document.getElementById("tblComponents");
    let switching = true;
    let dir = "asc";
    let switchCount = 0;

    while(switching){
        let shouldSwitch = false;
        switching = false;
        rows = table.rows;

        for(i = 1; i < (rows.length - 1); i++){
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[index];
            y = rows[i + 1].getElementsByTagName("TD")[index];

            if(index != 0){
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                      // If so, mark as a switch and break the loop:
                      shouldSwitch = true;
                      break;
                    }
                } 
                else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                      // If so, mark as a switch and break the loop:
                      shouldSwitch = true;
                      break;
                    }
                }
            }
            else{
                if (dir == "asc") {
                    if (Number(x.innerHTML) > Number(y.innerHTML)) {
                      // If so, mark as a switch and break the loop:
                      shouldSwitch = true;
                      break;
                    }
                } 
                else if (dir == "desc") {
                    if (Number(x.innerHTML) < Number(y.innerHTML)) {
                      // If so, mark as a switch and break the loop:
                      shouldSwitch = true;
                      break;
                    }
                }
            }
        }

        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchCount ++;
          } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchCount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
        }
    }
}

function searchComponents() {
    let value = $('#txtComponentSearch').val().toLowerCase();
    $('#componentsList tr').filter( function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
}

function populateUpdateComponentForm(componentId) {
    let splicedComponentId = componentId.replace('Component', '');
    let facilityId = $('#' + componentId).data("facilityId");
    let componentTypeId = $('#' + componentId).data("componentTypeId");
    let isChild = $('#' + componentId).data("isChild");
    let componentName = $('#' + componentId).data("componentName");
    let value = $('#' + componentId).data("value");
    let activationTime = $('#' + componentId).data("activation");
    let parent = $('#' + componentId).data("parent");

    $('#hdnComponentId').val(splicedComponentId);
    $('#txtComponentName').val(componentName);
    $('#selComponentType').val(componentTypeId);
    $('#selFacility').val(facilityId);
    $('#chkChild').prop('checked', isChild);

    if (isChild) {
        $('#componentParentField').show();
        $('#selParent').val(parent);
    }
    else {
        $('#componentParentField').hide();
    }

    if (componentTypeId == 3) {
        $('#txtValue').hide();
        $('#selResource').show();

        $('#selResource').val(value);
    }
    else {
        $('#txtValue').show();
        $('#selResource').hide();

        $('#txtValue').val(value);
        if (componentTypeId == 2) {
            $('#txtValue').prop('disabled', 'disabled');
        }
        else {
            $('#txtValue').prop('disabled', false);
        }
    }

    if (facilityId != null) {
        $('#chkChild').attr('disabled', true);
        $('#componentParentField').hide();
        if (isChild) {
            $('#selFacility').attr('disabled', true);
        }
        else {
            $('#selFacility').attr('disabled', false);
        }
    }
    else {
        $('#chkChild').attr('disabled', false);
        $('#selFacility').attr('disabled', false);
    }
    $('#nmbActivation').val(activationTime);
}

function setComponentIdForDelete(componentId) {
    $('#btnDeleteComponent').attr('data-component-id', componentId);
}

function pageMain_eventHandler() {
    ipcRenderer.on("Resource:addResourceOK", (e, res) => {
        if (res) {
            getResourceTiers();
        }
    });
    ipcRenderer.on("Resource:deleteResourceByIdOk", (e, res) => {
        if (res) {
            getResourceTiers();
        }
    });
}

function mdlChildComponents_eventHandler() {
    $('#mdlChildComponents').on('shown.bs.modal', mdlChildComponents_shownEventHandler);
    $('#mdlChildComponents').on('hidden.bs.modal', mdlChildComponents_hiddenEventHandler);
}

function mdlChildComponents_shownEventHandler(e) {
    $('.modal-backdrop').css('z-index', '500');
    $('#mdlChildComponents').css('z-index', '600');
}

function mdlChildComponents_hiddenEventHandler(e) {
    emptyChildComponents();
}