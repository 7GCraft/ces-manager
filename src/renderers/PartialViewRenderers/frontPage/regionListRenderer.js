$(function () {
    //Get All regions by State ID
    getAllRegionsByStateId();
    // Get all states for state ddl
    region_getStateListForDropdown();
    //Add Region
    frmAddRegion_onSubmit();
})

function getAllRegionsByStateId() {
    $('#selState').empty();
    $('#selFirstState').empty();
    $('#selSecondState').empty();
    $('#selBiome').empty();
    $('#selDevelopment').empty();
    $('#selCorruption').empty();
    ipcRenderer.send('Region:getAllRegionsByStateId');
    ipcRenderer.once('Region:getAllRegionsByStateIdOK', (e, res) => {
        res.forEach(state => {
            if (Array.isArray(state.Regions) && state.Regions.length) {
                $('#listOfRegionsByState').append('<div class="regionContainer"><h5>' + state.stateName + '</h5><ul class="regionsList" id="StateRegion' + state.stateID + '"></ul></div>')

                state.Regions.forEach(region => {
                    $('#StateRegion' + state.stateID).append('<li class="individualRegion" id="Region' + region.RegionID + '"><a href=# onclick=openRegionPage(this.parentNode.getAttribute("id"))>' + region.RegionName + '</a><span class="totalIncome">' + region.RegionTotalIncome + '</span><span class="totalFood">' + region.RegionTotalFood + '</span></li>')
                });
            }
        });
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

        let isValid = true;
        const regionName = $('#txtRegionName').val();
        const population = $('#nmbPopulation').val();

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

        if (!isValid) {
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
                $('#regionListMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added region</div>')
                $('#listOfRegionsByState').empty();
                getAllRegionsByStateId();
            }
            else {
                $('#regionListMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding region</div>')
            }
            $('#mdlAddRegion').modal('toggle');
        });
    })
}

function openRegionPage(ID) {
    let regionID = ID.replace('Region', '');
    ipcRenderer.send('Region:openRegionPage', regionID);
}