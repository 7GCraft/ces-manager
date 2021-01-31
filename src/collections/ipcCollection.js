const {ipcMain} = require('electron')
const state = require('../services/stateServices')

//Test Catching data

const initializeIpcMains = (win) =>{
    
    ipcMain.on('stateInfoLoaded', function(e, item){
        console.log("IPC MAIN Called");
        let result = state.getStateInfo(item)
        win.webContents.send("resultSent", result)
    });
    
    ipcMain.on('test', function(e, item){
        console.log(item);
        //win.webContents.send('test', item);
    });
};


exports.initializeIpcMains = initializeIpcMains;
