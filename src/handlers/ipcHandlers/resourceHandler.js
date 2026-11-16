const { ipcMain, webContents } = require('electron');
const getResourceService = () => require('../../services/resourceServices');

const handle = () => {
    ipcMain.on('Resource:getAllResourceTiers', getAllResourceTiers);
    ipcMain.on('Resource:getAllResourcesByStateId', getAllResourcesByStateId);
    ipcMain.on('Resource:updateResourceAll', updateResourceAll);
    ipcMain.on('Resource:addResource', addResource);
    ipcMain.on('Resource:deleteResourceById', deleteResourceById);
}
module.exports = {
    handle
};

/**
 * Get Resource Tiers
 */
const getAllResourceTiers = (e) => {
    let response = getResourceService().getResourceTierAll();
    response.then(function (result) {
        e.sender.send('Resource:getAllResourceTiersOk', result);
    });
}

/**
 * Get All resources inside a state by given state id
 */
const getAllResourcesByStateId = (e, arg) => {
    let response = getResourceService().getAllResourcesByStateId(arg);
    response.then(function (result) {
        e.sender.send('Resource:getAllResourcesByStateIdOk', result);
    });
};

/**
 * Update many resources
 */
const updateResourceAll = (e, args) => {
    let response = getResourceService().updateResourceAll(args);
    response.then((result) => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Resource:updateResourceAllOK", result);
        });
    })
}

/**
 * Insert Resource
 */
const addResource = (e, args) => {
    let response = getResourceService().addResource(args.ResourceName, args.ResourceTierID);
    response.then((result) => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Resource:addResourceOK", result);
        });
    })
}

/**
 * Delete Resource
 */
const deleteResourceById = (e, args) => {
    okDeleteResource = true;
    args.forEach(arg => {
        let response = getResourceService().deleteResourceById(arg);
        response.then((result) => {
            if (!result) {
                okDeleteResource = false;
            }
        })
    });

    let allWindows = webContents.getAllWebContents();
    allWindows.sort((a, b) => b - a);
    allWindows.forEach(win => {
        win.send("Resource:deleteResourceByIdOk", okDeleteResource);
    });
}
