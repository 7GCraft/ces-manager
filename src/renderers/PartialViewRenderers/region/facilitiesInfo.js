const FUNCTIONAL = 'functional';
const NON_FUNCTIONAL = 'non-functional';

$(() => {
  getFacilitiesInfo();

  getFacilityTemplate();

  addOpenCloseListListener();

  addNewFacilityListener();

  addDeleteListener();

  addFilterListener();
});

function getFacilitiesInfo() {
  const facilityIds = [];
  ipcRenderer.send('Facility:getFacilitiesByRegion', parseInt(window.process.argv.slice(-1)));
  ipcRenderer.once('Facility:getFacilitiesByRegionOK', (e, res) => {
    dataAvailable = true;
    if (res != null) {
      $('#facilityList').empty();
      const facilityFilter = $('input[name=functionalFacilitiesDisplay]:checked').val();

      if (facilityFilter === FUNCTIONAL) {
        res = res.filter((facility) => facility.isFunctional);
      } else if (facilityFilter === NON_FUNCTIONAL) {
        res = res.filter((facility) => !facility.isFunctional);
      }
      res = sortFacility([...res]);

      res.forEach((facility) => {
        const foodOutput = (facility.foodOutput == 0) ? '' : `<span class="valueFood">Food Output: ${facility.foodOutput}</span><br/>`;
        const moneyOutput = (facility.moneyOutput == 0) ? '' : `<span class="valueMoney">Money Output: ${facility.moneyOutput}</span><br/>`;
        const resource = (facility.resource == null) ? '' : `<span class="valueResource">Resource: ${facility.resource.ResourceName}</span><br/>`;

        const noOutput = (foodOutput == '' && moneyOutput == '' && resource == '') ? 'No Output for this facility<br/>' : '';
        $('#facilityList').append(
          `${'<div class="card">'
                    + '<div class="card-header" id="FacilityHeading'}${facility.facilityId}">`
                    + ' <h2 class="mb-0">'
                    + `<button id="btnFacility${facility.facilityId}" class="btn btn-link btnFacilityInfo collapsed" type="button" data-toggle="collapse" data-target="#FacilityCollapse${facility.facilityId}"" aria-expanded="false" aria-controls="FacilityCollapse${facility.facilityId}">${
                      facility.facilityName
                    }</button>&nbsp;`
                    + `<input type="textbox" id="txtUpdateFacility${facility.facilityId}" data-facility-id="${facility.facilityId
                    }" data-functional="${facility.isFunctional}" style="height: 25px; width:200px; font-size:16px;" onkeyup="if(event.keyCode === 13){updateFacilityName(this.id);}" >&nbsp;&nbsp;`
                    + `<input type="image" id="imgUpdateFacility${facility.facilityId}" src="../images/icons/edit.png" style="height: 15px; width:15px;" onclick=toggleUpdateFacilityNameTextbox(this.id)>`
                    + '</h2>'
                    + '</div>'
                    + `<div id="FacilityCollapse${facility.facilityId}" class="collapse" aria-labelledby="FacilityHeading${facility.facilityId}" data-parent="#facilityList">`
                    + '<div class="card-body">'
                    + '<div class="row">'
                    + `<div class="column" id="Facility${facility.facilityId}">${
                      foodOutput}${moneyOutput}${resource}${noOutput
                    }Functional:   <input type="checkbox" id="chkFunctional${facility.facilityId}" data-facility-name = "${facility.facilityName}" onclick=updateFunctional(this.id)><br/><br/>`
                    + '<button class="btn btn-danger" id="btnOpenDeleteFacility" data-toggle="modal" data-target="#mdlDeleteFacility" onclick="setFacilityIdForDelete(this.parentNode.id, true);">Delete Facility</button>&nbsp&nbsp'
                    + '<button class="btn btn-danger" id="btnOpenDeleteFacility" data-toggle="modal" data-target="#mdlDeleteFacility" onclick="setFacilityIdForDelete(this.parentNode.id, false);">Destroy Facility</button>'
                    + '</div>'
                    + `<div class="column"><ul  id="FacilityComponents${facility.facilityId}"></ul></div>`
                    + '</div>'
                    + '</div>'
                    + '</div>'
                    + '</div>',
        );

        $(`#txtUpdateFacility${facility.facilityId}`).hide();
        if (facility.isFunctional) {
          $(`#FacilityHeading${facility.facilityId}`).css('background-color', '#c9f0f2');
          $(`#chkFunctional${facility.facilityId}`).prop('checked', true);
        } else {
          $(`#FacilityHeading${facility.facilityId}`).css('background-color', '#f2c9c9');
          $(`#chkFunctional${facility.facilityId}`).prop('checked', false);
        }

        facilityIds.push(facility.facilityId);
      });
    }
  });

  ipcRenderer.send('Component:getComponentByFacilityId', parseInt(window.process.argv.slice(-1)));
  ipcRenderer.once('Component:getComponentByFacilityIdOK', (e, res) => {
    if (res != false) {
      res.forEach((components) => {
        if (components != null) {
          components.forEach((component) => {
            const facilityId = facilityIds.find((id) => id == component.facilityId);

            if (!component.isChild) {
              $(`#FacilityComponents${facilityId}`).append(`<li id="ComponentFacility${component.componentId}"><b>${component.componentName}</b></li>`);
            } else {
              $(`#ComponentFacility${component.parentId}`).append(`<ul><li id="ComponentFacility${component.componentId}"><b>${component.componentName}</b></li></ul>`);
            }
          });
        }
      });
    }
  });
  $('#btnCloseAllFacilities').hide();
}

function sortFacility(facility) {
  facility.sort((facilityA, facilityB) => {
    const nameA = facilityA.facilityName.toUpperCase();
    const nameB = facilityB.facilityName.toUpperCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return facility;
}

function getFacilityTemplate() {
  for (const template of facilityTemplates) {
    const templateOption = `
            <a class="dropdown-item" onclick="addTemplateToForm()" type="button" id="template-${template.name}">${template.name}</a>
            `;
    $('#facility-template-dropdown').append(templateOption);
  }
  $('#facility-template-dropdown a').on('click', function (e) {
    e.preventDefault();
    $('#txtFacilityName').val($(this).text());
    $('#chkFunctional').prop('checked', true);
  });
}

function addOpenCloseListListener() {
  $('#btnOpenAllFacilities').on('click', () => {
    $('#facilityList .collapse').removeAttr('data-parent');
    $('#facilityList .collapse').collapse('show');
    $('#btnCloseAllFacilities').show();
    $('#btnOpenAllFacilities').hide();
    $('.btnFacilityInfo').prop('disabled', true);
  });

  $('#btnCloseAllFacilities').on('click', (e) => {
    $('#facilityList .collapse').attr('data-parent', '#facilityList');
    $('#facilityList .collapse').collapse('hide');
    $('#btnCloseAllFacilities').hide();
    $('#btnOpenAllFacilities').show();
    $('.btnFacilityInfo').prop('disabled', false);
  });
}

function addNewFacilityListener() {
  $('#frmAddFacility').on('submit', (e) => {
    e.preventDefault();

    facilityObj = {};
    facilityObj.regionId = parseInt(window.process.argv.slice(-1));
    facilityObj.facilityName = $('#txtFacilityName').val();
    if ($('#chkFunctional').is(':checked')) {
      facilityObj.isFunctional = true;
    } else {
      facilityObj.isFunctional = false;
    }

    ipcRenderer.send('Facility:addFacility', facilityObj);
    ipcRenderer.once('Facility:addFacilityOK', (e, res) => {
      if (res) {
        alert('Successfully added facility');
        ipcRenderer.send('ReloadPageOnUpdate');
      } else {
        $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding facility</div>');
      }
    });
  });
}

function toggleUpdateFacilityNameTextbox(imgId) {
  facilityId = imgId.replace('imgUpdateFacility', '');
  $(`#txtUpdateFacility${facilityId}`).toggle();
}

function updateFacilityName(txtUpdateFacilityNameId) {
  const facilityId = txtUpdateFacilityNameId.replace('txtUpdateFacility', '');
  const facilityName = $(`#${txtUpdateFacilityNameId}`).val();
  const isFunctional = $(`#${txtUpdateFacilityNameId}`).data('functional');

  facilityObj = {};
  facilityObj.facilityId = facilityId;
  facilityObj.regionId = parseInt(window.process.argv.slice(-1));
  facilityObj.facilityName = facilityName;
  facilityObj.isFunctional = isFunctional;

  ipcRenderer.send('Facility:updateFacility', facilityObj);
  ipcRenderer.once('Facility:updateFacilityOK', (e, res) => {
    if (res) {
      $(`#btnFacility${facilityId}`).text(facilityName);

      $(`#txtUpdateFacility${facilityId}`).hide();
      $(`#txtUpdateFacility${facilityId}`).val('');
    } else {
      $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating facility</div>');
    }
  });
}

function updateFunctional(checkFunctionalId) {
  const facilityId = checkFunctionalId.replace('chkFunctional', '');
  const facilityName = $(`#${checkFunctionalId}`).data('facilityName');
  const isFunctional = !!($(`#${checkFunctionalId}`).is(':checked'));

  facilityObj = {};
  facilityObj.facilityId = facilityId;
  facilityObj.regionId = parseInt(window.process.argv.slice(-1));
  facilityObj.facilityName = facilityName;
  facilityObj.isFunctional = isFunctional;

  ipcRenderer.send('Facility:updateFacility', facilityObj);
  ipcRenderer.once('Facility:updateFacilityOK', (e, res) => {
    if (res) {
      if (isFunctional) {
        $(`#FacilityHeading${facilityId}`).css('background-color', '#c9f0f2');
      } else {
        $(`#FacilityHeading${facilityId}`).css('background-color', '#f2c9c9');
      }

      getRegionInfo(false);
    } else {
      $('#regionMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating facility</div>');
    }
  });
}

function setFacilityIdForDelete(facilityId, deleteOnly) {
  console.log(facilityId);
  $('#btnDeleteFacility').attr('data-facility-id', facilityId);

  if (deleteOnly) {
    $('#btnDeleteFacility').attr('data-delete-only', true);
  } else {
    $('#btnDeleteFacility').attr('data-delete-only', false);
  }
}

function addDeleteListener() {
  $('#btnDeleteFacility').on('click', (e) => {
    e.preventDefault();
    const facilityId = $('#btnDeleteFacility').data('facilityId').replace('Facility', '');
    const deleteOnly = $('#btnDeleteFacility').data('deleteOnly');

    const args = { facilityId, deleteOnly };

    ipcRenderer.send('Facility:deleteFacility', args);
    ipcRenderer.once('Facility:deleteFacilityOK', (e, res) => {
      if (res) {
        alert('Successfully deleted facility');
        ipcRenderer.send('ReloadPageOnUpdate');
      } else {
        $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting facility</div>');
      }
      $('#mdlDeleteFacility').modal('toggle');
    });
  });
}

function addFilterListener() {
  $('input[type=radio][name=functionalFacilitiesDisplay]').on('change', (e) => {
    e.preventDefault();
    getFacilitiesInfo();
  });
}
