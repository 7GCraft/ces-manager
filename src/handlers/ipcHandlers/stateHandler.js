const { ipcMain, BrowserWindow, webContents } = require('electron');
const state = require('../../services/stateServices');
const region = require('../../services/regionServices');

const handle = () => {
    ipcMain.on('State:getStateList', getStateList);
    ipcMain.on('State:addState', addState);
    ipcMain.on('State:openStatePage', openStatePage);
    ipcMain.on('State:getStateInfo', getStateInfo);
    ipcMain.on('State:getRegionsForState', getRegionsForState);
    ipcMain.on('State:updateState', updateState);
    ipcMain.on('State:deleteState', deleteState);
};
module.exports = {
    handle
};

/**
 * Get List of states
 */
const getStateList = (e) => {
    let response = state.getStateList();
    response.then((result) => {
        e.sender.send('State:getStateListOK', result)
    })
}

/**
 * Insert State
 */
const addState = (e, args) => {
    let response = state.addState(args);
    response.then((result) => {
        e.sender.send('State:addStateOK', result)
    })
}

/**
 * Open new state window base on given state Id
 */
const openStatePage = (e, arg) => {
    stateWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            additionalArguments: [arg]
        },
        title: 'State Info'
    })

    stateWindow.loadFile('src/views/stateInfo.html')

    stateWindow.on('close', function () {
        stateWindow = null
    });
}

/**
 * Get state by ID
 */
const getStateInfo = (e, arg) => {
    let response = state.getStateById(arg);
    response.then((result) => {
        e.sender.send("State:getStateInfoOK", result)
    })
}

/**
 * Get all regions for one state
 */
const getRegionsForState = (e, arg) => {
    let response = region.getRegionListByStateId(arg);
    response.then((result) => {
        e.sender.send("State:getRegionsForStateOK", result);
    });
}

/** 
 * Update state
 */
const updateState = (e, args) => {
    let response = state.updateState(args);
    response.then((result) => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("State:updateStateOK", result);
        });
        // e.sender.send("State:updateStateOK", result);
    });
}

/**
 * Delete state
 */
const deleteState = (e, arg) => {
    let response = state.deleteStateById(arg);
    response.then((result) => {
        // e.sender.send("State:deleteStateOK", result);
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("State:deleteStateOK", result);
        });
    });
}