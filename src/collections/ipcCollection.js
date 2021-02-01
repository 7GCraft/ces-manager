const {ipcMain} = require('electron')
const state = require('../services/stateServices')

//Test Catching data

const initializeIpcMains = (win) =>{
    
    ipcMain.on('stateInfoLoaded', function(e, item){
        console.log("stateInfoLoaded Called");
        let result = state.getStateInfo(item)
        win.webContents.send("resultSent", result)
    });
    
    ipcMain.on('getStateList', function(e){
        console.log('getStateList Called');
        let result = state.getListofState();
        win.webContents.send('getStateListOK', result)
    });

    ipcMain.on('test', function(e, item){
        console.log(item);
        //win.webContents.send('test', item);
    });
};


exports.initializeIpcMains = initializeIpcMains;
