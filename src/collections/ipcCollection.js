const {ipcMain, BrowserWindow, ipcRenderer, remote} = require('electron');
const path = require('path');
const state = require('../services/stateServices');
const resource = require('../services/resourceServices');
const region = require('../services/regionServices');


const initializeIpcMains = () =>{
    stateListBridge();
    regionBridge();
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

    //Add State
    ipcMain.on('State:addState', (e, args) => {
        console.log(args);
        let response = state.addState(args.name, args.treasuryAmt, args.desc);
        response.then((result) => {
            e.sender.send('State:addStateOK', result)
        })
    })

    //Get state that was clicked on State List
    ipcMain.on('State:openStatePage', (e, arg) => {
        stateWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                additionalArguments: [arg]
            },
            title: 'State Info'
        })
        
        stateWindow.loadFile('src/views/stateInfo.html')
        
        stateWindow.on('close', function(){
            stateWindow = null
        });

        
    });

    ipcMain.on('State:getStateInfo', function(e, arg){
        let response = state.getStateById(arg);
        response.then( (result) => {
            //console.log(result);
            e.sender.send("State:getStateInfoOK", result)
        })
    })

    ipcMain.on('State:getRegionsForState', (e, arg) => {
        let response = region.getRegionListByStateId(arg);
        response.then((result) => {
            e.sender.send("State:getRegionsForStateOK", result);
        });
    });

    ipcMain.on('State:updateState', (e, args) => {
        let response = state.updateState(args);
        response.then((result) => {
            e.sender.send("State:updateStateOK", result);
        });
    })

    ipcMain.on('State:deleteState', (e, arg) => {
        let response = state.deleteStateById(arg);
        response.then((result)=> {
            e.sender.send("State:deleteStateOK", result);
        });
    })

    ipcMain.on('State:ReloadPageOnUpdate', function(e){
        BrowserWindow.getFocusedWindow().reload();
        //win.webContents.send('test', item);
    });
     
    ipcMain.on('State:ClosePageOnDelete', function(e){
        BrowserWindow.getFocusedWindow().close();
        BrowserWindow.getFocusedWindow().reload();
        //win.webContents.send('test', item);
    });
}

function regionBridge(){
    ipcMain.on('Region:getAllRegionsByStateId', (e) => {
        let states = []
        let response = state.getStateList();
        response.then((result) => {
            return Promise.all(result.map((state)=>{
                return region.getRegionListByStateId(state.StateID).then((regions) => {
                    stateRegionObj = {};
                    stateRegionObj["StateID"] = state.StateID;
                    stateRegionObj["StateName"] = state.StateName;
                    stateRegionObj["Regions"] = regions; 

                    return stateRegionObj;
                })
            }))
        })
        .then((regionsByState) => {
            //console.log(regionsByStateArray);
            e.sender.send('Region:getAllRegionsByStateIdOK', regionsByState);
        });
    })
}

function resourceBridge(){
    //Catch load request from IpcRenderer, then send it back when result is resolved
    ipcMain.on('Resource:getAllResourceTiers', (e) => {
        let response = resource.getResourceTierAll();
        response.then(function(result){
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
        let response = resource.addResource(args.ResourceName, args.ResourceTierID);
        //let response = resource.addResource(args)
        response.then((result) => {
            console.log(result);
            e.sender.send("Resource:addResourceOK", result);
        })
    });

    //Delete Resource(s) by ID
    ipcMain.on("Resource:deleteResourceById", (e, args) => {
        okDeleteResource = true;
        args.forEach(arg => {
            let response = resource.deleteResourceById(arg);
            response.then((result) => {
                if(!result){
                    okDeleteResource = false;
                }
            })
        });

        e.sender.send("Resource:deleteResourceByIdOk", okDeleteResource);
    })
}