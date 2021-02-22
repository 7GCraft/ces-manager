const { ipcMain } = require('electron');
const trade = require('../../services/tradeAgreementServices');

const handle = () => {
    ipcMain.on('Trade:getAllTradeAgreements', getAllTradeAgreements);
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