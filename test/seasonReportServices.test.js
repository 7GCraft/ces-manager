/* eslint-env jest */

const mockWriteBuffer = jest.fn();

jest.mock('exceljs', () => ({
  Workbook: jest.fn(() => ({
    addWorksheet: jest.fn(),
    xlsx: { writeBuffer: mockWriteBuffer },
  })),
}));

const { generateSeasonReport } = require('../src/services/seasonReportServices');

describe('generateSeasonReport', () => {
  const input = {
    initialSnapshot: { states: [] },
    advancedSnapshot: { states: [], tradeAgreements: [] },
    previousSeason: ['Winter', 12],
    currentSeason: ['Spring', 13],
  };

  beforeEach(() => {
    mockWriteBuffer.mockReset();
  });

  it('returns a report from supplied snapshots without database access', async () => {
    const buffer = Buffer.from('workbook');
    mockWriteBuffer.mockResolvedValue(buffer);

    await expect(generateSeasonReport(input)).resolves.toEqual({
      fileName: 'report_Winter12-Spring13',
      buffer,
    });
  });

  it('propagates workbook failures to its caller', async () => {
    mockWriteBuffer.mockRejectedValue(new Error('Workbook failed'));

    await expect(generateSeasonReport(input)).rejects.toThrow('Workbook failed');
  });
});
