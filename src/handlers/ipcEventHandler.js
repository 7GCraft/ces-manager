const { ipcMain, BrowserWindow } = require('electron');
const generalHandler = require('./ipcHandlers/generalHandler');
const stateHandler = require('./ipcHandlers/stateHandler');
const regionHandler = require('./ipcHandlers/regionHandler');
const facilityHandler = require('./ipcHandlers/facilityHandler');
const componentHandler = require('./ipcHandlers/componentHandler');
const tradeAgreementHandler = require('./ipcHandlers/tradeAgreementHandler');
const resourceHandler = require('./ipcHandlers/resourceHandler');

const initializeIpcMains = () => {
    generalHandler();
    stateHandler();
    regionHandler();
    facilityHandler();
    componentHandler();
    tradeAgreementHandler();
    resourceHandler();
    miscellaneous();
};
exports.initializeIpcMains = initializeIpcMains;

function miscellaneous() {
    ipcMain.on('ReloadPageOnUpdate', function (e) {
        BrowserWindow.getFocusedWindow().reload();
    });

    ipcMain.on('ClosePageOnDelete', function (e) {
        BrowserWindow.getFocusedWindow().close();
        BrowserWindow.getFocusedWindow().reload();
    });
}