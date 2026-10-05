/* eslint-env jest */

jest.mock('../src/repository/DbContext', () => ({
  getKnexObject: () => () => ({}),
}));

const { buildSeasonAdvancementSnapshot } = require('../src/services/seasonSnapshotServices');

const buildRows = () => ({
  states: [
    {
      stateId: 1, name: 'Albion', treasuryAmt: 1000, desc: '', expenses: 20, adminRegionModifier: 0.1,
    },
    {
      stateId: 2, name: 'Borealis', treasuryAmt: 500, desc: '', expenses: 10, adminRegionModifier: 0,
    },
  ],
  regions: [
    {
      regionId: 1,
      stateId: 1,
      name: 'North',
      population: 10,
      taxRate: 0.1,
      corruptionRate: 0,
      developmentId: 1,
      populationCap: 10,
      growthModifier: 2,
      shrinkageModifier: 0.5,
    },
    {
      regionId: 2,
      stateId: 2,
      name: 'South',
      population: 5,
      taxRate: 0.1,
      corruptionRate: 0,
      developmentId: 1,
      populationCap: 10,
      growthModifier: 2,
      shrinkageModifier: 0.5,
    },
  ],
  facilities: [
    { facilityId: 1, regionId: 1, isFunctional: 1 },
    { facilityId: 2, regionId: 1, isFunctional: 0 },
  ],
  components: [
    {
      componentId: 1, regionId: 1, facilityId: 1, componentTypeId: 4, value: 'i;20', parentId: null,
    },
    {
      componentId: 2, regionId: 1, facilityId: 1, componentTypeId: 5, value: 'i;10', parentId: null,
    },
    {
      componentId: 3, regionId: 1, facilityId: 1, componentTypeId: 3, value: 'i;1', parentId: null,
    },
    {
      componentId: 4, regionId: 1, facilityId: 1, componentTypeId: 1, value: 'i;3', parentId: null,
    },
    {
      componentId: 5, regionId: 1, facilityId: null, componentTypeId: 5, value: 'i;5', parentId: 2,
    },
    {
      componentId: 6, regionId: 1, facilityId: 2, componentTypeId: 5, value: 'i;100', parentId: null,
    },
  ],
  resources: [{ resourceId: 1, name: 'Iron', resourceTierId: 1 }],
  resourceTiers: [{ resourceTierId: 1, name: 'Common', tradePower: 0.2 }],
  tradeAgreementHeaders: [{ tradeAgreementId: 1, desc: 'North-South trade' }],
  tradeAgreementDetails: [
    { tradeAgreementId: 1, stateId: 1, resourceComponentId: 3 },
    { tradeAgreementId: 1, stateId: 2, resourceComponentId: null },
  ],
});

describe('buildSeasonAdvancementSnapshot', () => {
  it('summarises functional facilities and assigns child components to their facility root', () => {
    const snapshot = buildSeasonAdvancementSnapshot(buildRows());
    const albion = snapshot.states[0];
    const north = albion.regions[0];

    expect(north.totalFoodProduced).toBe(20);
    expect(north.totalFoodConsumed).toBe(10);
    expect(north.totalIncome).toBe(115);
    expect(north.usedPopulation).toBe(3);
    expect(north.expectedPopulationGrowth).toBe(4);
    expect(albion.facilityCount).toBe(1);
    expect(albion.ProductiveResources).toEqual([
      { ResourceID: 1, ResourceName: 'Iron', ResourceTierID: 1 },
    ]);
  });

  it('calculates trade from base income and does not compound income across agreements', () => {
    const rows = buildRows();
    rows.tradeAgreementHeaders.push({ tradeAgreementId: 2, desc: 'Second trade' });
    rows.tradeAgreementDetails.push(
      { tradeAgreementId: 2, stateId: 1, resourceComponentId: 3 },
      { tradeAgreementId: 2, stateId: 2, resourceComponentId: null },
    );

    const snapshot = buildSeasonAdvancementSnapshot(rows);
    const albion = snapshot.states[0];

    expect(snapshot.tradeAgreements[0].traders[0].tradeValue).toBe(10);
    expect(snapshot.tradeAgreements[1].traders[0].tradeValue).toBe(10);
    expect(albion.TotalIncome).toBe(135);
  });

  it('calculates report-ready administration costs without additional database reads', () => {
    const snapshot = buildSeasonAdvancementSnapshot(buildRows());

    expect(snapshot.states[0].adminCost).toBeCloseTo(510.68);
    expect(snapshot.states[1].adminCost).toBeCloseTo(464);
  });
});
