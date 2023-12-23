const { ipcMain, webContents } = require("electron");
const resource = require("../../services/resourceServices");

const handle = () => {
  ipcMain.on("Resource:getAllResourceTiers", getAllResourceTiers);
  ipcMain.on("Resource:getAllResourcesByStateId", getAllResourcesByStateId);
  ipcMain.on("Resource:updateResourceAll", updateResourceAll);
  ipcMain.on("Resource:addResource", addResource);
  ipcMain.on("Resource:deleteResourceById", deleteResourceById);
};
module.exports = {
  handle,
};

/**
 * Get Resource Tiers
 */
const getAllResourceTiers = (e) => {
  let response = resource.getResourceTierAll();
  response.then(function (result) {
    e.sender.send("Resource:getAllResourceTiersOK", result);
  });
};

/**
 * Get All resources inside a state by given state id
 */
const getAllResourcesByStateId = (e, arg) => {
  let response = resource.getAllResourcesByStateId(arg);
  response.then(function (result) {
    e.sender.send("Resource:getAllResourcesByStateIdOK", result);
  });
};

/**
 * Update many resources
 */
const updateResourceAll = (e, args) => {
  let response = resource.updateResourceAll(args);
  response.then((result) => {
    let allWindows = webContents.getAllWebContents();
    allWindows.sort((a, b) => b - a);
    allWindows.forEach((win) => {
      win.send("Resource:updateResourceAllOK", result);
    });
  });
};

/**
 * Insert Resource
 */
const addResource = (e, args) => {
  let response = resource.addResource(args.ResourceName, args.ResourceTierID);
  response.then((result) => {
    let allWindows = webContents.getAllWebContents();
    allWindows.sort((a, b) => b - a);
    allWindows.forEach((win) => {
      win.send("Resource:addResourceOK", result);
    });
  });
};

/**
 * Delete Resource
 */
const deleteResourceById = (e, args) => {
  okDeleteResource = true;
  args.forEach((arg) => {
    let response = resource.deleteResourceById(arg);
    response.then((result) => {
      if (!result) {
        okDeleteResource = false;
      }
    });
  });

  let allWindows = webContents.getAllWebContents();
  allWindows.sort((a, b) => b - a);
  allWindows.forEach((win) => {
    win.send("Resource:deleteResourceByIdOK", okDeleteResource);
  });
};
