const excel = require('exceljs');

const colours = {
  red: 'C85C5C',
  orange: 'F9975D',
  lightBlue: '96C8FB',
};

const stateInfoRowNames = [
  'Treasury',
  'Total Income',
  'Military, Diplomatic, & Misc. Expenses',
  'Administration Cost',
  'Admin Region Cost Modifier',
  'Total Expenses ',
  'Total Food Produced',
  'Total Food Consumed',
  'Total Food Available',
  'Total Population',
  'Average Dev Level',
  'Facility Count',
  'Next Season Income',
];

const columns = [
  { key: 'stateInfoNames', width: 42.5, style: { font: { name: 'Calibri' } } },
  { key: 'initialStateInfo', width: 10, style: { font: { name: 'Calibri' } } },
  { key: 'to_state', width: 10, style: { font: { name: 'Calibri' } } },
  { key: 'updatedStateInfo', width: 10, style: { font: { name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'right' } } },
  { key: 'empty_1', width: 10, style: { font: { name: 'Calibri' } } },
  { key: 'empty_2', width: 10, style: { font: { name: 'Calibri' } } },
  { key: 'regionName', width: 25, style: { font: { name: 'Calibri' } } },
  { key: 'regionIncome', width: 25, style: { font: { name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'right' } } },
  { key: 'foodProduced', width: 25, style: { font: { name: 'Calibri' } } },
  { key: 'populationUsed', width: 25, style: { font: { name: 'Calibri' } } },
  { key: 'currPopulation', width: 25, style: { font: { name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'right' } } },
  { key: 'maxPopulation', width: 25, style: { font: { name: 'Calibri' } } },
];

const applyBorder = (cell) => {
  const target = cell;
  target.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
};

const formatTitle = (sheet, baseCell, targetCell, value, cellColours) => {
  sheet.mergeCells(`${baseCell}:${targetCell}`);
  const cell = sheet.getCell(baseCell);
  cell.value = value;
  cell.font = { name: 'Calibri', size: 24, bold: true };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.fill = {
    type: 'gradient',
    gradient: 'angle',
    degree: 0,
    stops: [
      { position: 0, color: { argb: cellColours[0] } },
      { position: 0.5, color: { argb: cellColours[1] } },
      { position: 1, color: { argb: cellColours[2] } },
    ],
  };
  applyBorder(cell);
};

const formatHeaders = (sheet, cells) => {
  cells.forEach((key) => {
    const cell = sheet.getCell(key);
    cell.fill = {
      type: 'pattern',
      pattern: 'lightVertical',
      fgColor: { argb: colours.lightBlue },
      bgColor: { argb: colours.lightBlue },
    };
    cell.font = { name: 'Calibri', size: 14, bold: true };
    cell.alignment = { vertical: 'bottom', horizontal: 'right' };
    applyBorder(cell);
  });
};

const getStateInfo = (initialState, updatedState) => {
  const nextSeasonIncome = parseFloat(
    parseFloat(updatedState.TotalIncome).toFixed(2)
    - parseFloat(updatedState.expenses).toFixed(2)
    - parseFloat(updatedState.adminCost).toFixed(2),
  ).toFixed(2);

  return {
    initial: [
      initialState.treasuryAmt, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A',
      'N/A', 'N/A', initialState.TotalPopulation, 'N/A', 'N/A', 'N/A',
    ],
    updated: [
      updatedState.treasuryAmt, updatedState.TotalIncome, updatedState.expenses,
      updatedState.adminCost, `${updatedState.adminRegionModifier * 100}%`,
      updatedState.adminCost + updatedState.expenses, updatedState.TotalFoodProduced,
      updatedState.TotalFoodConsumed, updatedState.TotalFoodAvailable,
      updatedState.TotalPopulation, updatedState.AvgDevLevel, updatedState.facilityCount,
      nextSeasonIncome,
    ],
  };
};

const getResources = (state) => {
  const resources = {};
  state.ProductiveResources.forEach((resource) => {
    const key = `${resource.ResourceTierID}:${resource.ResourceName}`;
    if (!resources[key]) {
      resources[key] = { name: resource.ResourceName, tier: resource.ResourceTierID, count: 0 };
    }
    resources[key].count += 1;
  });
  return Object.values(resources).sort((first, second) => first.tier - second.tier
    || first.name.localeCompare(second.name));
};

const getTradeAgreements = (agreements, stateId) => agreements.reduce((result, agreement) => {
  const traderIndex = agreement.traders.findIndex((trader) => trader.state.stateID === stateId);
  if (traderIndex === -1) return result;

  const partner = agreement.traders[traderIndex === 0 ? 1 : 0];
  if (!partner) return result;
  result.push({
    partnerState: partner.state.stateName,
    tradePower: `${parseFloat(agreement.traders[traderIndex].tradePower * 100).toFixed(2)}%`,
    tradeValue: agreement.traders[traderIndex].tradeValue,
  });
  return result;
}, []);

const addStateSheet = (
  workbook,
  initialState,
  updatedState,
  tradeAgreements,
  previousSeason,
  currentSeason,
) => {
  const sheet = workbook.addWorksheet(initialState.stateName);
  sheet.columns = columns;
  const stateInfo = getStateInfo(initialState, updatedState);

  formatTitle(
    sheet,
    'A1',
    'L3',
    initialState.stateName,
    [colours.red, colours.orange, colours.red],
  );
  formatTitle(
    sheet,
    'A4',
    'L4',
    `${previousSeason[0]} ${previousSeason[1]} to ${currentSeason[0]} ${currentSeason[1]}`,
    [colours.lightBlue, colours.lightBlue, colours.lightBlue],
  );
  formatTitle(sheet, 'A6', 'D6', 'General State Info', [colours.red, colours.orange, colours.red]);
  formatTitle(sheet, 'G6', 'L6', 'Region Info', [colours.red, colours.orange, colours.red]);

  stateInfoRowNames.forEach((name, index) => {
    const row = 7 + index;
    sheet.getCell(`A${row}`).value = name;
    sheet.getCell(`B${row}`).value = stateInfo.initial[index];
    sheet.getCell(`C${row}`).value = 'to';
    sheet.getCell(`D${row}`).value = stateInfo.updated[index];
  });

  ['Region Name', 'Total Income', 'Total Food Available', 'Used Population', 'Current Population', 'Population Cap']
    .forEach((name, index) => {
      sheet.getCell(`${String.fromCharCode(71 + index)}7`).value = name;
    });
  formatHeaders(sheet, ['G7', 'H7', 'I7', 'J7', 'K7', 'L7']);

  updatedState.regions.forEach((region, index) => {
    const row = 8 + index;
    const initialRegion = initialState.regions[index];
    sheet.getCell(`G${row}`).value = region.regionName;
    sheet.getCell(`H${row}`).value = region.totalIncome;
    sheet.getCell(`I${row}`).value = region.totalFoodAvailable;
    sheet.getCell(`J${row}`).value = region.usedPopulation;
    sheet.getCell(`K${row}`).value = `${initialRegion.population} -> ${region.population}`;
    sheet.getCell(`L${row}`).value = region.development.populationCap;
  });

  const lastRow = sheet.lastRow.number + 2;
  const resources = getResources(updatedState);
  if (resources.length > 0) {
    formatTitle(sheet, `A${lastRow}`, `C${lastRow}`, 'Productive Resources', [colours.red, colours.orange, colours.red]);
    ['Name', 'Tier', 'Count'].forEach((name, index) => {
      sheet.getCell(`${String.fromCharCode(65 + index)}${lastRow + 1}`).value = name;
    });
    formatHeaders(sheet, [`A${lastRow + 1}`, `B${lastRow + 1}`, `C${lastRow + 1}`]);
    resources.forEach((resource, index) => {
      const row = lastRow + index + 2;
      sheet.getCell(`A${row}`).value = resource.name;
      sheet.getCell(`B${row}`).value = resource.tier;
      sheet.getCell(`C${row}`).value = resource.count;
    });
  }

  const stateAgreements = getTradeAgreements(
    tradeAgreements,
    initialState.stateID,
  );
  if (stateAgreements.length > 0) {
    formatTitle(sheet, `G${lastRow}`, `I${lastRow}`, 'Trade Agreements', [colours.red, colours.orange, colours.red]);
    ['Trade Partner', 'Our Trade Power', 'Income From Trade'].forEach((name, index) => {
      sheet.getCell(`${String.fromCharCode(71 + index)}${lastRow + 1}`).value = name;
    });
    formatHeaders(sheet, [`G${lastRow + 1}`, `H${lastRow + 1}`, `I${lastRow + 1}`]);
    stateAgreements.forEach((agreement, index) => {
      const row = lastRow + index + 2;
      sheet.getCell(`G${row}`).value = agreement.partnerState;
      sheet.getCell(`H${row}`).value = agreement.tradePower;
      sheet.getCell(`I${row}`).value = agreement.tradeValue;
    });
  }
};

const generateSeasonReport = async ({
  initialSnapshot,
  advancedSnapshot,
  previousSeason,
  currentSeason,
}) => {
  const workbook = new excel.Workbook();
  initialSnapshot.states.forEach((state, index) => {
    addStateSheet(
      workbook,
      state,
      advancedSnapshot.states[index],
      advancedSnapshot.tradeAgreements,
      previousSeason,
      currentSeason,
    );
  });

  return {
    fileName: `report_${previousSeason[0]}${previousSeason[1]}-${currentSeason[0]}${currentSeason[1]}`,
    buffer: await workbook.xlsx.writeBuffer(),
  };
};

exports.generateSeasonReport = generateSeasonReport;
