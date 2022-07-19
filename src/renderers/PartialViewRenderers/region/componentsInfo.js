const USED = 'used'
const UNUSED = 'unused'
const ACTIVATED = 'activated'
const UNACTIVATED = 'unactivated'
const COMPONENT_LIST = 'componentList'

// START UTILITY FUNCTIONS
function getProcessArgObj() {
    return JSON.parse(window.process.argv.slice(-1));
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

function getComponentTypeColorClass(componentTypeId) {
    let className = '';
    switch (componentTypeId) {
        case 1:
            className = 'valuePopulation';
            break;
        case 2:
            className = 'valueBuilding';
            break;
        case 3:
            className = 'valueResource';
            break;
        case 4:
            className = 'valueFood';
            break;
        case 5:
            className = 'valueMoney';
            break;
        case 6:
            className = 'valueSpecial';
            break;
    }
    return className;
}

function replaceElementAttributeContent(element, attribute, stringToReplace, newString) {
    let attributeContent = $(element).attr(attribute);
    $(element).attr(attribute, attributeContent.replace(stringToReplace, newString));
}
// END UTILITY FUNCTIONS

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
    //handle events from btnOpenBulkInsertComponents
    btnOpenBulkInsertComponents_eventHandler();
    //handle events from bulk insert page
    bulkInsertPage_eventHandler();
});

function getComponentsInfo() {
    ipcRenderer.send('Component:getComponentList', parseInt(getProcessArgObj()));
    ipcRenderer.once('Component:getComponentListOK', (e, res) => {
        localStorage.setItem(COMPONENT_LIST, JSON.stringify(res));
        
        let childComponents = []
        res.forEach((component, i) => {
            if (component.isChild) {
                childComponents.push(component);
            }
        });

        const parentChildComponentsDict = mapParentWithChildComponent(childComponents);
        localStorage.setItem('childComponents', JSON.stringify(parentChildComponentsDict));
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

/**
 * Create a dictionary object where the key is a parent component id, and the value is a list of child components in that parent component
 * @param {Object[]} childComponents List of child components from setComponentList()
 */
function mapParentWithChildComponent(childComponents) {
    let returnDict = {};
    if (childComponents.length === 0) {
        return returnDict;
    }
    childComponents.forEach(component => {
        let parentId = component.parentId;
        if (!(parentId in returnDict)) {
            returnDict[parentId] = [];
        }
        returnDict[parentId].push(component);
    });
    return returnDict;
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
    ipcRenderer.send('Facility:getFacilitiesByRegion', parseInt(getProcessArgObj()));
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
    $('input[type=radio][name=usedComponentDisplay]').on('change', e => {
        e.preventDefault();
        filterComponents()
    });

    $('input[type=radio][name=activatedComponentDisplay]').on('change', e => {
        e.preventDefault();
        filterComponents()
    });
}

function filterComponents() {
    let componentUsabilityFilterMode = $('input[name=usedComponentDisplay]:checked').val();
    let componentActivationFilterMode = $('input[name=activatedComponentDisplay]:checked').val();  
    let componentList = JSON.parse(localStorage.getItem(COMPONENT_LIST))

    if(componentUsabilityFilterMode === USED){
        componentList = componentList.filter(component=> component.facilityId !== null)
    }else
    if(componentUsabilityFilterMode === UNUSED){
        componentList = componentList.filter(component=> component.facilityId === null)
    }

    if(componentActivationFilterMode === ACTIVATED){
        componentList = componentList.filter(component => component.activationTime === 0)
    }else
    if(componentActivationFilterMode === UNACTIVATED){
       
        componentList = componentList.filter(component => component.activationTime !== 0)
    }

    setComponentList(componentList);
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
        componentObj['regionId'] = parseInt(getProcessArgObj());
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

        componentObj['cost'] = $('#nmbCost').val();
        componentObj['activationTime'] = $('#nmbActivation').val();

        if (!validate_addUpdateComponent(componentObj, componentTypeId))
            return;

        if ($('#hdnComponentId').val() == '') {
            ipcRenderer.send('Component:addComponent', componentObj);
            ipcRenderer.once('Component:addComponentOK', (e, res) => {
                if (res === "OK") {
                    alert("Successfully added component");
                    ipcRenderer.send("ReloadPageOnUpdate");
                }
                else {
                    $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+res+'</div>');
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
    $('#btnConfirmDeleteComponent').on('click', (e) => {
        e.preventDefault();
        let componentId = $('#btnConfirmDeleteComponent').data('componentId').replace('Component', '');

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

/**
 * Fill component's table
 * @param {Object[]} res List of components from Database
 */
function setComponentList(res) {
    //Refreshes the component list everytime

    $('#componentsList li') ?  $('#componentsList li').remove() : '' ;
    $('#componentsList').children('tr').not('#componentTemplateRow').remove();
    if (Array.isArray(res) && res.length) {
        res.forEach((component, i) => {
            if (!component.isChild) {
                let componentRow = createComponentRow(component);
                $('#componentsList').append(componentRow);
            }
        });

        indexComponentTable('componentsList', 'numberCell', ['#componentTemplateRow']);
        $('.btn-show-children').tooltip();
    }
    else {
        $('#componentsList').append('<li>NO COMPONENTS AVAILABLE</li>')
    }
}

/**
 * Create an HTML element object from a row template using a component's data
 * @param {object} component Component object as data
 * @returns HTML element with component's information
 */
function createComponentRow(component) {
    let rowId = `Component${component.componentId}`;
    let classType = getComponentTypeColorClass(component.componentType.componentTypeId);
    let templateRowId = (component.isChild) ? '#childComponentTemplateRow' : '#componentTemplateRow';
    let clonedTemplate = $(templateRowId).clone().attr('id', rowId).data('componentData', component);

    if (component.facilityId === null) {
        clonedTemplate.css('background-color', '#f2c9c9');
    }
    clonedTemplate.find('#nameCell').text(component.componentName);

    let valueText = (component.componentType.componentTypeId == 3) ? component.value.ResourceName : (component.componentType.componentTypeId == 2) ? component.componentName : component.value;
    clonedTemplate.find('#valueCell').text(valueText).addClass(classType);

    clonedTemplate.find('#typeCell').text(component.componentType.componentTypeName).addClass(classType);
    let activation = getActivationLabel(component.activationTime);
    clonedTemplate.find('#activationTimeCell').text(activation);

    if (!component.isChild) {
        let showChildBtn = clonedTemplate.find('#childrenCell').find('button');
        assignShowChildBtnUtil(showChildBtn, component.componentId);
        replaceElementAttributeContent(showChildBtn, 'onclick', '{componentId}', component.componentId);
    }

    let updateComponentBtn = clonedTemplate.find('#actionCell').find('#btnUpdateComponent');
    replaceElementAttributeContent(updateComponentBtn, 'onclick', '{rowId}', rowId);

    let deleteComponentBtn = clonedTemplate.find('#actionCell').find('#btnDeleteComponent');
    replaceElementAttributeContent(deleteComponentBtn, 'onclick', '{rowId}', rowId);
    return clonedTemplate;
}

function assignShowChildBtnUtil(showChildBtn, componentId) {
    let childComponents = JSON.parse(localStorage.getItem('childComponents'));
    let childrenCount = 0;
    if (componentId in childComponents) {
        childrenCount = childComponents[componentId].length;
    }
    let tooltipTitle = '';

    if (childrenCount > 0) {
        tooltipTitle = `Show Children (${childrenCount})`;
        showChildBtn.attr('data-toggle', 'modal');
        showChildBtn.attr('data-target', '#mdlChildComponents');
    }
    else {
        tooltipTitle = 'No children exists';
    }

    showChildBtn.attr('title', tooltipTitle);
}

function showChildComponents(parentId) {
    let childComponents = JSON.parse(localStorage.getItem('childComponents'));
    if (!(parentId in childComponents)) {
        return;
    }
    childComponents[parentId].forEach(component => {
        let componentRow = createComponentRow(component);
        $('#childComponentsList').append(componentRow);
    });

    indexComponentTable('childComponentsList', 'numberCell', ['#childComponentTemplateRow']);
}

function emptyChildComponents() {
    $('#childComponentsList').children('tr').not('#childComponentTemplateRow').remove();
}

function sortComponents(index) {
    let table = document.getElementById("tblComponents");
    let switching = true;
    let dir = "asc";
    let switchCount = 0;

    while (switching) {
        let shouldSwitch = false;
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[index];
            y = rows[i + 1].getElementsByTagName("TD")[index];

            if (index != 0) {
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
            else {
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
            switchCount++;
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

/**
 * Index a component's table by giving number to each rows
 * @param {String} tableId Component's table ID that needs to be indexed
 * @param {String} numberCellId ID attribute of HTML element from row that needs to be given number
 * @param {String[]} excludedRows List of excluded class/id rows to be excluded from indexing
 */
function indexComponentTable(tableId, numberCellId, excludedRows = null) {
    let rows = $(`#${tableId}`).children('tr');
    if (excludedRows !== null) {
        rows = rows.not(excludedRows.join());
    }
    rows.each(function (i, row) {
        $(row).find(`#${numberCellId}`).text(i + 1);
    });
}

function populateUpdateComponentForm(componentId) {
    let splicedComponentId = componentId.replace('Component', '');

    let componentData = $(`#${componentId}`).data('componentData');
    const {
        facilityId,
        componentType,
        isChild,
        componentName,
        value,
        activationTime,
        parentId,
        parent
    } = componentData;
    const componentTypeId = componentType.componentTypeId;

    $('#hdnComponentId').val(splicedComponentId);
    $('#txtComponentName').val(componentName);
    $('#selComponentType').val(componentTypeId);
    $('#selFacility').val(facilityId);
    $('#chkChild').prop('checked', isChild);

    if (isChild) {
        $('#componentParentField').show();
        $('#selParent').val(parentId);
    }
    else {
        $('#componentParentField').hide();
    }

    if (componentTypeId == 3) {
        $('#txtValue').hide();
        $('#selResource').show();

        $('#selResource').val(value.ResourceID);
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
    $('#btnConfirmDeleteComponent').attr('data-component-id', componentId);
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

function btnOpenBulkInsertComponents_eventHandler() {
    $('#btnOpenBulkInsertComponents').on('click', function () {
        let RegionID = getProcessArgObj();
        let unusedPopulation = $('#hdnUnusedPopulation').val();
        ipcRenderer.send('Component:openBulkInsertPage', JSON.stringify({
            'RegionID': RegionID,
            'UnusedPopulation': unusedPopulation
        }));
    });
}

function bulkInsertPage_eventHandler() {
    ipcRenderer.on("Component:addMultipleComponentsOK", (e, res) => {
        if (res) {
            ipcRenderer.send("ReloadPageOnUpdate");
        }
    });
}