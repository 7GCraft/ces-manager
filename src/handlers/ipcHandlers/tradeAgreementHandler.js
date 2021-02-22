const { ipcMain } = require('electron');
const trade = require('../../services/tradeAgreementServices');

const handle = () => {
    ipcMain.on('Trade:getAllTradeAgreements', getAllTradeAgreements);
    ipcMain.on('Trade:getTradeAgreementsByStateId', getTradeAgreementsByStateId)
};
module.exports = handle;

const getAllTradeAgreements = (e) => {
    let response = trade.getTradeAgreementAll();
    response.then((result) => {
        e.sender.send('Trade:getAllTradeAgreementsOK', result);
    }).catch((err) => {
        console.log(err);
    });
}

const getTradeAgreementsByStateId = (e, arg) => {
    let response = trade.getTradeAgreementByStateId(arg);
    response.then((result) => {
        e.sender.send('Trade:getTradeAgreementsByStateIdOK', result);
    }).catch((err) => {
        console.log(err);
    });
}