const {ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const state = require('../services/stateServices');

//Test Catching data

const initializeIpcMains = () =>{
        
    ipcMain.on('test', function(e, item){
        console.log(item);
        //win.webContents.send('test', item);
    });

    stateListBridge();
};


exports.initializeIpcMains = initializeIpcMains;

function stateListBridge() {

    ipcMain.on('StateList:getStateList', function(e){
        let result = state.getListofState();
        e.sender.send('StateList:getStateListOK', result)
    });

    ipcMain.on('StateList:openStatePage', function(e, item){
        stateWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            },
            title: 'State Info'
        })
        
        stateWindow.loadFile('src/views/stateInfo.html')
        
        stateWindow.on('close', function(){
            stateWindow = null
        });

        console.log("State Window Opened. Proceeding with Getting State Info");
        let result = state.getStateInfo(item)
        //console.log(item);
        
        ipcMain.on('State:loaded', function(e){
            e.sender.send("State:getStateInfo", result)
        })
        
    });
}