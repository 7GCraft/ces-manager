const config = require('./config.json');
const constants = config.constants;
const dbContext = require('../repository/DbContext');
const knex = dbContext.getKnexObject();

const Season = require(config.paths.seasonModel);

const stateServices = require(config.paths.stateServices);
const regionServices = require(config.paths.regionServices);
const tradeAgreementServices = require(config.paths.tradeAgreementServices);
const facility = require('./facilityServices'); 

const excel = require('exceljs')

//helper functions
function getPopulationCap(developmentId) {
    switch (developmentId) {
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

/**
 * Advances the economy by one season.
 * Calculates the change in income and population of each state and region.
 * @returns {Boolean} true if successful, false otherwise.
 */
const advanceSeason = async () => {
    let resStatus = true;

    const states = await stateServices.getStateAll();

    if (states === null) resStatus = false;

    for (let state of states) {
        let seasonalIncome = state.TotalIncome;

        let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

        if (tradeAgreements != null) {
            for (let tradeAgreement of tradeAgreements) {
                for (let trader of tradeAgreement.traders) {
                    if (trader.state.stateID === state.stateID) {
                        seasonalIncome += trader.tradeValue;
                    }
                }
            }
        }

        let adminCost = await stateServices.getAdminCostByStateId(state.stateID);
        if (adminCost === -1) adminCost = 0;

        seasonalIncome -= state.expenses + adminCost;

        await stateServices.updateStateTreasuryByStateId(state.stateID, state.treasuryAmt + seasonalIncome);

        let stateRegions = state.regions;

        for (let stateRegion of stateRegions) {
            stateRegion.calculateGrowth(state.BaseGrowth, stateRegions.length);
            await regionServices.updateRegionPopulation(stateRegion);
        }
    }

    resStatus = await reduceActivationTimeAll();

    let currSeason = await getCurrentSeason();

    let season = '';
    let year = currSeason.year;
    const prevSeasonYear = [currSeason.season, currSeason.year];

    switch (currSeason.season) {
        case 'Spring':
            season = 'Summer';
            break;
        case 'Summer':
            season = 'Autumn';
            break;
        case 'Autumn':
            season = 'Winter';
            break;
        case 'Winter':
            season = 'Spring';
            year++;
            break;
    }

    await knex
        .insert({
            season: season,
            year: year
        })
        .into(constants.TABLE_SEASON)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    const advancedStates= await stateServices.getStateAll();
    const currSeasonYear = [season, year];
    
    resStatus = exportToExcel(states, advancedStates, prevSeasonYear, currSeasonYear)
    return resStatus;
};

const advanceSeasonByStateId = async (id) => {
    let resStatus = true;

    const state = await stateServices.getStateById(id);

    if (state === null) resStatus = false;

    let seasonalIncome = state.TotalIncome;

    let tradeAgreements = await tradeAgreementServices.getTradeAgreementByStateId(state.stateID);

    if (tradeAgreements != null) {
        for (let tradeAgreement of tradeAgreements) {
            for (let trader of tradeAgreement.traders) {
                if (trader.state.stateID === state.stateID) {
                    seasonalIncome += trader.tradeValue;
                }
            }
        }
    }

    let adminCost = await stateServices.getAdminCostByStateId(state.stateID);
    if (adminCost === -1) adminCost = 0;

    seasonalIncome -= state.expenses + adminCost;

    await stateServices.updateStateTreasuryByStateId(state.stateID, state.treasuryAmt + seasonalIncome);

    let stateRegions = state.regions;

    for (let stateRegion of stateRegions) {
        stateRegion.calculateGrowth(state.BaseGrowth, stateRegions.length);
        await regionServices.updateRegionPopulation(stateRegion);
    }

    return resStatus;
};

/**
 * Reduces the activation time of all components by 1 if it's not 0.
 * @returns {Boolean} true if successful, false otherwise.
 */
const reduceActivationTimeAll = async () => {
    let resStatus = true;

    await knex(constants.TABLE_COMPONENT)
        .where(constants.COLUMN_ACTIVATION_TIME, '>', 0)
        .decrement(constants.COLUMN_ACTIVATION_TIME, 1)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

/**
 * Gets the current season.
 * @returns {Season} season object if successful, null otherwise.
 */
const getCurrentSeason = async () => {
    let rawSeason = await knex
        .select('*')
        .from(constants.TABLE_SEASON)
        .orderBy(constants.COLUMN_SEASON_ID, 'desc')
        .limit(1)
        .catch(e => console.error(e));
    
    if (rawSeason.length === 0) return null;

    rawSeason = rawSeason[0];

    let season = new Season(rawSeason.season, rawSeason.year);

    return season;
}

const exportToExcel = async (initialState, updatedState, prevSeasonYear, currSeasonYear) => {
    let resStatus = true;
    const workbook = new excel.Workbook();
    let stateInfoRowNames = [
        'Treasury',
        'Total Income',
        'Military, Diplomatic, & Misc. Expenses',
        'Administration Cost',
        'Admin Region Cost Modifier',
        'Total Expenses ',
        'Total Food Produced',
        'Total Food Consumed',
        'Total Food Available',
        'Total Population',
        'Average Dev Level',
        'Facility Count',
        'Next Season Income',

    ]
    let initialStateInfo = [];
    let updatedStateInfo = [];
    try{
        for(let i = 0; i < initialState.length; i++){
            let sheet = workbook.addWorksheet(initialState[i].stateName);
            sheet.columns = [
                {key: 'stateInfoNames', width: 42.5, style: { font: { name: 'Calibri' }}},
                {key: 'initialStateInfo', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'to_state', width: 5, style: { font: { name: 'Calibri' }}},
                {key: 'updatedStateInfo', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'empty_1', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'empty_2', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'regionName', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'regionIncome', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'foodProduced', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'populationUsed', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'currPopulation', width: 10, style: { font: { name: 'Calibri' }}},
                {key: 'maxPopulation', width: 10, style: { font: { name: 'Calibri' }}},
            ]
            let facilityCount = await facility.getFacilityCountByStateId(updatedState[i].stateID)
            let adminCost = await stateServices.getAdminCostByStateId(updatedState[i].stateID);
            let updatedTotalExpenses = parseFloat(parseFloat(adminCost).toFixed(2) + parseFloat(updatedState[i].expenses).toFixed(2)).toFixed(2);
            let updatedExpectedIncome = parseFloat(parseFloat(updatedState[i].TotalIncome).toFixed(2) - parseFloat(updatedState[i].expenses).toFixed(2) - parseFloat(adminCost).toFixed(2)).toFixed(2);

            initialStateInfo = [
                initialState[i].treasuryAmt,
                initialState[i].TotalIncome,
                'N/A',
                'N/A',
                'N/A',
                'N/A',
                initialState[i].TotalFoodProduced,
                initialState[i].TotalFoodConsumed,
                initialState[i].TotalFoodAvailable,
                initialState[i].TotalPopulation,
                'N/A',
                'N/A',
                'N/A',
            ]
            updatedStateInfo = [
                updatedState[i].treasuryAmt,
                updatedState[i].TotalIncome,
                updatedState[i].expenses,
                adminCost,
                updatedState[i].adminRegionModifier * 100 + '%',
                updatedTotalExpenses,
                updatedState[i].TotalFoodProduced,
                updatedState[i].TotalFoodConsumed,
                updatedState[i].TotalFoodAvailable,
                updatedState[i].TotalPopulation,
                updatedState[i].AvgDevLevel,
                facilityCount,
                updatedExpectedIncome,
            ]
            //Make title for each sheet with stylings
            sheet.mergeCells('A1:J3');
            sheet.getCell('A1').value = initialState[i].stateName;
            sheet.getCell('A1').font = {name: 'Georgia Pro Black', size: 24};
            sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }; sheet.getCell('A1').fill = {
                type: 'gradient',
                gradient: 'angle',
                degree: 0,
                stops: [
                    {position:0, color:{argb:'C85C5C'}},
                    {position:0.5, color:{argb:'F9975D'}},
                    {position:1, color:{argb:'C85C5C'}}
                ]
            };

            sheet.mergeCells('A4:J4')
            sheet.getCell('A4').value = prevSeasonYear[0] + ' ' + prevSeasonYear[1] + ' to ' + currSeasonYear[0] + ' '  + currSeasonYear[1];
            sheet.getCell('A4').font = {name: 'Georgia Pro Black', size: 14};
            sheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
            sheet.getCell('A4').fill = {
                type: 'gradient',
                gradient: 'angle',
                degree: 0,
                stops: [
                    {position:0, color:{argb:'C85C5C'}},
                    {position:0.5, color:{argb:'F9975D'}},
                    {position:1, color:{argb:'C85C5C'}}
                ]
            };

            sheet.mergeCells('A6:D6');
            sheet.getCell('A6').value = 'General State Info';
            sheet.getCell('A6').font = {name: 'Georgia Pro Black', size: 14};
            sheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };
            sheet.getCell('A6').fill = {
                type: 'gradient',
                gradient: 'angle',
                degree: 0,
                stops: [
                    {position:0, color:{argb:'C85C5C'}},
                    {position:0.5, color:{argb:'F9975D'}},
                    {position:1, color:{argb:'C85C5C'}}
                ]
            };

            sheet.mergeCells('G6:L6');
            sheet.getCell('G6').value = 'Region Info';
            sheet.getCell('G6').font = {name: 'Georgia Pro Black', size: 14};
            sheet.getCell('G6').alignment = { vertical: 'middle', horizontal: 'center' };
            sheet.getCell('G6').fill = {
                type: 'gradient',
                gradient: 'angle',
                degree: 0,
                stops: [
                    {position:0, color:{argb:'C85C5C'}},
                    {position:0.5, color:{argb:'F9975D'}},
                    {position:1, color:{argb:'C85C5C'}}
                ]
            };
            let increment = 0;
            for(let j = 0; j < stateInfoRowNames.length; j++){
                sheet.getCell('A'+ (7 + increment).toString()).value = stateInfoRowNames[j];
                sheet.getCell('B'+ (7 + increment).toString()).value = initialStateInfo[j];
                sheet.getCell('C'+ (7 + increment).toString()).value = 'to';
                sheet.getCell('D'+ (7 + increment).toString()).value = updatedStateInfo[j];

                increment += 1;
            }

            increment = 0;
            updatedState[i].regions.forEach(region => {
                sheet.getCell('G'+ (7 + increment).toString()).value = region.regionName;
                sheet.getCell('H'+ (7 + increment).toString()).value = region.totalIncome;
                sheet.getCell('I'+ (7 + increment).toString()).value = region.totalFoodAvailable;
                sheet.getCell('J'+ (7 + increment).toString()).value = region.usedPopulation;
                sheet.getCell('K'+ (7 + increment).toString()).value = region.population;
                sheet.getCell('L'+ (7 + increment).toString()).value = getPopulationCap(region.development.developmentId);
                increment += 1;
            });
            
        }

        workbook.xlsx.writeFile("report_"+prevSeasonYear[0]+prevSeasonYear[1]+"-"+currSeasonYear[0]+currSeasonYear[1]+".xlsx");
        return resStatus;
    }
    catch(e){
        console.error(e);
        resStatus = false;
        return resStatus;
    }
}

exports.advanceSeason = advanceSeason;
exports.getCurrentSeason = getCurrentSeason;

advanceSeason();