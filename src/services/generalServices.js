const config = require('./config.json');
const constants = config.constants;
const dbContext = require('../repository/DbContext');
const knex = dbContext.getKnexObject();

const Season = require(config.paths.seasonModel);

const stateServices = require(config.paths.stateServices);
const regionServices = require(config.paths.regionServices);
const tradeAgreementServices = require(config.paths.tradeAgreementServices);
const facility = require('./facilityServices');

const formulaHelper = require(config.paths.formulaHelper);

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

        // if (tradeAgreements != null) {
        //     for (let tradeAgreement of tradeAgreements) {
        //         for (let trader of tradeAgreement.traders) {
        //             if (trader.state.stateID === state.stateID) {
        //                 seasonalIncome += trader.tradeValue;
        //             }
        //         }
        //     }
        // }

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
    
    let buffer = exportToExcel(states, advancedStates, prevSeasonYear, currSeasonYear)
    if(!resStatus){
        return resStatus;
    }
    else{
        return buffer;
    }
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


const initializeExcelColumns = async () => {
    return [
        {key: 'stateInfoNames', width: 42.5, style: { font: { name: 'Calibri' }}},
        {key: 'initialStateInfo', width: 10, style: { font: { name: 'Calibri' }}},
        {key: 'to_state', width: 10, style: { font: { name: 'Calibri' }}},
        {key: 'updatedStateInfo', width: 10, style: { font: { name: 'Calibri' }, alignment: {vertical: 'bottom', horizontal: 'right'}}},
        {key: 'empty_1', width: 10, style: { font: { name: 'Calibri' }}},
        {key: 'empty_2', width: 10, style: { font: { name: 'Calibri' }}},
        {key: 'regionName', width: 25, style: { font: { name: 'Calibri' }}},
        {key: 'regionIncome', width: 25, style: { font: { name: 'Calibri' }, alignment: {vertical: 'bottom', horizontal: 'right'}}},
        {key: 'foodProduced', width: 25, style: { font: { name: 'Calibri' }}},
        {key: 'populationUsed', width: 25, style: { font: { name: 'Calibri' }}},
        {key: 'currPopulation', width: 25, style: { font: { name: 'Calibri' }, alignment: {vertical: 'bottom', horizontal: 'right'}}},
        {key: 'maxPopulation', width: 25, style: { font: { name: 'Calibri' }}},
    ];
};


const populateStateInfo = async(initialState, updatedState, i) => {
    let initialStateInfo = [];
    let updatedStateInfo = [];
    let facilityCount = await facility.getFacilityCountByStateId(updatedState[i].stateID)
    let adminCost = await stateServices.getAdminCostByStateId(updatedState[i].stateID);
    let updatedExpectedIncome = parseFloat(parseFloat(updatedState[i].TotalIncome).toFixed(2) - parseFloat(updatedState[i].expenses).toFixed(2) - parseFloat(adminCost).toFixed(2)).toFixed(2);

    initialStateInfo = [
        initialState[i].treasuryAmt,
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'N/A',
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
        adminCost + updatedState[i].expenses,
        updatedState[i].TotalFoodProduced,
        updatedState[i].TotalFoodConsumed,
        updatedState[i].TotalFoodAvailable,
        updatedState[i].TotalPopulation,
        updatedState[i].AvgDevLevel,
        facilityCount,
        updatedExpectedIncome,
    ]

    return [initialStateInfo, updatedStateInfo];
}

const reformatStateResources = async (updatedState, i) => {
    let stateResources = [];
    updatedState[i].ProductiveResources.map(resource => {
        resourceIdx = stateResources.findIndex(obj => obj.name == resource.ResourceName);
        if(resourceIdx >= 0){
            stateResources[resourceIdx].count += 1;
        }
        else{
            stateResources.push({'name': resource.ResourceName, 'tier': resource.ResourceTierID, 'count' : 1})
        }
    });

    stateResources.sort((a, b) => {
        return a.tier - b.tier || a.name.localeCompare(b.name)
    });

    return stateResources;
}

const reformatTradeAgreements = async(tradeAgreements, initialState, i) => {
    let stateTradeAgreements = [];

    tradeAgreements.map(agreement => {
        let traderIdx = agreement.traders.findIndex(obj => obj.state.stateID == initialState[i].stateID);
        if (traderIdx > -1){
            stateTradeAgreements.push({'partnerState':(traderIdx == 0) ? agreement.traders[1].state.stateName : agreement.traders[0].state.stateName, 'tradePower': parseFloat(agreement.traders[traderIdx].tradePower * 100).toFixed(2) + '%', 'tradeValue': agreement.traders[traderIdx].tradeValue })
        }
    });

    return stateTradeAgreements;
}

const formatCell = async(sheet, baseCell, targetCell, value, cellColor) => {
    sheet.mergeCells(baseCell+':'+targetCell);
    sheet.getCell(baseCell).value = value;
    sheet.getCell(baseCell).font = {name: 'Calibri', size: 24, bold: true};
    sheet.getCell(baseCell).alignment = { vertical: 'middle', horizontal: 'center' }; 
    sheet.getCell(baseCell).fill = {
        type: 'gradient',
        gradient: 'angle',
        degree: 0,
        stops: [
            {position:0, color:{argb:cellColor[0]}},
            {position:0.5, color:{argb:cellColor[1]}},
            {position:1, color:{argb:cellColor[2]}}
        ]
    };
    sheet.getCell(baseCell).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
    };
}


/**
 * Exports seasonal report to excel. Called from advanceSeason()
 * @returns {Boolean} true if successful, false otherwise.
 */

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
        const RED = 'C85C5C';
        const ORANGE = 'F9975D'
        const LIGHT_BLUE = '96C8FB'
        const tradeAgreements = await tradeAgreementServices.getTradeAgreementAll();
        for(let i = 0; i < initialState.length; i++){
            let sheet = workbook.addWorksheet(initialState[i].stateName);
            sheet.columns = await initializeExcelColumns();

            let stateInfos = await populateStateInfo(initialState, updatedState, i)
            initialStateInfo = stateInfos[0];
            updatedStateInfo = stateInfos[1];

            //Make title for each sheet with stylings
            await formatCell(sheet, 'A1', 'L3', initialState[i].stateName, [RED,ORANGE,RED])
            await formatCell(sheet, 'A4', 'L4', prevSeasonYear[0] + ' ' + prevSeasonYear[1] + ' to ' + currSeasonYear[0] + ' '  + currSeasonYear[1], [LIGHT_BLUE,LIGHT_BLUE,LIGHT_BLUE])
            await formatCell(sheet, 'A6', 'D6', 'General State Info', [RED,ORANGE,RED])
            await formatCell(sheet, 'G6', 'L6', 'Region Info', [RED,ORANGE,RED])

            let increment = 0;
            sheet.getCell('A'+ (7 + increment).toString()).value = stateInfoRowNames[0];
            sheet.getCell('B'+ (7 + increment).toString()).value = initialStateInfo[0];
            sheet.getCell('C'+ (7 + increment).toString()).value = 'to';
            sheet.getCell('D'+ (7 + increment).toString()).value = updatedStateInfo[0];
            increment += 1;

            for(let j = 1; j < stateInfoRowNames.length; j++){
                sheet.getCell('A'+ (7 + increment).toString()).value = stateInfoRowNames[j];
                sheet.getCell('B'+ (7 + increment).toString()).value = initialStateInfo[j];
                sheet.getCell('C'+ (7 + increment).toString()).value = 'to';
                sheet.getCell('D'+ (7 + increment).toString()).value = updatedStateInfo[j];

                increment += 1;
            }

            increment = 0;
            sheet.getCell('G7').value = "Region Name";
            sheet.getCell('H7').value = "Total Income";
            sheet.getCell('I7').value = "Total Food Available";
            sheet.getCell('J7').value = "Used Population";
            sheet.getCell('K7').value = "Current Population";
            sheet.getCell('L7').value = "Population Cap";
            ['G7',
            'H7',
            'I7',
            'J7',
            'K7',
            'L7',
            ].map(key => {
                sheet.getCell(key).fill ={
                    type: 'pattern',
                    pattern: 'lightVertical',
                    fgColor: { argb: LIGHT_BLUE },
                    bgColor: { argb: LIGHT_BLUE }
                }
                sheet.getCell(key).font ={
                    name: 'Calibri',
                    size: 14,
                    bold: true
                }
                
                sheet.getCell(key).border = {
                    top: {style:'thin'},
                    left: {style:'thin'},
                    bottom: {style:'thin'},
                    right: {style:'thin'}
                };
            })

            for(let j = 0; j < updatedState[i].regions.length; j++){
                sheet.getCell('G'+ (8 + increment).toString()).value = updatedState[i].regions[j].regionName;
                sheet.getCell('H'+ (8 + increment).toString()).value = updatedState[i].regions[j].totalIncome;
                sheet.getCell('I'+ (8 + increment).toString()).value = updatedState[i].regions[j].totalFoodAvailable;
                sheet.getCell('J'+ (8 + increment).toString()).value = updatedState[i].regions[j].usedPopulation;
                sheet.getCell('K'+ (8 + increment).toString()).value = initialState[i].regions[j].population + ' -> ' + updatedState[i].regions[j].population;
                sheet.getCell('L'+ (8 + increment).toString()).value = getPopulationCap(updatedState[i].regions[j].development.developmentId);
                increment += 1;

            }
            
            let lastRowNum = sheet.lastRow.number;
            lastRowNum += 2;

            let stateResources = await reformatStateResources(updatedState, i);

            if(Array.isArray(stateResources) && stateResources.length){
                await formatCell(sheet, 'A'+lastRowNum, 'C' + lastRowNum, 'Productive Resources', [RED,ORANGE,RED])

                increment = 1;
                
                sheet.getCell('A'+(lastRowNum + increment).toString()).value = "Name";
                sheet.getCell('B'+(lastRowNum + increment).toString()).value = "Tier";
                sheet.getCell('C'+(lastRowNum + increment).toString()).value = "Count";

                ['A'+(lastRowNum + increment).toString(),
                'B'+(lastRowNum + increment).toString(),
                'C'+(lastRowNum + increment).toString(),
                ].map(key => {
                    sheet.getCell(key).fill ={
                        type: 'pattern',
                        pattern: 'lightVertical',
                        fgColor: { argb: LIGHT_BLUE },
                        bgColor: { argb: LIGHT_BLUE }
                    }
                    sheet.getCell(key).font ={
                        name: 'Calibri',
                        size: 14,
                        bold: true
                    }
                    sheet.getCell(key).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    };
                    sheet.getCell(key).alignment = {
                        vertical: 'bottom',
                        horizontal: 'right'
                    };
                })
                
                increment = 2;
                stateResources.forEach(resource => {
                    sheet.getCell('A'+ (lastRowNum + increment).toString()).value = resource.name;
                    sheet.getCell('B'+ (lastRowNum + increment).toString()).value = resource.tier;
                    sheet.getCell('C'+ (lastRowNum + increment).toString()).value = resource.count;
                    increment += 1;
                });
            }

            let stateTradeAgreements = await reformatTradeAgreements(tradeAgreements, initialState, i);

            if(Array.isArray(stateTradeAgreements) && stateTradeAgreements.length){
                await formatCell(sheet, 'G'+lastRowNum, 'I' + lastRowNum, 'Trade Agreements', [RED,ORANGE,RED])

                increment = 1;
                
                sheet.getCell('G'+(lastRowNum + increment).toString()).value = "Trade Partner";
                sheet.getCell('H'+(lastRowNum + increment).toString()).value = "Our Trade Power";
                sheet.getCell('I'+(lastRowNum + increment).toString()).value = "Income From Trade";

                ['G'+(lastRowNum + increment).toString(),
                'H'+(lastRowNum + increment).toString(),
                'I'+(lastRowNum + increment).toString(),
                ].map(key => {
                    sheet.getCell(key).fill ={
                        type: 'pattern',
                        pattern: 'lightVertical',
                        fgColor: { argb: LIGHT_BLUE },
                        bgColor: { argb: LIGHT_BLUE }
                    }
                    sheet.getCell(key).font ={
                        name: 'Calibri',
                        size: 14,
                        bold: true
                    }
                    sheet.getCell(key).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    };
                    sheet.getCell(key).alignment = {
                        vertical: 'bottom',
                        horizontal: 'right'
                    };
                })
                
                increment = 2;
                stateTradeAgreements.forEach(agreement => {
                    sheet.getCell('G'+ (lastRowNum + increment).toString()).value = agreement.partnerState;
                    sheet.getCell('H'+ (lastRowNum + increment).toString()).value = agreement.tradePower;
                    sheet.getCell('I'+ (lastRowNum + increment).toString()).value = agreement.tradeValue;
                    increment += 1;
                });
            }
        }
        const fileBuffer = await workbook.xlsx.writeBuffer();
        const fileName = "report_"+prevSeasonYear[0]+prevSeasonYear[1]+"-"+currSeasonYear[0]+currSeasonYear[1];
        //workbook.xlsx.writeFile("report_"+prevSeasonYear[0]+prevSeasonYear[1]+"-"+currSeasonYear[0]+currSeasonYear[1]+".xlsx");
        return [fileName, fileBuffer];
    }
    catch(e){
        console.error(e);
        resStatus = false;
        return resStatus;
    }
}

const getFormula = async (formulaName) => {
    const formulaObj = formulaHelper.getFormulaByKey(formulaName);
    return formulaHelper.parse(formulaObj);
}

exports.advanceSeason = advanceSeason;
exports.getCurrentSeason = getCurrentSeason;
exports.getFormula = getFormula;