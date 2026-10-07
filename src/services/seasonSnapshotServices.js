/* eslint-disable max-len, no-param-reassign */

const config = require('./config.json');

const { constants } = config;
const dbContext = require('../repository/DbContext');

const knex = dbContext.getKnexObject();

const parseComponentValue = (value) => {
  if (value === null || value === undefined) return value;

  const tokens = value.toString().split(';');
  return tokens[0] === 'i' ? parseInt(tokens[1], 10) : value;
};

const getRootComponent = (component, componentsById) => {
  let root = component;
  const visited = {};

  while (root.parentId !== null && root.parentId !== undefined) {
    if (visited[root.componentId] || !componentsById[root.parentId]) return root;
    visited[root.componentId] = true;
    root = componentsById[root.parentId];
  }

  return root;
};

const summariseRegion = (region, facilities) => {
  region.totalIncome = region.population * 100 * region.taxRate;
  region.totalFoodProduced = 0;
  region.totalFoodConsumed = region.population;
  region.productiveResources = [];
  region.usedPopulation = 0;

  facilities.forEach((facility) => {
    if (!facility.isFunctional) return;

    region.totalFoodProduced += facility.foodOutput > 0 ? facility.foodOutput : 0;
    region.totalFoodConsumed -= facility.foodOutput < 0 ? facility.foodOutput : 0;
    region.totalIncome += facility.moneyOutput;
    region.usedPopulation += facility.usedPopulation;

    if (facility.resource !== null) region.productiveResources.push(facility.resource);
  });

  region.totalIncome -= region.totalIncome * region.corruption.corruptionRate;
  region.totalFoodAvailable = region.totalFoodProduced - region.totalFoodConsumed;
};

const summariseState = (state) => {
  state.TotalIncome = 0;
  state.TotalFoodProduced = 0;
  state.TotalFoodConsumed = 0;
  state.TotalPopulation = 0;
  state.AvgDevLevel = 0;
  state.ProductiveResources = [];

  let totalDevelopment = 0;
  state.regions.forEach((region) => {
    state.TotalIncome += region.totalIncome;
    state.TotalFoodProduced += region.totalFoodProduced;
    state.TotalFoodConsumed += region.totalFoodConsumed;
    state.TotalPopulation += region.population;
    totalDevelopment += region.development.developmentId;
    state.ProductiveResources = state.ProductiveResources.concat(region.productiveResources);
  });

  if (state.regions.length > 0) {
    state.AvgDevLevel = Math.round(totalDevelopment / state.regions.length);
  }

  state.TotalFoodAvailable = state.TotalFoodProduced - state.TotalFoodConsumed;
  state.BaseGrowth = state.TotalFoodAvailable / 5;

  state.regions.forEach((region) => {
    region.expectedPopulationGrowth = 0;
    if (state.BaseGrowth > 0) {
      region.expectedPopulationGrowth = Math.round(
        (state.BaseGrowth / state.regions.length) * region.development.growthModifier,
      );
    } else if (state.BaseGrowth < 0) {
      region.expectedPopulationGrowth = Math.round(
        (state.BaseGrowth / state.regions.length) * region.development.shrinkageModifier,
      );
    }
  });
};

const buildFacilitiesByRegion = (facilityRows, componentRows, resourcesById) => {
  const componentsById = {};
  componentRows.forEach((component) => {
    componentsById[component.componentId] = component;
  });

  const facilitiesById = {};
  const facilitiesByRegion = {};
  facilityRows.forEach((rawFacility) => {
    const facility = {
      facilityId: rawFacility.facilityId,
      regionId: rawFacility.regionId,
      isFunctional: rawFacility.isFunctional !== 0,
      foodOutput: 0,
      moneyOutput: 0,
      resource: null,
      usedPopulation: 0,
    };
    facilitiesById[facility.facilityId] = facility;
    if (!facilitiesByRegion[facility.regionId]) facilitiesByRegion[facility.regionId] = [];
    facilitiesByRegion[facility.regionId].push(facility);
  });

  componentRows.forEach((component) => {
    const rootComponent = getRootComponent(component, componentsById);
    const facility = facilitiesById[rootComponent.facilityId];
    if (!facility) return;

    const value = parseComponentValue(component.value);
    if (component.componentTypeId === 1) facility.usedPopulation += value;
    else if (component.componentTypeId === 3) {
      const resourceId = component.value.toString().split(';')[1];
      facility.resource = resourcesById[resourceId] || null;
    } else if (component.componentTypeId === 4) facility.foodOutput += value;
    else if (component.componentTypeId === 5) facility.moneyOutput += value;
  });

  return { facilitiesById, facilitiesByRegion };
};

const buildTradeAgreements = (headerRows, detailRows, statesById, componentsById, facilitiesById, resourcesById, tiersById) => {
  const agreementsById = {};
  headerRows.forEach((header) => {
    agreementsById[header.tradeAgreementId] = {
      tradeAgreementId: header.tradeAgreementId,
      desc: header.desc,
      tradersByStateId: {},
    };
  });

  detailRows.forEach((detail) => {
    const agreement = agreementsById[detail.tradeAgreementId];
    const state = statesById[detail.stateId];
    if (!agreement || !state) return;

    if (!agreement.tradersByStateId[detail.stateId]) {
      agreement.tradersByStateId[detail.stateId] = { state, resources: [] };
    }

    const trader = agreement.tradersByStateId[detail.stateId];
    if (detail.resourceComponentId === null) {
      trader.resources = null;
      return;
    }
    if (trader.resources === null) return;

    const component = componentsById[detail.resourceComponentId];
    const facility = component && facilitiesById[component.facilityId];
    const resourceId = component && component.value.toString().split(';')[1];
    const resource = resourcesById[resourceId];

    if (!component || component.componentTypeId !== 3 || !facility || !facility.isFunctional || !resource) {
      trader.resources.push(null);
      return;
    }

    trader.resources.push(resource);
  });

  const tradeIncomeByStateId = {};
  const agreements = Object.keys(agreementsById).map((agreementId) => {
    const agreement = agreementsById[agreementId];
    const traders = Object.keys(agreement.tradersByStateId).map((stateId) => {
      const trader = agreement.tradersByStateId[stateId];
      trader.tradePower = trader.resources === null ? 0 : trader.resources.reduce((total, resource) => {
        if (resource === null) return total;
        return total + tiersById[resource.ResourceTierID].tradePower;
      }, 0);
      return trader;
    });
    const totalIncome = traders.reduce((total, trader) => total + trader.state.TotalIncome, 0);

    traders.forEach((trader) => {
      trader.tradeValue = (totalIncome - trader.state.TotalIncome) * trader.tradePower;
      tradeIncomeByStateId[trader.state.stateID] = (tradeIncomeByStateId[trader.state.stateID] || 0) + trader.tradeValue;
    });

    return {
      tradeAgreementId: agreement.tradeAgreementId,
      desc: agreement.desc,
      traders,
    };
  });

  Object.keys(tradeIncomeByStateId).forEach((stateId) => {
    statesById[stateId].TotalIncome += tradeIncomeByStateId[stateId];
  });

  return agreements;
};

const buildSeasonAdvancementSnapshot = (rows) => {
  const statesById = {};
  rows.states.forEach((rawState) => {
    statesById[rawState.stateId] = {
      stateID: rawState.stateId,
      stateName: rawState.name,
      treasuryAmt: rawState.treasuryAmt,
      desc: rawState.desc,
      expenses: rawState.expenses,
      adminRegionModifier: rawState.adminRegionModifier,
      regions: [],
    };
  });

  rows.regions.forEach((rawRegion) => {
    const state = statesById[rawRegion.stateId];
    if (!state) return;
    state.regions.push({
      regionId: rawRegion.regionId,
      regionName: rawRegion.name,
      population: rawRegion.population,
      taxRate: rawRegion.taxRate,
      corruption: { corruptionRate: rawRegion.corruptionRate },
      development: {
        developmentId: rawRegion.developmentId,
        populationCap: rawRegion.populationCap,
        growthModifier: rawRegion.growthModifier,
        shrinkageModifier: rawRegion.shrinkageModifier,
      },
    });
  });

  const resourcesById = {};
  rows.resources.forEach((resource) => {
    resourcesById[resource.resourceId] = {
      ResourceID: resource.resourceId,
      ResourceName: resource.name,
      ResourceTierID: resource.resourceTierId,
    };
  });
  const tiersById = {};
  rows.resourceTiers.forEach((tier) => {
    tiersById[tier.resourceTierId] = { tradePower: tier.tradePower };
  });

  const facilityData = buildFacilitiesByRegion(rows.facilities, rows.components, resourcesById);
  Object.keys(statesById).forEach((stateId) => {
    const state = statesById[stateId];
    state.regions.forEach((region) => {
      summariseRegion(region, facilityData.facilitiesByRegion[region.regionId] || []);
    });
    state.facilityCount = state.regions.reduce((total, region) => total + (facilityData.facilitiesByRegion[region.regionId] || []).filter((facility) => facility.isFunctional).length, 0);
    state.adminCost = (0.28 * state.facilityCount * state.facilityCount)
            + (400 * (1.16 ** state.regions.length) * (1 + state.adminRegionModifier));
    summariseState(state);
  });

  const componentsById = {};
  rows.components.forEach((component) => {
    componentsById[component.componentId] = component;
  });
  const tradeAgreements = buildTradeAgreements(
    rows.tradeAgreementHeaders,
    rows.tradeAgreementDetails,
    statesById,
    componentsById,
    facilityData.facilitiesById,
    resourcesById,
    tiersById,
  );

  return { states: Object.keys(statesById).map((stateId) => statesById[stateId]), tradeAgreements };
};

const fetchSeasonAdvancementRows = async (executor = knex) => {
  const [states, regions, facilities, components, resources, resourceTiers, tradeAgreementHeaders, tradeAgreementDetails] = await Promise.all([
    executor(constants.TABLE_STATE).select('*').orderBy(constants.COLUMN_STATE_ID),
    executor(constants.TABLE_REGION)
      .select([
        `${constants.TABLE_REGION}.${constants.COLUMN_REGION_ID} as regionId`,
        `${constants.TABLE_REGION}.${constants.COLUMN_STATE_ID} as stateId`,
        `${constants.TABLE_REGION}.${constants.COLUMN_NAME} as name`,
        `${constants.TABLE_REGION}.${constants.COLUMN_POPULATION} as population`,
        `${constants.TABLE_REGION}.${constants.COLUMN_TAX_RATE} as taxRate`,
        `${constants.TABLE_DEVELOPMENT}.${constants.COLUMN_DEVELOPMENT_ID} as developmentId`,
        `${constants.TABLE_DEVELOPMENT}.${constants.COLUMN_POPULATION_CAP} as populationCap`,
        `${constants.TABLE_DEVELOPMENT}.${constants.COLUMN_GROWTH_MODIFIER} as growthModifier`,
        `${constants.TABLE_DEVELOPMENT}.${constants.COLUMN_SHRINKAGE_MODIFIER} as shrinkageModifier`,
        `${constants.TABLE_CORRUPTION}.${constants.COLUMN_RATE} as corruptionRate`,
      ])
      .leftJoin(constants.TABLE_DEVELOPMENT, `${constants.TABLE_REGION}.${constants.COLUMN_DEVELOPMENT_ID}`, `${constants.TABLE_DEVELOPMENT}.${constants.COLUMN_DEVELOPMENT_ID}`)
      .leftJoin(constants.TABLE_CORRUPTION, `${constants.TABLE_REGION}.${constants.COLUMN_CORRUPTION_ID}`, `${constants.TABLE_CORRUPTION}.${constants.COLUMN_CORRUPTION_ID}`)
      .orderBy(`${constants.TABLE_REGION}.${constants.COLUMN_STATE_ID}`)
      .orderBy(`${constants.TABLE_REGION}.${constants.COLUMN_REGION_ID}`),
    executor(constants.TABLE_FACILITY).select('*').orderBy(constants.COLUMN_FACILITY_ID),
    executor(constants.TABLE_COMPONENT).select('*').orderBy(constants.COLUMN_COMPONENT_ID),
    executor(constants.TABLE_RESOURCE).select('*').orderBy(constants.COLUMN_RESOURCE_ID),
    executor(constants.TABLE_RESOURCE_TIER).select('*').orderBy(constants.COLUMN_RESOURCE_TIER_ID),
    executor(constants.TABLE_TRADE_AGREEMENT_HEADER).select('*').orderBy(constants.COLUMN_TRADE_AGREEMENT_ID),
    executor(constants.TABLE_TRADE_AGREEMENT_DETAIL).select('*').orderBy(constants.COLUMN_TRADE_AGREEMENT_ID),
  ]);

  return {
    states, regions, facilities, components, resources, resourceTiers, tradeAgreementHeaders, tradeAgreementDetails,
  };
};

const getSeasonAdvancementSnapshot = async (executor = knex) => buildSeasonAdvancementSnapshot(
  await fetchSeasonAdvancementRows(executor),
);

exports.buildSeasonAdvancementSnapshot = buildSeasonAdvancementSnapshot;
exports.fetchSeasonAdvancementRows = fetchSeasonAdvancementRows;
exports.getSeasonAdvancementSnapshot = getSeasonAdvancementSnapshot;
