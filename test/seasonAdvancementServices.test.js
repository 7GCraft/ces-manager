/* eslint-env jest */

jest.mock('../src/repository/DbContext', () => ({
  getKnexObject: () => () => ({}),
}));

const {
  createSeasonAdvancementPlan,
  getNextSeason,
} = require('../src/services/generalServices');

describe('getNextSeason', () => {
  it('advances winter to spring in the following year', () => {
    expect(getNextSeason({ season: 'Winter', year: 12 })).toEqual({ season: 'Spring', year: 13 });
  });

  it('advances seasons without changing the year before winter', () => {
    expect(getNextSeason({ season: 'Summer', year: 12 })).toEqual({ season: 'Autumn', year: 12 });
  });
});

describe('createSeasonAdvancementPlan', () => {
  it('calculates batched treasury and capped population updates', () => {
    const snapshot = {
      states: [
        {
          stateID: 1,
          treasuryAmt: 1000,
          TotalIncome: 120,
          expenses: 20,
          adminCost: 30,
          regions: [
            {
              regionId: 10,
              population: 8,
              expectedPopulationGrowth: 4,
              development: { populationCap: 10 },
            },
            {
              regionId: 11,
              population: 8,
              expectedPopulationGrowth: -3,
              development: { populationCap: 10 },
            },
          ],
        },
      ],
    };

    expect(createSeasonAdvancementPlan(snapshot)).toEqual({
      treasuryUpdates: [{ stateId: 1, treasuryAmt: 1070 }],
      populationUpdates: [
        { regionId: 10, population: 10 },
        { regionId: 11, population: 5 },
      ],
    });
  });

  it('does not produce writes for an empty snapshot', () => {
    expect(createSeasonAdvancementPlan({ states: [] })).toEqual({
      treasuryUpdates: [],
      populationUpdates: [],
    });
  });
});
