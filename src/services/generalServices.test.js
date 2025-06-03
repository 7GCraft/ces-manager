const Excel = require('exceljs');

const config = require('./config.json');
const generalServices = require(config.paths.generalServices);

jest.mock(config.paths.tradeAgreementServices);

test('test', () => {
    expect(generalServices.advanceSeason()).toBe(true);
});