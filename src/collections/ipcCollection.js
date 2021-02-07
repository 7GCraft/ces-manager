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
    ipcMain.on('StateList:getStateList', function(e){
        let response = state.getStateList();
        response.then((result) => {
            e.sender.send('StateList:getStateListOK', result)
        })
    });

    //Get state that was clicked on State List
    ipcMain.on('StateList:openStatePage', function(e, args){
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
        response.then((response) => {
            if(response){
                e.sender.send("Resource:updateResourceAllOk", true);
            }
            else{
                e.sender.send("Resource:updateResourceAllOk", false);
            }
        })
    });

    //Add new Resource
    ipcMain.on("Resource:addResource", (e, args) => {
        let response = resource.addResource(args)
        response.then((response) => {
            if(response){
                e.sender.send("Resource:addResourceOK", true);
            }
            else{
                e.sender.send("Resource:addResourceOK", false);
            }
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