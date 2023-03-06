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
};

/**
 * Search and return a resource object by given resource id
 * this = resource id
 */
const findResourceByID = function (resource) {
  return resource.ResourceID === this.valueOf();
};

/**
 * Search and return a facility object by given facility id
 * this = facility id
 */
const findFacilityByID = function (facility) {
  const parsedID = parseInt(this.valueOf());
  return !isNaN(parsedID) && facility.facilityId === parsedID;
};

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
      activationLabel = `${activationTime} season`;
      break;
    default:
      activationLabel = `${activationTime} seasons`;
      break;
  }
  return activationLabel;
}

function getProcessArgObj() {
  return JSON.parse(window.process.argv.slice(-1));
}

// END UTILITY FUNCTIONS

$(() => {
  getComponentsInfo();

  getFacilitiesList();

  initComponentTemplatesDropdown();

  frmAddComponent_eventHandler();

  frmAddByTemplate_eventHandler();

  pageMain_eventHandler();

  pageRegion_eventHandler();

  mdlConfirmInsert_eventHandler();

  initBackToTop();

  initAdditionalOptions();
});

function getComponentsInfo() {
  ipcRenderer.send('Component:getAllComponentTypes');
  ipcRenderer.once('Component:getAllComponentTypesOK', (e, res) => {
    $('#selComponentType').empty();
    if (res != null) {
      ComponentTypes = res;
      res.forEach((componentType) => {
        $('#selComponentType').append($('<option>', {
          value: componentType.componentTypeId,
          text: componentType.componentTypeName,
        }));
      });
    }
  });

  const unusedPopulation = getProcessArgObj().UnusedPopulation;
  $('#hdnUnusedPopulation').val(unusedPopulation);

  getResourceTiers();
}

function getResourceTiers() {
  ipcRenderer.send('Resource:getAllResourceTiers');
  ipcRenderer.once('Resource:getAllResourceTiersOk', (e, res) => {
    $('#selResource').empty();
    $('#selResource').append('<option selected value="">NONE</option>');
    if (res != null) {
      let tempResources = [];
      res.forEach((resourceTier) => {
        tempResources = tempResources.concat(resourceTier.Resources);
        resourceTier.Resources.forEach((resource) => {
          $('#selResource').append($('<option>', {
            value: resource.ResourceID,
            text: resource.ResourceName,
          }));
        });
      });
      Resources = tempResources;
    }
  });
}

function getFacilitiesList() {
  let dataAvailable = false;
  const { RegionID } = getProcessArgObj();
  ipcRenderer.send('Facility:getFacilitiesByRegion', parseInt(RegionID));
  ipcRenderer.once('Facility:getFacilitiesByRegionOK', (e, res) => {
    dataAvailable = true;
    $('#selFacility').empty();
    $('#selFacility').append('<option selected value="">NONE</option>');
    if (res != null) {
      Facilities = res;
      res.forEach((facility) => {
        $('#selFacility').append($('<option>', {
          value: facility.facilityId,
          text: facility.facilityName,
        }));
      });
    }
  });
}

function initComponentTemplatesDropdown() {
  facilityTemplates.forEach((template) => {
    $('<button>')
      .text(template.name)
      .addClass('dropdown-item component-template-item')
      .prop('type', 'button')
      .appendTo('#componentTemplateList');
  });
}

function frmAddComponent_eventHandler() {
  $('#chkChild').on('click', () => {
    $('#componentParentField').toggle(this.checked);
  });

  $('#selComponentType').on('change', () => {
    $('#txtValue').val('');
    $('#selResource').val(null);
    $('#txtValue').prop('disabled', false);
    if ($('#selComponentType').val() == 3) {
      $('#txtValue').hide();
      $('#selResource').show();
      $('#selResource').attr('required', true);
      $('#txtValue').attr('required', false);
    } else {
      $('#txtValue').show();
      $('#selResource').hide();
      $('#selResource').attr('required', false);
      $('#txtValue').attr('required', true);
    }

    if ($('#selComponentType').val() == 2) {
      $('#txtValue').prop('disabled', 'disabled');
      $('#txtValue').attr('required', false);
    }
  });

  $('#selFacility').on('change', () => {
    if ($('#selFacility').val() != '') {
      $('#chkChild').prop('checked', false);
      $('#componentParentField').hide();
      $('#chkChild').attr('disabled', true);
    } else {
      $('#chkChild').removeAttr('disabled');
    }
  });

  $('#selComponentType').trigger('change');

  $('#frmAddComponent').on('submit', frmAddComponent_SubmitHandler);

  $('#frmAddComponent').on('reset', () => {
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

function frmAddByTemplate_eventHandler() {
  $('.component-template-item').on('click', (e) => {
    try {
      $('#addTemplateCostModal').modal('show');
      $('#hdnTemplateInput').val(e.target.textContent)
    } catch (error) {
      alert(error);
    }
  });
}



function btnTemplateCostComponent_SaveHandler(){

  let templateChoice = $('#hdnTemplateInput').val()
  const components = getComponentsFromTemplateByKey(templateChoice);
  let newComponents = addComponentCost(components)
  addTemplateWithCost(newComponents);
}

function addComponentCost(components){
  let buildingCost = $('#costFormBuildingCost').val();
  let buildingActivationTime = $('#costFormBuildingActivationTime').val();
  let populationCost =  $('#costFormPopulationCost').val();
  let populationActivationTime =  $('#costFormPopulationActivationTime').val();
  let newComponents = [...components]
  newComponents.forEach(component=>{
    if(component.componentType.componentTypeId == 1){
      component.cost = populationCost;
      component.activationTime = populationActivationTime
    }
    if(component.componentType.componentTypeId == 2){
      component.cost = buildingCost;
      component.activationTime = buildingActivationTime
    }
  })
  return components
}

function addTemplateWithCost(components){
  components.forEach((component) => {
    component.facilityId = $('#selFacility').val();
    doInsertComponent(component);
  });
  $('#addTemplateCostModal').modal('hide')
}

function doInsertComponent(data) {
  let rowTemplate = createRowFromData(data);
  if (data.isChild) {
    const parentRowId = `component-${data.parentId}`;
    rowTemplate = createChildrenRow(rowTemplate, parentRowId);
    $(`#${parentRowId}`).after(rowTemplate);

    const showChildrenbtn = $(`#${parentRowId}`).find('.btnShowChildren');
    const showChildren = parseInt($(showChildrenbtn).attr('data-show-children'));
    if (showChildren === 0) {
      const childrenRowCount = $(`.${parentRowId}-child`).length;
      updateShowChildrenButtonTooltip(showChildrenbtn, `Show Children (${childrenRowCount})`);
    }
  } else {
    $('#componentTableContent').append(rowTemplate);
    updateSelParent(data, false);
  }
  indexComponentTable();
  updateUnusedPopulation(data, false);
}

function updateUniqueID() {
  const currUniqueID = parseInt($('#hdnUniqueID').val());
  $('#hdnUniqueID').val(currUniqueID + 1);
}

function frmAddComponent_SubmitHandler(e) {
  e.preventDefault();
  const data = getDataFromForm();
  if (validateAddComponent(data)) {
    updateUniqueID();
    doInsertComponent(data);
    $('#frmAddComponent').trigger('reset');
  }
}

function getDataFromForm() {
  const componentObj = {};
  const componentTypeId = parseInt($('#selComponentType').val());

  componentObj.uniqueID = $('#hdnUniqueID').val();
  componentObj.componentName = $('#txtComponentName').val();
  componentObj.componentType = { componentTypeId };
  componentObj.regionId = parseInt(getProcessArgObj().RegionID);
  componentObj.facilityId = ($('#selFacility').val() == '') ? null : $('#selFacility').val();

  if ($('#chkChild').is(':checked')) {
    componentObj.isChild = true;
    componentObj.parentId = $('#selParent').val();
  } else {
    componentObj.isChild = false;
  }

  if (componentTypeId == 3) {
    componentObj.value = { resourceId: $('#selResource').val() };
  } else if (componentTypeId == 2) {
    componentObj.value = null;
  } else {
    componentObj.value = (componentTypeId == 1 || componentTypeId == 4 || componentTypeId == 5) ? parseInt($('#txtValue').val() || 0) : $('#txtValue').val();
  }

  componentObj.cost = $('#nmbCost').val();
  componentObj.activationTime = $('#nmbActivation').val();
  return componentObj;
}

function getComponentsFromTemplateByKey(key) {
  try {
    const template = facilityTemplates.find((temp) => temp.name === key);
    if (template === undefined) {
      throw 'Template Not Found';
    } else if (template.population > parseInt($('#hdnUnusedPopulation').val())) {
      throw 'Required population is bigger than unused population';
    }

    const components = [];
    components.push(createComponentFromTemplateAndUpdateUniqueID(1, template.population, template.popName));
    components.push(createComponentFromTemplateAndUpdateUniqueID(2, null, template.componentBuildingName));
    if (template.hasOwnProperty('food')) {
      components.push(createComponentFromTemplateAndUpdateUniqueID(4, template.food, 'Food'));
    }
    if (template.hasOwnProperty('money')) {
      components.push(createComponentFromTemplateAndUpdateUniqueID(5, template.money, 'Money'));
    }
    return components;
  } catch (error) {
    throw error;
  }
}

function createComponentFromTemplateAndUpdateUniqueID(componentTypeId, value, name) {
  const componentObj = {};

  componentObj.uniqueID = $('#hdnUniqueID').val();
  componentObj.componentName = name;
  componentObj.componentType = { componentTypeId };
  componentObj.regionId = parseInt(getProcessArgObj().RegionID);
  componentObj.facilityId = null;
  componentObj.isChild = false;
  componentObj.value = value;
  componentObj.cost = 0;
  componentObj.activationTime = 0;

  updateUniqueID();
  return componentObj;
}

/**
 * Validate Add/Update Component Form
 * @param {object} componentObj Submitted component
 * @returns {boolean} Whether submitted component is valid or not
 */
function validateAddComponent(componentObj) {
  let isValid = true;
  const componentType = componentObj.componentType.componentTypeId;

  if (componentType == 1
        && componentObj.value > parseInt($('#hdnUnusedPopulation').val())) {
    isValid = false;
    $('#txtValue').addClass('is-invalid');
    $('#lblValueErrMessage').text('Value must not be bigger than unused population');
  } else {
    $('#txtValue').removeClass('is-invalid');
  }

  return isValid;
}

function updateUnusedPopulation(data, isDelete) {
  if (data.componentType.componentTypeId == 1) {
    const unusedPopulation = parseInt($('#hdnUnusedPopulation').val());
    let usedPopulation = data.value;
    if (isDelete) usedPopulation *= -1;
    $('#hdnUnusedPopulation').val(unusedPopulation - usedPopulation);
  }
}

function updateSelParent(component, isDelete) {
  if (isDelete) {
    $('#selParent').children().each((i, option) => {
      if ($(option).val() == component.uniqueID) {
        $(option).remove();
      }
    });
  } else {
    const newOption = $('<option></option>').val(component.uniqueID).text(component.componentName);
    $('#selParent').append(newOption);
  }
}

function createRowFromData(data) {
  const clonedTemplateRow = $('#componentTemplateRow').clone().removeAttr('id');
  clonedTemplateRow.attr('id', `component-${data.uniqueID}`);
  clonedTemplateRow.data('componentData', data);
  clonedTemplateRow.find('#nameCell').text(data.componentName);

  const colorClass = getComponentTypeColorClass(data.componentType.componentTypeId);

  const typeCell = clonedTemplateRow.find('#typeCell');
  const componentTypeValue = ComponentTypes.find(findComponentTypeByID, data.componentType.componentTypeId);
  typeCell.text((componentTypeValue === undefined) ? '' : componentTypeValue.componentTypeName);
  typeCell.addClass(colorClass);

  let valueText = data.value;
  if (data.componentType.componentTypeId == 3) {
    const resourceValue = Resources.find(findResourceByID, parseInt(data.value.resourceId));
    valueText = (resourceValue === undefined) ? '' : resourceValue.ResourceName;
  } else if (data.componentType.componentTypeId == 2) {
    valueText = data.componentName;
  }
  const valueCell = clonedTemplateRow.find('#valueCell');
  valueCell.text(valueText).addClass(colorClass);

  const costText = data.cost;
  clonedTemplateRow.find('#costCell').text(costText);

  const activationLabel = getActivationLabel(parseInt(data.activationTime));
  clonedTemplateRow.find('#activationTimeCell').text(activationLabel);

  const facilityValue = Facilities.find(findFacilityByID, data.facilityId);
  clonedTemplateRow.find('#facilityCell').text((facilityValue === undefined) ? 'NONE' : facilityValue.facilityName);

  const actionCell = clonedTemplateRow.find('#actionCell');
  addTooltipToActionCellButton(actionCell);

  return clonedTemplateRow;
}

function addTooltipToActionCellButton(actionCell) {
  actionCell.find('.btnCopyComponent').tooltip({
    title: 'Copy to form',
    trigger: 'hover click',
  });
  actionCell.find('.btnEditComponent').tooltip({
    title: 'Edit Component',
    trigger: 'hover click',
  });

  actionCell.find('.btnDeleteComponent').tooltip({
    title: 'Delete',
    trigger: 'hover',
  });

  actionCell.find('.btnShowChildren').tooltip({
    title: 'Hide children',
    trigger: 'hover',
  });
}

function createChildrenRow(rowTemplate, parentRowId) {
  const parentRow = $(`#${parentRowId}`);
  const showChildren = parentRow.find('#actionCell').find('.btnShowChildren').attr('data-show-children');

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
    .each((i, row) => {
      $(row).find('#numberCell').text(i + 1);
    });
}

function btnCopyComponent_ClickHandler(btn) {
  const data = $(btn).parents('tr').data('componentData');
  fillFormWithData(data);
  $(btn).attr('title', 'Copied!')
    .attr('data-original-title', 'Copied!')
    .tooltip('update')
    .tooltip('show');
}



function btnEditComponent_ClickHandler(btn) {
  const data = $(btn).parents('tr').data('componentData');
  const rowId = $(btn).closest('tr').attr('id');

  $('#editComponentModal').modal('show');

  $('#editFormRow').val(rowId);

  fillEditFormWithData(data);

  $('frmEditComponent').on('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      return false;
    }
  });
}

function btnEditComponent_SaveHandler(event) {
  const rowId = $('#editFormRow').val();
  const targetRow = $(`#${rowId}`);

  const data = targetRow.data('componentData');

  const newData = { ...data };

  const componentNameCell = $(targetRow.find('td:eq(1)')[0]);
  const componentValueCell = $(targetRow.find('td:eq(3)')[0]);
  const componentCostCell = $(targetRow.find('td:eq(4)')[0]);
  const componentActivationTimeCell = $(targetRow.find('td:eq(5)')[0]);

  const newComponentName = $('#editFormComponentName').val();
  const newComponentValue = $('#editFormComponentValue').val();
  const newComponentCost = $('#editFormComponentCost').val();
  const newComponentActivationTime = $('#editFormComponentActivation').val();

  data.componentName = newComponentName;
  data.value = newComponentValue;
  data.cost = newComponentCost;
  data.activationTime = parseInt(newComponentActivationTime);

  $(componentNameCell).text(newComponentName);
  $(componentValueCell).text(newComponentValue);
  $(componentCostCell).text(newComponentCost);

  if (newComponentActivationTime == 0) {
    $(componentActivationTimeCell).text('Activated');
  } else {
    $(componentActivationTimeCell).text(newComponentActivationTime);
  }

  $('#editComponentModal').modal('hide');
}

function fillEditFormWithData(data) {
  $('#editFormComponentName').val(data.componentName);
  $('#editFormComponentCost').val(data.cost);
  $('#editFormComponentValue').val(data.value);
  $('#editFormComponentActivation').val(parseInt(data.activationTime));
}

function fillFormWithData(data) {
  $('#frmAddComponent').trigger('reset');
  if (data == null) {
    return;
  }
  const { componentTypeId } = data.componentType;
  const { facilityId } = data;

  $('#txtComponentName').val(data.componentName);
  $('#selComponentType').val(componentTypeId);
  $('#selComponentType').trigger('change');
  $('#selFacility').val(facilityId);

  if (componentTypeId == 3) {
    $('#txtValue').hide();
    $('#selResource').show();

    $('#selResource').val(data.value.resourceId);
  } else {
    $('#txtValue').show();
    $('#selResource').hide();

    $('#txtValue').val(data.value);
    if (componentTypeId == 2) {
      $('#txtValue').prop('disabled', 'disabled');
    } else {
      $('#txtValue').prop('disabled', false);
    }
  }

  if (facilityId != null) {
    $('#chkChild').attr('disabled', true);
    $('#componentParentField').hide();
    $('#selParent').val('');
  } else {
    $('#chkChild').attr('disabled', false);
    $('#selFacility').attr('disabled', false);
  }

  $('#nmbActivation').val(parseInt(data.activationTime));
}

function btnEditComponent_BlurHandler(btn) {
  $(btn).attr('title', 'Edit component')
    .attr('data-original-title', 'Edit Component')
    .tooltip('update')
    .tooltip('hide');
}
function btnCopyComponent_BlurHandler(btn) {
  $(btn).attr('title', 'Copy to form')
    .attr('data-original-title', 'Copy to form')
    .tooltip('update')
    .tooltip('hide');
}

function btnDeleteComponent_ClickHandler(btn) {
  const deletedRow = $(btn).parents('tr').attr('id');
  if (getOptions().fastDelete) {
    $(btn).tooltip('dispose');
    deleteComponent(deletedRow);
  } else {
    $('#btnConfirmDeleteComponent').data('deletedRow', deletedRow);
    $('#mdlDeleteComponent').modal('show');
  }
}

function btnConfirmDeleteComponent_ClickHandler(btn) {
  const deletedRowId = $(btn).data('deletedRow');
  deleteComponent(deletedRowId);
  $(btn).removeData('deletedRow');
}

function deleteComponent(deletedRowId) {
  const deletedRow = $('#componentTableContent').find(`tr#${deletedRowId}`);
  const data = deletedRow.data('componentData');

  deletedRow.remove();
  $(`.${deletedRowId}-child`).remove();

  $('#mdlDeleteComponent').modal('hide');
  indexComponentTable();
  updateSelParent(data, true);
  updateUnusedPopulation(data, true);
}

function btnShowChildren_ClickHandler(btn) {
  const parentRowId = $(btn).parents('tr').attr('id');
  const childrenRow = $(`.${parentRowId}-child`);
  childrenRow.toggleClass('show');

  // To toggle show children or not
  const showChildren = (parseInt($(btn).attr('data-show-children')) + 1) % 2;
  $(btn).attr('data-show-children', showChildren);

  const tooltipTitle = (showChildren === 1) ? 'Hide children' : `Show children (${childrenRow.length})`;
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

    const emptyTableAlert = $('#emptyTableTemplateAlert').clone().removeAttr('id');
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
  ComponentTypes.forEach((componentType) => {
    $(`#summary${componentType.componentTypeName}`).text(summary.ComponentType[i]);
    i++;
  });

  $('#mdlConfirmInsert').modal('show');
}

function getDataFromTable() {
  const data = [];
  $('#componentTableContent').children('tr').not('#componentTemplateRow').each((i, row) => {
    data.push($(row).data('componentData'));
  });
  return data;
}

function summariseData(data) {
  const summary = {
    Parent: 0,
    Children: 0,
    ComponentType: [
      // In order:
      // Population, Building, Resource, Food, Money, Special
      0, 0, 0, 0, 0, 0,
    ],
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
  $('#mdlConfirmInsert').on('hide.bs.modal', () => {
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
    'Resource:addResourceOK',
    'Resource:updateResourceAllOK',
    'Resource:deleteResourceByIdOk',
  ];
  resourceEvents.forEach((eventString) => {
    ipcRenderer.on(eventString, (e, res) => {
      if (res) {
        getResourceTiers();
      }
    });
  });
}

function pageRegion_eventHandler() {
  const facilityEvents = [
    'Facility:addFacilityOK',
    'Facility:updateFacilityOK',
    'Facility:deleteFacilityOK',
  ];
  facilityEvents.forEach((eventString) => {
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

  $('.to-top').on('click', () => {
    $('html').animate({ scrollTop: 0 }, 1000);
  });
}

function initAdditionalOptions() {
  $('#fastDeleteWrapper').tooltip({
    title: "Deleting a row won't show confirmation popup",
  });

  $('#toggleAddByTemplateWrapper').tooltip({
    title: 'If this option is checked, you can add components by template instead of using form',
  });
  $('#chkToggleAddByTemplate').on('change', chkToggleAddByTemplate_ChangeHandler);
}

function chkToggleAddByTemplate_ChangeHandler(e) {
  if (e.target.checked) {
    $('#frmAddByTemplate').show();
    $('#frmAddComponent').hide();
  } else {
    $('#frmAddByTemplate').hide();
    $('#frmAddComponent').show();
  }
}

function getOptions() {
  return {
    fastDelete: $('#chkFastDelete').is(':checked'),
  };
}
