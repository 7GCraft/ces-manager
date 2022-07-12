const { ipcMain, webContents } = require("electron");
const facility = require("../../services/facilityServices");

const handle = () => {
  ipcMain.on("Facility:getFacilitiesByRegion", getFacilitiesByRegion);
  ipcMain.on("Facility:getFacilitiesByState", getFacilitiesByState);
  ipcMain.on("Facility:addFacility", addFacility);
  ipcMain.on("Facility:updateFacility", updateFacility);
  ipcMain.on("Facility:deleteFacility", deleteFacility);
};
module.exports = {
  handle,
};

/**
 * Get facilities by Region Id
 */
const getFacilitiesByRegion = (e, arg) => {
  let response = facility.getFacilityByRegionId(arg);
  response.then((result) => {
    e.sender.send("Facility:getFacilitiesByRegionOK", result);
  });
};

/**
 * Insert Facility
 */
const addFacility = (e, args) => {
  let response = facility.addFacility(args);
  response.then((result) => {
    let allWindows = webContents.getAllWebContents();
    allWindows.sort((a, b) => b - a);
    allWindows.forEach((win) => {
      win.send("Facility:addFacilityOK", result);
    });
  });
};

/**
 * Update Facility
 */
const updateFacility = (e, args) => {
  let response = facility.updateFacility(args);
  response.then((result) => {
    let allWindows = webContents.getAllWebContents();
    allWindows.sort((a, b) => b - a);
    allWindows.forEach((win) => {
      win.send("Facility:updateFacilityOK", result);
    });
  });
};

/**
 * Delete Facility
 */
const deleteFacility = (e, args) => {
  if (args["deleteOnly"]) {
    let response = facility.deleteFacilityById(args["facilityId"]);
    response.then((result) => {
      let allWindows = webContents.getAllWebContents();
      allWindows.sort((a, b) => b - a);
      allWindows.forEach((win) => {
        win.send("Facility:deleteFacilityOK", result);
      });
    });
  } else {
    let response = facility.destroyFacilityById(args["facilityId"]);
    response.then((result) => {
      let allWindows = webContents.getAllWebContents();
      allWindows.sort((a, b) => b - a);
      allWindows.forEach((win) => {
        win.send("Facility:deleteFacilityOK", result);
      });
    });
  }
};
