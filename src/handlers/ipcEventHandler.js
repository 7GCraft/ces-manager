const { ipcMain, BrowserWindow } = require('electron');
const stateHandler = require('./ipcHandlers/stateHandler');
const regionHandler = require('./ipcHandlers/regionHandler');
const facilityHandler = require('./ipcHandlers/facilityHandler');
const componentHandler = require('./ipcHandlers/componentHandler');
const tradeAgreementHandler = require('./ipcHandlers/tradeAgreementHandler');
const resourceHandler = require('./ipcHandlers/resourceHandler');

const initializeIpcMains = () => {
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
        //win.webContents.send('test', item);
    });

    ipcMain.on('ClosePageOnDelete', function (e) {
        BrowserWindow.getFocusedWindow().close();
        BrowserWindow.getFocusedWindow().reload();
        //win.webContents.send('test', item);
    });
}