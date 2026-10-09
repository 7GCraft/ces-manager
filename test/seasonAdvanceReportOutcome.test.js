/* eslint-env jest */

const mockTransaction = jest.fn();
const mockGenerateSeasonReport = jest.fn();
const mockKnex = () => ({});
mockKnex.transaction = mockTransaction;

jest.mock('../src/repository/DbContext', () => ({
  getKnexObject: () => mockKnex,
}));
jest.mock('../src/services/seasonReportServices', () => ({
  generateSeasonReport: mockGenerateSeasonReport,
}));

const { advanceSeason } = require('../src/services/generalServices');

describe('advanceSeason report outcome', () => {
  const advancement = {
    initialSnapshot: { states: [] },
    advancedSnapshot: { states: [], tradeAgreements: [] },
    previousSeason: ['Winter', 12],
    currentSeason: ['Spring', 13],
  };

  beforeEach(() => {
    mockTransaction.mockReset();
    mockGenerateSeasonReport.mockReset();
    mockTransaction.mockResolvedValue(advancement);
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.console.error.mockRestore();
  });

  it('reports a committed advance when report generation fails', async () => {
    mockGenerateSeasonReport.mockRejectedValue(new Error('Workbook failed'));

    await expect(advanceSeason()).resolves.toEqual({
      advanced: true,
      report: null,
      reportError: true,
    });
    expect(mockGenerateSeasonReport).toHaveBeenCalledWith(advancement);
  });

  it('returns the generated report after a committed advance', async () => {
    const report = { fileName: 'report_Winter12-Spring13', buffer: Buffer.from('report') };
    mockGenerateSeasonReport.mockResolvedValue(report);

    await expect(advanceSeason()).resolves.toEqual({ advanced: true, report });
  });
});
