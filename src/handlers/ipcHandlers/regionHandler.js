const { ipcMain, BrowserWindow } = require('electron');
const state = require('../../services/stateServices');
const region = require('../../services/regionServices');

const handle = () => {
    ipcMain.on('Region:getAllRegionsByStateId', getAllRegionsByStateId);
    ipcMain.on('Region:openRegionPage', openRegionPage);
    ipcMain.on('Region:getRegionInfo', getRegionInfo);
    ipcMain.on('Region:getStatesForAdd', getStatesForAdd);
    ipcMain.on('Region:getBiomesForAdd', getBiomesForAdd);
    ipcMain.on('Region:getDevelopmentForAdd', getDevelopmentForAdd);
    ipcMain.on('Region:getCorruptionForAdd', getCorruptionForAdd);
    ipcMain.on('Region:addRegion', addRegion);
    ipcMain.on('Region:updateRegion', updateRegion);
    ipcMain.on('Region:deleteRegion', deleteRegion);
}
module.exports = handle;

/**
 * Get Regions by State Id
 */
const getAllRegionsByStateId = (e) => {
    let response = state.getStateList();
    response.then((result) => {
        return Promise.all(result.map((state) => {
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
}

/**
 * Open a new Region window by given Region Id
 */
const openRegionPage = (e, arg) => {
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

    regionWindow.on('close', function () {
        regionWindow = null
    });
}

/**
 * Get Region data by Id
 */
const getRegionInfo = (e, arg) => {
    let response = region.getRegionById(arg)
    response.then(result => {
        console.log(result);
        e.sender.send('Region:getRegionInfoOK', result);
    });
}

/**
 * Get all states
 */
const getStatesForAdd = (e) => {
    let response = state.getStateList();
    response.then(result => {
        e.sender.send("Region:getStatesForAddOK", result);
    });
}

/**
 * Get all biomes
 */
const getBiomesForAdd = (e) => {
    let response = region.getBiomeAll();
    response.then(result => {
        e.sender.send("Region:getBiomesForAddOK", result);
    });
}

/**
 * Get all developments
 */
const getDevelopmentForAdd = (e) => {
    let response = region.getDevelopmentAll();
    response.then(result => {
        e.sender.send("Region:getDevelopmentForAddOK", result);
    });
}

/**
 * Get all corruptions
 */
const getCorruptionForAdd = (e) => {
    let response = region.getCorruptionAll();
    response.then(result => {
        e.sender.send("Region:getCorruptionForAddOK", result);
    });
}

/**
 * Insert Region
 */
const addRegion = (e, args) => {
    let response = region.addRegion(args);
    response.then(result => {
        e.sender.send("Region:addRegionOK", result);
    })
}

/**
 * Update Region
 */
const updateRegion = (e, args) => {
    let response = region.updateRegion(args);
    response.then(result => {
        e.sender.send("Region:updateRegionOK", result);
    });
}

/**
 * Delete Region
 */
const deleteRegion = (e, arg) => {
    let response = region.deleteRegionById(arg);
    response.then(result => {
        e.sender.send("Region:deleteRegionOK", result);
    })
}