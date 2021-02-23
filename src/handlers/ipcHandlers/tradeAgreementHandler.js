const { ipcMain } = require('electron');
const trade = require('../../services/tradeAgreementServices');

const handle = () => {
    ipcMain.on('Trade:getAllTradeAgreements', getAllTradeAgreements);
    ipcMain.on('Trade:getTradeAgreementsByStateId', getTradeAgreementsByStateId);
    ipcMain.on('Trade:addTradeAgreement', addTradeAgreement);
    ipcMain.on('Trade:updateTradeAgreement', updateTradeAgreement);
};
module.exports = handle;

/**
 * Get All trade agreements
 */
const getAllTradeAgreements = (e) => {
    let response = trade.getTradeAgreementAll();
    response.then((result) => {
        e.sender.send('Trade:getAllTradeAgreementsOK', result);
    }).catch((err) => {
        console.log(err);
    });
}

/**
 * Get All trade agreements by state id
 */
const getTradeAgreementsByStateId = (e, arg) => {
    let response = trade.getTradeAgreementByStateId(arg);
    response.then((result) => {
        e.sender.send('Trade:getTradeAgreementsByStateIdOK', result);
    }).catch((err) => {
        console.log(err);
    });
}

/**
 * Insert a trade agreement
 */
const addTradeAgreement = (e, args) => {
    let response = trade.addTradeAgreement(args);
    response.then((result) => {
        e.sender.send('Trade:addTradeAgreementOK', result);
    }).catch((err) => {
        console.log(err);
    });
}

/**
 * Update an existing trade agreement
 */
const updateTradeAgreement = (e, args) => {
    let response = trade.updateTradeAgreement(args);
    response.then((result) => {
        e.sender.send('Trade:updateTradeAgreementOK', result);
    }).catch((err) => {
        console.log(err);
    });
}