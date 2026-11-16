const { ipcMain, webContents } = require('electron');
const getFacilityService = () => require('../../services/facilityServices');

const handle = () => {
    ipcMain.on('Facility:getFacilitiesByRegion', getFacilitiesByRegion);
    ipcMain.on('Facility:addFacility', addFacility);
    ipcMain.on('Facility:updateFacility', updateFacility);
    ipcMain.on('Facility:deleteFacility', deleteFacility);
    ipcMain.on("Facility:getFacilitiesByState", getFacilitiesByState)
}
module.exports = {
    handle
};

/**
 * Get facilities by Region Id
 */
const getFacilitiesByRegion = (e, arg) => {
    let response = getFacilityService().getFacilitiesByRegionId(arg);
    response.then(result => {
        e.sender.send("Facility:getFacilitiesByRegionOK", result);
    });
}

const getFacilitiesByState = (e,arg) => {
    let response = getFacilityService().getFacilitiesByStateId(arg);
    response.then((result) => {
        e.sender.send("Facility:getFacilitiesByStateOK", result);
    });
}

/**
 * Insert Facility
 */
const addFacility = (e, args) => {
    let response = getFacilityService().addFacility(args);
    response.then(result => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Facility:addFacilityOK", result);
        });
    });
}

/**
 * Update Facility
 */
const updateFacility = (e, args) => {
    let response = getFacilityService().updateFacility(args);
    response.then(result => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Facility:updateFacilityOK", result);
        });
    });
}

/**
 * Delete Facility
 */
const deleteFacility = (e, args) => {
    if (args['deleteOnly']) {
        let response = getFacilityService().deleteFacilityById(args['facilityId']);
        response.then(result => {
            let allWindows = webContents.getAllWebContents();
            allWindows.sort((a, b) => b - a);
            allWindows.forEach(win => {
                win.send("Facility:deleteFacilityOK", result);
            });
        });
    }
    else {
        let response = getFacilityService().destroyFacilityById(args['facilityId']);
        response.then(result => {
            let allWindows = webContents.getAllWebContents();
            allWindows.sort((a, b) => b - a);
            allWindows.forEach(win => {
                win.send("Facility:deleteFacilityOK", result);
            });
        });
    }
}
