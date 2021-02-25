$(function () {
    //Get all region info
    getRegionInfo(true);
    //update region
    frmUpdateRegion_onSubmit();
    //delete region
    btnDeleteRegion_onClick();
});

function getRegionInfo(initial) {
    if (initial) {
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

    ipcRenderer.send('Region:getRegionInfo', parseInt(window.process.argv.slice(-1)));
    ipcRenderer.once('Region:getRegionInfoOK', (e, res) => {
        $('#lblRegionName').text(res.regionName);
        $('#lblDescription').text(res.desc);
        $('#lblBiome').text(res.biome.biomeName)
        $('#lblOwner').text(res.state.stateName);
        $('#lblPopulation').text(res.population);
        $('#lblUsedPopulation').text(res.usedPopulation);
        $('#lblTaxRate').text(res.taxRate * 100 + '%');
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

        $('#lblResourcesProduced').empty();

        if (res.productiveResources.length > 0) {
            res.productiveResources.forEach(resource => {
                $('#lblResourcesProduced').append(resource.ResourceName + ', ')
            });
            var strResource = $('#lblResourcesProduced').text().slice(0, -2);
            $('#lblResourcesProduced').text(strResource);
        }
        else {
            $('#lblResourcesProduced').text("NONE");
        }

        $('#txtRegionName').val(res.regionName);
        $('#selState').val(res.state.stateID)
        $('#selCorruption').val(res.corruption.corruptionId)
        $('#selBiome').val(res.biome.biomeId)
        $('#selDevelopment').val(res.development.developmentId)
        $('#nmbPopulation').val(res.population);
        $('#nmbTaxRate').val(res.taxRate);
        $('#txtDescRegion').val(res.desc);
        $('#hdnUnusedPopulation').val(res.population - res.usedPopulation);
    });
}

function frmUpdateRegion_onSubmit() {
    $('#frmUpdateRegion').on('submit', function (e) {
        e.preventDefault();

        let regionObj = {};

        regionObj['regionId'] = parseInt(window.process.argv.slice(-1));
        regionObj['regionName'] = $('#txtRegionName').val();
        regionObj['state'] = { 'stateId': parseInt($('#selState').val()) };
        regionObj['corruption'] = { 'corruptionId': parseInt($('#selCorruption').val()) };
        regionObj['biome'] = { 'biomeId': parseInt($('#selBiome').val()) };
        regionObj['development'] = { 'developmentId': parseInt($('#selDevelopment').val()) };
        regionObj['population'] = parseInt($('#nmbPopulation').val());
        regionObj['desc'] = $('#txtDescRegion').val();
        regionObj['taxRate'] = parseFloat($('#nmbTaxRate').val());

        ipcRenderer.send('Region:updateRegion', regionObj);
        ipcRenderer.once('Region:updateRegionOK', (e, res) => {
            if (res) {
                alert("Successfully updated region");
                ipcRenderer.send("ReloadPageOnUpdate");
            }
            else {
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
            if (res) {
                alert("Successfully deleted region");
                ipcRenderer.send("ClosePageOnDelete");
            }
            else {
                $('#stateMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting region</div>')
            }

            $('#mdlDeleteRegion').modal('toggle');
        });
    })
}