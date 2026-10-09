/* eslint-env jest */

const mockFetchSeasonAdvancementRows = jest.fn();
const mockBuildSeasonAdvancementSnapshot = jest.fn();
const mockApplySeasonAdvancementPlan = jest.fn();

jest.mock('../src/repository/DbContext', () => ({
  getKnexObject: () => () => ({}),
}));
jest.mock('../src/services/seasonSnapshotServices', () => ({
  fetchSeasonAdvancementRows: mockFetchSeasonAdvancementRows,
  buildSeasonAdvancementSnapshot: mockBuildSeasonAdvancementSnapshot,
  projectSeasonAdvancementRows: jest.fn((rows) => rows),
}));
jest.mock('../src/services/seasonAdvancementPersistenceServices', () => ({ applySeasonAdvancementPlan: mockApplySeasonAdvancementPlan }));

const { advanceSeasonTransaction } = require('../src/services/generalServices');

describe('advanceSeasonTransaction', () => {
  it('fetches seasonal rows once and uses the transaction executor for all writes', async () => {
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
    const rows = { states: [], regions: [], components: [] };
    const limit = jest.fn().mockResolvedValue([{ season: 'Winter', year: 12 }]);
    const orderBy = jest.fn(() => ({ limit }));
    const from = jest.fn(() => ({ orderBy }));
    const trx = { select: jest.fn(() => ({ from })) };
    mockFetchSeasonAdvancementRows.mockResolvedValue(rows);
    mockBuildSeasonAdvancementSnapshot
      .mockReturnValueOnce(initialSnapshot)
      .mockReturnValueOnce({ states: [], tradeAgreements: [] });

    const result = await advanceSeasonTransaction(trx);

    expect(mockFetchSeasonAdvancementRows).toHaveBeenCalledWith(trx);
    expect(mockApplySeasonAdvancementPlan).toHaveBeenCalledWith(
      { treasuryUpdates: [{ stateId: 1, treasuryAmt: 1070 }], populationUpdates: [] },
      { season: 'Spring', year: 13 },
      trx,
    );
    expect(mockBuildSeasonAdvancementSnapshot).toHaveBeenCalledTimes(2);
    expect(result.currentSeason).toEqual(['Spring', 13]);
  });
});
