/* eslint-env jest */

jest.mock('../src/repository/DbContext', () => ({
  getKnexObject: () => () => ({}),
}));

const { applySeasonAdvancementPlan } = require('../src/services/seasonAdvancementPersistenceServices');

describe('applySeasonAdvancementPlan', () => {
  it('uses one executor for batched writes, timer reduction, and season insertion', async () => {
    const decrement = jest.fn().mockResolvedValue(2);
    const where = jest.fn(() => ({ decrement }));
    const insert = jest.fn(() => ({ into: jest.fn().mockResolvedValue([2]) }));
    const executor = jest.fn(() => ({ where }));
    executor.raw = jest.fn().mockResolvedValue(undefined);
    executor.insert = insert;

    await applySeasonAdvancementPlan({
      treasuryUpdates: [{ stateId: 1, treasuryAmt: 1070 }],
      populationUpdates: [{ regionId: 10, population: 10 }],
    }, { season: 'Summer', year: 12 }, executor);

    expect(executor.raw).toHaveBeenCalledTimes(2);
    expect(executor).toHaveBeenCalledWith('MsComponent');
    expect(where).toHaveBeenCalledWith('activationTime', '>', 0);
    expect(decrement).toHaveBeenCalledWith('activationTime', 1);
    expect(insert).toHaveBeenCalledWith({ season: 'Summer', year: 12 });
  });
});
