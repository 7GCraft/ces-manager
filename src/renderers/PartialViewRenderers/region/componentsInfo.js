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
});

function getComponentsInfo() {
    ipcRenderer.send('Component:getComponentList', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Component:getComponentListOK', (e, res) => {
        setComponentList(res);
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
        //console.log(res);
        if (res != null) {
            res.forEach(componentType => {
                $('#selComponentType').append($('<option>', {
                    value: componentType.componentTypeId,
                    text: componentType.componentTypeName
                }));
            })
        }
    });

    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function (e, res) {
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
            $('#selFacility').append($('<option>', {
                value: facility.facilityId,
                text: facility.facilityName
            }));
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

    $('#frmAddUpdateComponent').on('submit', e => {
        e.preventDefault();

        let componentObj = {};

        componentObj['componentName'] = $('#txtComponentName').val();
        componentObj['componentType'] = { 'componentTypeId': $('#selComponentType').val() };
        componentObj['regionId'] = parseInt(window.process.argv.slice(-1));
        componentObj['facilityId'] = ($('#selFacility').val() == '') ? null : $('#selFacility').val();

        if ($('#chkChild').is(':checked')) {
            componentObj['isChild'] = true;
            componentObj['parentId'] = $('#selParent').val();
        }
        else {
            componentObj['isChild'] = false;
        }

        if ($('#selComponentType').val() == 3) {
            componentObj['value'] = { 'resourceId': $('#selResource').val() };
        }
        else {
            let componentTypeId = $('#selComponentType').val();

            componentObj['value'] = (componentTypeId == 1 || componentTypeId == 4 || componentTypeId == 5) ? parseInt($('#txtValue').val()) : $('#txtValue').val();
        }

        componentObj['activationTime'] = $('#nmbActivation').val();

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
    if (Array.isArray(res) && res.length) {
        let childComponents = []
        res.forEach(component => {
            if (!component.isChild) {
                let valueId = (component.componentType.componentTypeId == 3) ? component.value.ResourceID : component.value;
                let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : component.value;
                let activation = (component.activationTime > 0) ? ' Activation Time: ' + component.activationTime : '';
                $('#componentsList').append('<li id="Component' +
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
                    + '"><b>' +
                    component.componentName
                    + '</b> <input type="image" src="../images/icons/edit.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlAddUpdateComponent" onclick=populateUpdateComponentForm("Component' + component.componentId + '")>&nbsp;<input type="image" src="../images/icons/delete.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlDeleteComponent" onclick=setComponentIdForDelete("Component' + component.componentId + '")> <span class="parentComponent"><span class="value' +
                    component.componentId
                    + '">' +
                    valueText
                    + ' (' +
                    component.componentType.componentTypeName
                    + ')</span>' +
                    activation
                    + '</span></li>');

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

        childComponents.forEach(component => {
            if ($('#Component' + component.parentId).length) {
                let valueId = (component.componentType.componentTypeId == 3) ? component.value.ResourceID : component.value;
                let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : component.value;
                let activation = (component.activationTime > 0) ? ' Activation Time: ' + component.activationTime : '';

                $('#Component' + component.parentId).append('<ul><li id="Component' +
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
                    + '" data-parent="' +
                    component.parentId
                    + '"><b>' +
                    component.componentName
                    + '</b> <input type="image" src="../images/icons/edit.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlAddUpdateComponent" onclick=populateUpdateComponentForm("Component' + component.componentId + '")>&nbsp;<input type="image" src="../images/icons/delete.png" style="height: 15px; width:15px;" data-toggle="modal" data-target="#mdlDeleteComponent" onclick=setComponentIdForDelete("Component' + component.componentId + '")> <span class="childComponent"><span id="value' +
                    component.componentId
                    + '">' +
                    valueText
                    + ' (' +
                    component.componentType.componentTypeName
                    + ')</span> ' +
                    activation
                    + '</span></li></ul>');
                switch (component.componentType.componentTypeId) {
                    case 1:
                        $('#value' + component.componentId).attr('class', 'valuePopulation');
                        break;
                    case 2:
                        $('#value' + component.componentId).attr('class', 'valueBuilding');
                        break;
                    case 3:
                        $('#value' + component.componentId).attr('class', 'valueResource');
                        break;
                    case 4:
                        $('#value' + component.componentId).attr('class', 'valueFood');
                        break;
                    case 5:
                        $('#value' + component.componentId).attr('class', 'valueMoney');
                        break;
                    case 6:
                        $('#value' + component.componentId).attr('class', 'valueSpecial');
                        break;
                }
            }
        })

        //console.log(childComponents);
    }
    else {
        $('#componentsList').append('<li>NO COMPONENTS AVAILABLE</li>')
    }
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
    //console.log($('#hdnComponentId').val());
}

function setComponentIdForDelete(componentId) {
    $('#btnDeleteComponent').attr('data-component-id', componentId);
}