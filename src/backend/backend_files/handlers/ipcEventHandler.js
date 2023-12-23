const { ipcMain, BrowserWindow } = require("electron");
const generalHandler = require("./ipcHandlers/generalHandler");
const stateHandler = require("./ipcHandlers/stateHandler");
const regionHandler = require("./ipcHandlers/regionHandler");
const facilityHandler = require("./ipcHandlers/facilityHandler");
const componentHandler = require("./ipcHandlers/componentHandler");
const tradeAgreementHandler = require("./ipcHandlers/tradeAgreementHandler");
const resourceHandler = require("./ipcHandlers/resourceHandler");

const initializeIpcMains = () => {
  generalHandler.handle();
  stateHandler.handle();
  regionHandler.handle();
  facilityHandler.handle();
  componentHandler.handle();
  tradeAgreementHandler.handle();
  resourceHandler.handle();
  miscellaneous();
};
exports.initializeIpcMains = initializeIpcMains;

function miscellaneous() {
  ipcMain.on("ReloadPageOnUpdate", function (e) {
    e.sender.focus();
    BrowserWindow.getFocusedWindow().reload();
  });

  ipcMain.on("ClosePageOnDelete", function (e) {
    e.sender.focus();
    BrowserWindow.getFocusedWindow().close();
  });
}
