let ComponentTypes = [];
let Resources = [];
let Facilities = [];

// START UTILITY FUNCTIONS
/**
 * Search and return a component type object by given component type id
 * this = component type id
 */
const findComponentTypeByID = function (componentType) {
    return componentType.componentTypeId === this.valueOf();
}

/**
 * Search and return a resource object by given resource id
 * this = resource id
 */
const findResourceByID = function (resource) {
    return resource.ResourceID === this.valueOf();
}

/**
 * Search and return a facility object by given facility id
 * this = facility id
 */
const findFacilityByID = function (facility) {
    let parsedID = parseInt(this.valueOf());
    return !isNaN(parsedID) && facility.facilityId === parsedID;
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

function getProcessArgObj() {
    return JSON.parse(window.process.argv.slice(-1));
}

// END UTILITY FUNCTIONS

$(function () {
    //Get all component related info
    getComponentsInfo();
    //Get all facilities for facility ddl
    getFacilitiesList();
    //Handles events from add component form
    frmAddComponent_eventHandler();
    //handle events from main page
    pageMain_eventHandler();
    //Handles events from region page
    pageRegion_eventHandler();
    //Handles events from confirm insert modal
    mdlConfirmInsert_eventHandler();
    //Initializes back to top functionality
    initBackToTop();
    //Initializes additional options menu
    initAdditionalOptions();
});

function getComponentsInfo() {
    ipcRenderer.send('Component:getAllComponentTypes');
    ipcRenderer.once('Component:getAllComponentTypesOK', (e, res) => {
        $('#selComponentType').empty();
        if (res != null) {
            ComponentTypes = res;
            res.forEach(componentType => {
                $('#selComponentType').append($('<option>', {
                    value: componentType.componentTypeId,
                    text: componentType.componentTypeName
                }));
            })
        }
    });

    const unusedPopulation = getProcessArgObj().UnusedPopulation;
    $('#hdnUnusedPopulation').val(unusedPopulation);

    getResourceTiers();
}

function getResourceTiers() {
    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function (e, res) {
        $('#selResource').empty();
        $('#selResource').append('<option selected value="">NONE</option>');
        if (res != null) {
            let tempResources = [];
            res.forEach(resourceTier => {
                tempResources = tempResources.concat(resourceTier.Resources);
                resourceTier.Resources.forEach(resource => {
                    $('#selResource').append($('<option>', {
                        value: resource.ResourceID,
                        text: resource.ResourceName
                    }));
                });
            });
            Resources = tempResources;
        }
    });
}

function getFacilitiesList() {
    let dataAvailable = false;
    let RegionID = getProcessArgObj().RegionID;
    ipcRenderer.send('Facility:getFacilitiesByRegion', parseInt(RegionID));
    ipcRenderer.once('Facility:getFacilitiesByRegionOK', (e, res) => {
        dataAvailable = true;
        $('#selFacility').empty();
        $('#selFacility').append('<option selected value="">NONE</option>');
        if (res != null) {
            Facilities = res;
            res.forEach(facility => {
                $('#selFacility').append($('<option>', {
                    value: facility.facilityId,
                    text: facility.facilityName
                }));
            })
        }
    });
}

function frmAddComponent_eventHandler() {
    $('#chkChild').on('click', () => {
        $('#componentParentField').toggle(this.checked);
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
    });

    $('#selComponentType').trigger('change');

    $('#frmAddComponent').on('submit', frmAddComponent_SubmitHandler);

    $('#frmAddComponent').on('reset', function () {
        $('#chkChild').attr('disabled', false);
        $('#selComponentType').trigger('change');
        $('#componentParentField').hide();

        $('#txtValue').show();
        $('#txtValue').attr('disabled', false);
        $('#txtValue').attr('required', true);
        $('#selResource').hide();
        $('#selResource').attr('required', false);
    });
}

function frmAddComponent_SubmitHandler(e) {
    e.preventDefault();
    let data = getDataFromForm();
    if (validateAddComponent(data)) {
        let rowTemplate = createRowFromData(data);
        if (data.isChild) {
            let parentRowId = `component-${data.parentId}`;
            rowTemplate = createChildrenRow(rowTemplate, parentRowId);
            $(`#${parentRowId}`).after(rowTemplate);

            const showChildrenbtn = $(`#${parentRowId}`).find('.btnShowChildren');
            let showChildren = parseInt($(showChildrenbtn).attr('data-show-children'));
            if (showChildren === 0) {
                let childrenRowCount = $(`.${parentRowId}-child`).length;
                updateShowChildrenButtonTooltip(showChildrenbtn, `Show Children (${childrenRowCount})`);
            }
        }
        else {
            $('#componentTableContent').append(rowTemplate);
            updateSelParent(data, false);
        }

        $('#frmAddComponent').trigger('reset');
        indexComponentTable();
        updateUnusedPopulation(data);

        let currUniqueID = parseInt($('#hdnUniqueID').val());
        $('#hdnUniqueID').val(currUniqueID + 1);
    }
}

function getDataFromForm() {
    let componentObj = {};
    let componentTypeId = parseInt($('#selComponentType').val());

    componentObj['uniqueID'] = $('#hdnUniqueID').val();
    componentObj['componentName'] = $('#txtComponentName').val();
    componentObj['componentType'] = { 'componentTypeId': componentTypeId };
    componentObj['regionId'] = parseInt(getProcessArgObj().RegionID);
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
    return componentObj;
}

/**
 * Validate Add/Update Component Form
 * @param {object} componentObj Submitted component
 * @returns {boolean} Whether submitted component is valid or not
 */
function validateAddComponent(componentObj) {
    let isValid = true;
    let componentType = componentObj.componentType.componentTypeId;

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

function updateUnusedPopulation(data) {
    if (data.componentType.componentTypeId == 1) {
        let unusedPopulation = parseInt($('#hdnUnusedPopulation').val());
        $('#hdnUnusedPopulation').val(unusedPopulation - data.value);
    }
}

function updateSelParent(component, isDelete) {
    if (isDelete) {
        $('#selParent').children().each(function (i, option) {
            if ($(option).val() == component.uniqueID) {
                $(option).remove();
                return;
            }
        });
    }
    else {
        let newOption = $('<option></option>').val(component.uniqueID).text(component.componentName);
        $('#selParent').append(newOption);
    }
}

function createRowFromData(data) {
    let clonedTemplateRow = $('#componentTemplateRow').clone().removeAttr('id');
    clonedTemplateRow.attr('id', `component-${data.uniqueID}`);
    clonedTemplateRow.data('componentData', data);
    clonedTemplateRow.find('#nameCell').text(data.componentName);

    const colorClass = getComponentTypeColorClass(data.componentType.componentTypeId);

    let typeCell = clonedTemplateRow.find('#typeCell');
    let componentTypeValue = ComponentTypes.find(findComponentTypeByID, data.componentType.componentTypeId);
    typeCell.text((componentTypeValue === undefined) ? "" : componentTypeValue.componentTypeName);
    typeCell.addClass(colorClass);

    let valueText = data.value;
    if (data.componentType.componentTypeId == 3) {
        let resourceValue = Resources.find(findResourceByID, parseInt(data.value.resourceId));
        valueText = (resourceValue === undefined) ? "" : resourceValue.ResourceName;
    } else if (data.componentType.componentTypeId == 2) {
        valueText = data.componentName;
    }
    let valueCell = clonedTemplateRow.find('#valueCell');
    valueCell.text(valueText).addClass(colorClass);

    let activationLabel = getActivationLabel(parseInt(data.activationTime));
    clonedTemplateRow.find('#activationTimeCell').text(activationLabel);

    let facilityValue = Facilities.find(findFacilityByID, data.facilityId);
    clonedTemplateRow.find('#facilityCell').text((facilityValue === undefined) ? "NONE" : facilityValue.facilityName);

    const actionCell = clonedTemplateRow.find('#actionCell');
    addTooltipToActionCellButton(actionCell);

    return clonedTemplateRow;
}

function addTooltipToActionCellButton(actionCell) {
    actionCell.find('.btnCopyComponent').tooltip({
        title: 'Copy to form',
        trigger: 'hover click'
    });

    actionCell.find('.btnDeleteComponent').tooltip({
        title: 'Delete',
        trigger: 'hover'
    });

    actionCell.find('.btnShowChildren').tooltip({
        title: 'Hide children',
        trigger: 'hover'
    });
}

function createChildrenRow(rowTemplate, parentRowId) {
    let parentRow = $(`#${parentRowId}`);
    let showChildren = parentRow.find('#actionCell').find('.btnShowChildren').attr('data-show-children');

    rowTemplate.addClass('childComponentRow ' + `${parentRowId}-child`);
    if (parseInt(showChildren) === 1) {
        rowTemplate.addClass('show');
    }
    rowTemplate.find('.btnShowChildren').remove();
    return rowTemplate;
}

function indexComponentTable() {
    $('#componentTableContent')
        .children('tr')
        .not('#componentTemplateRow, .childComponentRow')
        .each(function (i, row) {
            $(row).find('#numberCell').text(i + 1);
        });
}

function btnCopyComponent_ClickHandler(btn) {
    let data = $(btn).parents('tr').data('componentData');
    fillFormWithData(data);
    $(btn).attr('title', 'Copied!')
        .attr('data-original-title', 'Copied!')
        .tooltip('update')
        .tooltip('show');
}

function fillFormWithData(data) {
    $('#frmAddComponent').trigger('reset');
    if (data == null) {
        return;
    }
    let componentTypeId = data.componentType.componentTypeId;
    let facilityId = data.facilityId

    $('#txtComponentName').val(data.componentName);
    $('#selComponentType').val(componentTypeId);
    $('#selComponentType').trigger('change');
    $('#selFacility').val(facilityId);

    if (componentTypeId == 3) {
        $('#txtValue').hide();
        $('#selResource').show();

        $('#selResource').val(data.value.resourceId);
    }
    else {
        $('#txtValue').show();
        $('#selResource').hide();

        $('#txtValue').val(data.value);
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
        $('#selParent').val('');
    }
    else {
        $('#chkChild').attr('disabled', false);
        $('#selFacility').attr('disabled', false);
    }

    $('#nmbActivation').val(parseInt(data.activationTime));
}

function btnCopyComponent_BlurHandler(btn) {
    $(btn).attr('title', 'Copy to form')
        .attr('data-original-title', 'Copy to form')
        .tooltip('update')
        .tooltip('hide');
}

function btnDeleteComponent_ClickHandler(btn) {
    let deletedRow = $(btn).parents('tr').attr('id');
    if (getOptions().fastDelete) {
        $(btn).tooltip('dispose');
        deleteComponent(deletedRow);
    } else {
        $('#btnConfirmDeleteComponent').data('deletedRow', deletedRow);
        $('#mdlDeleteComponent').modal('show');
    }
}

function btnConfirmDeleteComponent_ClickHandler(btn) {
    let deletedRowId = $(btn).data('deletedRow');
    deleteComponent(deletedRowId);
    $(btn).removeData('deletedRow');
}

function deleteComponent(deletedRowId) {
    let deletedRow = $('#componentTableContent').find(`tr#${deletedRowId}`)
    let data = deletedRow.data('componentData');

    deletedRow.remove();
    $(`.${deletedRowId}-child`).remove();

    $('#mdlDeleteComponent').modal('hide');
    indexComponentTable();
    updateSelParent(data, true);
}

function btnShowChildren_ClickHandler(btn) {
    let parentRowId = $(btn).parents('tr').attr('id');
    let childrenRow = $(`.${parentRowId}-child`);
    childrenRow.toggleClass('show');

    // To toggle show children or not
    let showChildren = (parseInt($(btn).attr('data-show-children')) + 1) % 2;
    $(btn).attr('data-show-children', showChildren);

    let tooltipTitle = (showChildren === 1) ? "Hide children" : `Show children (${childrenRow.length})`;
    updateShowChildrenButtonTooltip(btn, tooltipTitle);
}

function updateShowChildrenButtonTooltip(btn, tooltipTitle) {
    $(btn).attr('title', tooltipTitle)
        .attr('data-original-title', tooltipTitle)
        .tooltip('update')
        .tooltip('show');
}

function showSummaryModal() {
    const data = getDataFromTable();
    const alertWrapper = $('.alert-wrapper');

    if (data.length === 0) {
        if (alertWrapper
            .children('.alert')
            .not('#emptyTableTemplateAlert, #insertResultTemplateAlert')
            .length >= 1
        ) {
            return;
        }

        let emptyTableAlert = $('#emptyTableTemplateAlert').clone().removeAttr('id');
        alertWrapper.append(emptyTableAlert);
        setTimeout(() => {
            emptyTableAlert.alert('close');
        }, 2500);
        return;
    }

    $('#hdnSerializedComponents').val(JSON.stringify(data));
    const summary = summariseData(data);

    $('#summaryParent').text(summary.Parent);
    $('#summaryChild').text(summary.Children);

    let i = 0;
    ComponentTypes.forEach(componentType => {
        $(`#summary${componentType.componentTypeName}`).text(summary.ComponentType[i]);
        i++;
    });

    $('#mdlConfirmInsert').modal('show');
}

function getDataFromTable() {
    let data = [];
    $('#componentTableContent').children('tr').not('#componentTemplateRow').each(function (i, row) {
        data.push($(row).data('componentData'));
    });
    return data;
}

function summariseData(data) {
    let summary = {
        'Parent': 0,
        'Children': 0,
        'ComponentType': [
            // In order:
            // Population, Building, Resource, Food, Money, Special
            0, 0, 0, 0, 0, 0
        ]
    };
    for (let i = 0; i < data.length; i++) {
        const component = data[i];
        if (!component.isChild) {
            summary.Parent++;
        } else {
            summary.Children++;
        }
        summary.ComponentType[component.componentType.componentTypeId - 1]++;
    }
    return summary;
}

function mdlConfirmInsert_eventHandler() {
    $('#mdlConfirmInsert').on('hide.bs.modal', function () {
        $('#hdnSerializedComponents').val('');
    });

    $('#btnMoreSummary').on('click', function () {
        const arrowIcon = $(this).find('i');
        arrowIcon.toggleClass('up down');
    });
}

function doBulkInsert() {
    $('#btnConfirmInsert').prop('disabled', true);
    $('#insertLoader').show();
    $('#btnFormSubmit').prop('disabled', true);
    $('.btnDeleteComponent').prop('disabled', true);

    const serializedData = $('#hdnSerializedComponents').val();
    ipcRenderer.send('Component:addMultipleComponents', JSON.parse(serializedData));
    ipcRenderer.once('Component:addMultipleComponentsOK', (e, res) => {
        executeInsertResult(res);
    });
}

function executeInsertResult(success) {
    $('#insertLoader').hide();
    $('#insertResultTemplateAlert').removeClass('d-none');
    $('#mdlConfirmInsert').modal('hide');
    if (success) {
        $('#insertResultTemplateAlert').addClass('alert-success');
        setTimeout(() => {
            ipcRenderer.send('ClosePageOnDelete');
        }, 5000);
    } else {
        $('#insertResultTemplateAlert').addClass('alert-danger');
    }
}

function pageMain_eventHandler() {
    const resourceEvents = [
        "Resource:addResourceOK",
        "Resource:updateResourceAllOK",
        "Resource:deleteResourceByIdOk"
    ];
    resourceEvents.forEach(eventString => {
        ipcRenderer.on(eventString, (e, res) => {
            if (res) {
                getResourceTiers();
            }
        });
    });
}

function pageRegion_eventHandler() {
    const facilityEvents = [
        "Facility:addFacilityOK",
        "Facility:updateFacilityOK",
        "Facility:deleteFacilityOK"
    ];
    facilityEvents.forEach(eventString => {
        ipcRenderer.on(eventString, (e, res) => {
            if (res) {
                getFacilitiesList();
            }
        });
    });
}

function initBackToTop() {
    $(window).on('scroll', function () {
        if ($(this).scrollTop()) {
            $('.to-top').fadeIn();
        } else {
            $('.to-top').fadeOut();
        }
    });

    $('.to-top').on('click', function () {
        $('html').animate({ scrollTop: 0 }, 1000);
    })
}

function initAdditionalOptions() {
    $('#fastDeleteWrapper').tooltip({
        title: "Deleting a row won't show confirmation modal"
    });
}

function getOptions() {
    return {
        fastDelete: $('#chkFastDelete').is(':checked')
    };
}