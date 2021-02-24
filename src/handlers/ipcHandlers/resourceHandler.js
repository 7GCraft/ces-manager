const { ipcMain } = require('electron');
const resource = require('../../services/resourceServices');

const handle = () => {
    ipcMain.on('Resource:getAllResourceTiers', getAllResourceTiers);
    ipcMain.on('Resource:updateResourceAll', updateResourceAll);
    ipcMain.on('Resource:addResource', addResource);
    ipcMain.on('Resource:deleteResourceById', deleteResourceById);
}
module.exports = handle;

/**
 * Get Resource Tiers
 */
const getAllResourceTiers = (e) => {
    let response = resource.getResourceTierAll();
    response.then(function (result) {
        e.sender.send('Resource:getAllResourceTiersOk', result);
    });
}

/**
 * Update many resources
 */
const updateResourceAll = (e, args) => {
    let response = resource.updateResourceAll(args);
    response.then((result) => {
        e.sender.send("Resource:updateResourceAllOK", result);
    })
}

/**
 * Insert Resource
 */
const addResource = (e, args) => {
    let response = resource.addResource(args.ResourceName, args.ResourceTierID);
    response.then((result) => {
        console.log(result);
        e.sender.send("Resource:addResourceOK", result);
    })
}

/**
 * Delete Resource
 */
const deleteResourceById = (e, args) => {
    okDeleteResource = true;
    args.forEach(arg => {
        let response = resource.deleteResourceById(arg);
        response.then((result) => {
            if (!result) {
                okDeleteResource = false;
            }
        })
    });

    e.sender.send("Resource:deleteResourceByIdOk", okDeleteResource);
}