const {ipcMain, BrowserWindow, ipcRenderer} = require('electron');
const path = require('path');
const state = require('../services/stateServices');
const resource = require('../services/resourceServices');


const initializeIpcMains = () =>{
        
    ipcMain.on('test', function(e, item){
        console.log(item);
        //win.webContents.send('test', item);
    });

    stateListBridge();
    resourceBridge();
};
exports.initializeIpcMains = initializeIpcMains;

function stateListBridge() {

    //Get List of states
    ipcMain.on('State:getStateList', (e) => {
        let response = state.getStateList();
        response.then((result) => {
            e.sender.send('State:getStateListOK', result)
        })
    });

    ipcMain.on('State:addState', (e, args) => {
        console.log(args);
        let response = state.addState(args.name, args.treasuryAmt, args.desc);
        response.then((result) => {
            e.sender.send('State:addStateOK', result)
        })
    })

    //Get state that was clicked on State List
    ipcMain.on('State:openStatePage', (e, args) => {
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
        let result = state.getStateInfo(args)
        //console.log(item);
        
        ipcMain.on('State:loaded', function(e){
            e.sender.send("State:getStateInfo", result)
        })
    });
}

function resourceBridge(){
    //Catch load request from IpcRenderer, then send it back when result is resolved
    ipcMain.on('Resource:getAllResourceTiers', (e) => {
        let result = resource.getResourceTierAll();
        result.then(function(result){
            e.sender.send('Resource:getAllResourceTiersOk', result);
            //console.log(result);
        });
    });

    //Update all resources
    ipcMain.on("Resource:updateResourceAll", (e, args) => {
        //console.log(res);
        let response = resource.updateResourceAll(args);
        response.then((result) => {
            e.sender.send("Resource:updateResourceAllOK", result);
        })
    });

    //Add new Resource
    ipcMain.on("Resource:addResource", (e, args) => {
        let response = resource.addResource(args)
        response.then((result) => {
            e.sender.send("Resource:addResourceOK", result);
        })
    });

    //Delete Resource(s) by ID
    ipcMain.on("Resource:deleteResourceById", (e, args) => {
        okDeleteResource = true;
        args.forEach(arg => {
            let response = resource.deleteResourceById(arg);

            if(!response){
                okDeleteResource = false;
            }
        });

        e.sender.send("Resource:deleteResourceByIdOk", okDeleteResource);
    })
}