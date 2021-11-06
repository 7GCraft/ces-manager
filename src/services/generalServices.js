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
            ]
            let facilityCount = await facility.getFacilityCountByStateId(initialState[i].stateID)
            console.log(initialState[i].adminCost)
            console.log(updatedState[i].adminCost)
            console.log(initialState[i].expenses)
            console.log(updatedState[i].expenses)
            let initialTotalExpenses =  (parseFloat(initialState[i].adminCost).toFixed(2) + parseFloat(initialState[i].expenses).toFixed(2)).toString();
            let updatedTotalExpenses = (parseFloat(updatedState[i].adminCost).toFixed(2) + parseFloat(updatedState[i].expenses).toFixed(2)).toString();
            let initialExpectedIncome = (parseFloat(initialState[i].TotalIncome).toFixed(2) - parseFloat(initialState[i].expenses).toFixed(2) - parseFloat(initialState[i].adminCost).toFixed(2)).toString();
            let updatedExpectedIncome = (parseFloat(updatedState[i].TotalIncome).toFixed(2) - parseFloat(updatedState[i].expenses).toFixed(2) - parseFloat(updatedState[i].adminCost).toFixed(2)).toString();

            initialStateInfo = [
                initialState[i].treasuryAmt,
                initialState[i].TotalIncome,
                initialState[i].expenses,
                initialState[i].adminCost,
                initialState[i].adminRegionModifier * 100 + '%',
                initialTotalExpenses,
                initialState[i].TotalFoodProduced,
                initialState[i].TotalFoodConsumed,
                initialState[i].TotalFoodAvailable,
                initialState[i].TotalPopulation,
                initialState[i].AvgDevLevel,
                '',
                initialExpectedIncome,
            ]
            updatedStateInfo = [
                updatedState[i].treasuryAmt,
                updatedState[i].TotalIncome,
                updatedState[i].expenses,
                updatedState[i].adminCost,
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
                    {position:0, color:{argb:'71C9CE'}},
                    {position:0.5, color:{argb:'A6E3E9'}},
                    {position:1, color:{argb:'71C9CE'}}
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
                    {position:0, color:{argb:'E3FDFD'}},
                    {position:0.5, color:{argb:'CBF1F5'}},
                    {position:1, color:{argb:'A6E3E9'}}
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
            for(let j = 0; j < stateInfoRowNames.length; j++){
                sheet.addRow({
                    stateInfoNames: stateInfoRowNames[j],
                    initialStateInfo : initialStateInfo[j],
                    to_state : 'to',
                    updatedStateInfo : updatedStateInfo[j]
                })
            }
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