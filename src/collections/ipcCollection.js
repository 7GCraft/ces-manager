const {ipcMain, BrowserWindow, ipcRenderer, remote} = require('electron');
const path = require('path');
const state = require('../services/stateServices');
const resource = require('../services/resourceServices');
const region = require('../services/regionServices');
const component = require('../services/componentServices');


const initializeIpcMains = () =>{
    stateListBridge();
    regionBridge();
    componentBridge();
    resourceBridge();
    miscellaneous();
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
        let response = state.addState(args);
        response.then((result) => {
            e.sender.send('State:addStateOK', result)
        })
    })

    //Get state that was clicked on State List
    ipcMain.on('State:openStatePage', (e, arg) => {
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
        
        stateWindow.on('close', function(){
            stateWindow = null
        });

        
    });
    //Get all state by ID
    ipcMain.on('State:getStateInfo', function(e, arg){
        let response = state.getStateById(arg);
        response.then( (result) => {
            //console.log(result);
            e.sender.send("State:getStateInfoOK", result)
        })
    })

    //Get all regions for one state
    ipcMain.on('State:getRegionsForState', (e, arg) => {
        let response = region.getRegionListByStateId(arg);
        response.then((result) => {
            e.sender.send("State:getRegionsForStateOK", result);
        });
    });

    //Update a state
    ipcMain.on('State:updateState', (e, args) => {
        let response = state.updateState(args);
        response.then((result) => {
            e.sender.send("State:updateStateOK", result);
        });
    })

    //Delete a state
    ipcMain.on('State:deleteState', (e, arg) => {
        let response = state.deleteStateById(arg);
        response.then((result)=> {
            e.sender.send("State:deleteStateOK", result);
        });
    })

    
}

function regionBridge(){
    ipcMain.on('Region:getAllRegionsByStateId', (e) => {
        let states = []
        let response = state.getStateList();
        response.then((result) => {
            return Promise.all(result.map((state)=>{
                return region.getRegionListByStateId(state.stateID).then((regions) => {
                    stateRegionObj = {};
                    stateRegionObj["stateID"] = state.stateID;
                    stateRegionObj["stateName"] = state.stateName;
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

    ipcMain.on('Region:openRegionPage', (e, arg) => {
        regionWindow = new BrowserWindow({
            width: 1080,
            height: 720,
            webPreferences: {
                nodeIntegration: true,
                additionalArguments: [arg]
            },
            title: 'Region Info'
        })
        
        regionWindow.loadFile('src/views/regionInfo.html')
        
        regionWindow.on('close', function(){
            regionWindow = null
        });
    });

    ipcMain.on('Region:getRegionInfo', (e, arg) => {
        //console.log(arg);
        let response = region.getRegionById(arg)
        response.then(result => {
            //console.log(result);
            e.sender.send('Region:getRegionInfoOK', result);
        });
    })

    ipcMain.on('Region:getStatesForAdd', e => {
        let response = state.getStateList();
        response.then(result => {
            e.sender.send("Region:getStatesForAddOK", result);
        });
    });

    ipcMain.on('Region:getBiomesForAdd', e => {
        let response = region.getBiomeAll();
        response.then(result => {
            e.sender.send("Region:getBiomesForAddOK", result);
        });
    });

    ipcMain.on('Region:getDevelopmentForAdd', e => {
        let response = region.getDevelopmentAll();
        response.then(result => {
            e.sender.send("Region:getDevelopmentForAddOK", result);
        });
    });

    ipcMain.on('Region:getCorruptionForAdd', e => {
        let response = region.getCorruptionAll();
        response.then(result => {
            e.sender.send("Region:getCorruptionForAddOK", result);
        });
    });

    ipcMain.on('Region:addRegion', (e, args) => {
        let response = region.addRegion(args);
        response.then(result => {
            e.sender.send("Region:addRegionOK", result);
        })
    });

    ipcMain.on('Region:updateRegion', (e, args) => {
        let response = region.updateRegion(args);
        response.then(result => {
            e.sender.send("Region:updateRegionOK", result);
        });
    })

    ipcMain.on('Region:deleteRegion', (e, arg) => {
        let response = region.deleteRegionById(arg);
        response.then(result => {
            e.sender.send("Region:deleteRegionOK", result);
        })
    })
}

function componentBridge() {
    ipcMain.on('Component:getComponentList', (e, arg) => {
        let response = component.getComponentByRegionId(arg);
        response.then(result => {
            e.sender.send("Component:getComponentListOK", result);
        })
    });

    ipcMain.on('Component:getUsedComponentList', (e, arg) => {
        let response = component.getComponentFunctionalByRegionId(arg);
        response.then(result => {
            e.sender.send("Component:getUsedComponentListOK", result);
        })
    });

    ipcMain.on('Component:getUnusedComponentList', (e, arg) => {
        let response = component.getComponentUnusedByRegionId(arg);
        response.then(result => {
            e.sender.send("Component:getUnusedComponentListOK", result);
        })
    });
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

function miscellaneous() {
    ipcMain.on('ReloadPageOnUpdate', function(e){
        BrowserWindow.getFocusedWindow().reload();
        //win.webContents.send('test', item);
    });
     
    ipcMain.on('ClosePageOnDelete', function(e){
        BrowserWindow.getFocusedWindow().close();
        BrowserWindow.getFocusedWindow().reload();
        //win.webContents.send('test', item);
    });
}