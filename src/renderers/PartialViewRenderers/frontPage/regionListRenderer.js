$(function () {
    //Get All regions by State ID
    getAllRegionsByStateId();
    // Get all states for state ddl
    region_getStateListForDropdown();
    //Add Region
    frmAddRegion_onSubmit();
    //Handle events from region page
    region_pageRegion_eventHandler();
    //Handle events from state page
    region_pageState_eventHandler();
    //Handle events from front page that is not in regionList view
    region_pageFront_eventHandler()
});

//helper functions
function getPopulationCap(developmentId){
    switch(developmentId){
        case 1:
            return 10;
        case 2:
            return 20;
        case 3:
            return 40;
        case 4:
            return 60;
        case 5:
            return 80;
        case 6:
            return 100;
    }
}

function getAllRegionsByStateId() {
    $('#selState').empty();
    $('#selBiome').empty();
    $('#selDevelopment').empty();
    $('#selCorruption').empty();
    ipcRenderer.send('Region:getAllRegionsByStateId');
    ipcRenderer.on('Region:getAllRegionsByStateIdOK', (e, res) => {
        if (Array.isArray(res) && res.length) {
            $('#listOfRegionsByState').empty();
            res.forEach(state => {
                if (Array.isArray(state.Regions) && state.Regions.length) {
                    $('#listOfRegionsByState').append('<div class="regionContainer"><h5>' + state.stateName + '</h5><ul class="regionsList" id="StateRegion' + state.stateID + '"></ul></div>')
                    state.Regions.forEach(region => {
                        PopulationCap = getPopulationCap(region.DevelopmentId);
                        $('#StateRegion' + state.stateID).append('<li class="individualRegion" id="Region' + region.RegionID + '"><a href=# onclick=openRegionPage(this.parentNode.getAttribute("id"))>' + region.RegionName + '</a><span class="totalIncome">' + region.RegionTotalIncome + '</span><span class="totalFood">' + region.RegionTotalFood + '</span><span class="population">' + region.Population + ' / ' + PopulationCap + '</span></li>')
                    });
                }
            });
        }
    });

    ipcRenderer.send('Region:getBiomesForAdd');
    ipcRenderer.once('Region:getBiomesForAddOK', (e, res) => {
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
}

function region_getStateListForDropdown() {
    ipcRenderer.send('State:getStateList');
    ipcRenderer.once('State:getStateListOK', function (e, res) {
        $('#selState').empty();
        res.forEach(state => {
            $('#selState').append($('<option>', {
                value: state.stateID,
                text: state.stateName
            }));
        });
    });
}

function frmAddRegion_onSubmit() {
    $('#frmAddRegion').on('submit', (e) => {
        e.preventDefault();

        let regionObj = {};

        if (!validateRegionForm()) {
            return;
        }

        regionObj['regionName'] = $('#txtRegionName').val();
        regionObj['state'] = { 'stateId': parseInt($('#selState').val()) };
        regionObj['corruption'] = { 'corruptionId': parseInt($('#selCorruption').val()) };
        regionObj['biome'] = { 'biomeId': parseInt($('#selBiome').val()) };
        regionObj['development'] = { 'developmentId': parseInt($('#selDevelopment').val()) };
        regionObj['population'] = parseInt($('#nmbPopulation').val());
        regionObj['desc'] = $('#txtDescRegion').val();
        regionObj['taxRate'] = parseFloat($('#nmbTaxRate').val());

        ipcRenderer.send('Region:addRegion', regionObj);
        ipcRenderer.once('Region:addRegionOK', (e, res) => {
            if (res) {
                $('#regionListMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added region</div>');
                getAllRegionsByStateId();
                region_getStateListForDropdown();
            }
            else {
                $('#regionListMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding region</div>')
            }
            $('#mdlAddRegion').modal('toggle');
            resetRegionForm();
        });
    })
}

function validateRegionForm() {
    let isValid = true;
    const regionName = $('#txtRegionName').val();
    const population = $('#nmbPopulation').val();
    const taxRate = $('#nmbTaxRate').val();

    if (regionName == null || regionName == '') {
        isValid = false;
        $('#txtRegionName').addClass('is-invalid');
    }
    else {
        $('#txtRegionName').removeClass('is-invalid');
    }

    if (population == null || population == '') {
        isValid = false;
        $('#nmbPopulation').addClass('is-invalid');
        $('#nmbPopulationMessage').text('Population cannot be empty');
    }
    else if (parseInt(population) <= 0) {
        isValid = false;
        $('#nmbPopulation').addClass('is-invalid');
        $('#nmbPopulationMessage').text('Population cannot be less or equal to zero');
    }
    else {
        $('#nmbPopulation').removeClass('is-invalid');
    }

    if (taxRate == null || taxRate == '') {
        isValid = false;
        $('#nmbTaxRate').addClass('is-invalid');
        $('#nmbTaxRateMessage').text('Tax Rate cannot be empty');
    }
    else if (parseFloat(taxRate) < 0) {
        isValid = false;
        $('#nmbTaxRate').addClass('is-invalid');
        $('#nmbTaxRateMessage').text('Tax Rate cannot be less than zero');
    }
    else {
        $('#nmbTaxRate').removeClass('is-invalid');
    }

    return isValid;
}

function resetRegionForm() {
    const regionForm = document.getElementById('frmAddRegion');
    regionForm.reset();
    resetRegionFormValidation();
}

function resetRegionFormValidation() {
    $('#txtRegionName').removeClass('is-invalid');
    $('#nmbPopulation').removeClass('is-invalid');
    $('#nmbTaxRate').removeClass('is-invalid');
}

function openRegionPage(ID) {
    let regionID = ID.replace('Region', '');
    ipcRenderer.send('Region:openRegionPage', regionID);
}

function region_pageRegion_eventHandler() {
    ipcRenderer.on('Region:updateRegionOK', region_pageRegion_onUpdate);
    ipcRenderer.on('Region:deleteRegionOK', (e, res) => {
        if (res) {
            alert('A Region has been deleted!');
            getAllRegionsByStateId();
        }
    });
    ipcRenderer.on('Facility:updateFacilityOK', region_pageRegion_onUpdate);
    ipcRenderer.on('Facility:deleteFacilityOK', region_pageRegion_onUpdate);
    ipcRenderer.on('Component:addComponentOK', region_pageRegion_onUpdate);
    ipcRenderer.on('Component:updateComponentOK', region_pageRegion_onUpdate);
    ipcRenderer.on('Component:deleteComponentOK', region_pageRegion_onUpdate);
}

function region_pageRegion_onUpdate(e, res) {
    if (res) {
        getAllRegionsByStateId();
    }
}

function region_pageState_eventHandler() {
    ipcRenderer.on('State:updateStateOK', (e, res) => {
        if (res) {
            region_getStateListForDropdown();
            getAllRegionsByStateId();
        }
    });
    ipcRenderer.on('State:deleteStateOK', (e, res) => {
        if (res) {
            region_getStateListForDropdown();
            getAllRegionsByStateId();
        }
    });
}

function region_pageFront_eventHandler() {
    ipcRenderer.on('State:addStateOK', (e, res) => {
        if (res) {
            region_getStateListForDropdown();
            getAllRegionsByStateId();
        }
    });
}