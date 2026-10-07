/* eslint-env jest */

const mockGetSeasonAdvancementSnapshot = jest.fn();
const mockApplySeasonAdvancementPlan = jest.fn();

jest.mock('../src/repository/DbContext', () => ({
  getKnexObject: () => () => ({}),
}));
jest.mock('../src/services/seasonSnapshotServices', () => ({ getSeasonAdvancementSnapshot: mockGetSeasonAdvancementSnapshot }));
jest.mock('../src/services/seasonAdvancementPersistenceServices', () => ({ applySeasonAdvancementPlan: mockApplySeasonAdvancementPlan }));

const { advanceSeasonTransaction } = require('../src/services/generalServices');

describe('advanceSeasonTransaction', () => {
  it('uses one transaction executor for both snapshots and all seasonal writes', async () => {
    const initialSnapshot = {
      states: [{
        stateID: 1,
        treasuryAmt: 1000,
        TotalIncome: 120,
        expenses: 20,
        adminCost: 30,
        regions: [],
      }],
    };
    const advancedSnapshot = { states: [], tradeAgreements: [] };
    const limit = jest.fn().mockResolvedValue([{ season: 'Winter', year: 12 }]);
    const orderBy = jest.fn(() => ({ limit }));
    const from = jest.fn(() => ({ orderBy }));
    const trx = { select: jest.fn(() => ({ from })) };
    mockGetSeasonAdvancementSnapshot
      .mockResolvedValueOnce(initialSnapshot)
      .mockResolvedValueOnce(advancedSnapshot);

    const result = await advanceSeasonTransaction(trx);

    expect(mockGetSeasonAdvancementSnapshot).toHaveBeenNthCalledWith(1, trx);
    expect(mockApplySeasonAdvancementPlan).toHaveBeenCalledWith(
      { treasuryUpdates: [{ stateId: 1, treasuryAmt: 1070 }], populationUpdates: [] },
      { season: 'Spring', year: 13 },
      trx,
    );
    expect(mockGetSeasonAdvancementSnapshot).toHaveBeenNthCalledWith(2, trx);
    expect(result.currentSeason).toEqual(['Spring', 13]);
  });
});
