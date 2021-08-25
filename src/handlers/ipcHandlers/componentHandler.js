const { ipcMain, webContents, BrowserWindow } = require('electron');
const facility = require('../../services/facilityServices');
const component = require('../../services/componentServices');

const handle = () => {
    ipcMain.on('Component:getComponentList', getComponentList);
    ipcMain.on('Component:getComponentByFacilityId', getComponentByFacilityId);
    ipcMain.on('Component:getUsedComponentList', getUsedComponentListByRegion);
    ipcMain.on('Component:getUsedResourceComponentListByState', getUsedResourceComponentListByState);
    ipcMain.on('Component:getMultipleUsedResourceComponentListByState', getMultipleUsedResourceComponentListByState);
    ipcMain.on('Component:getUnusedComponentList', getUnusedComponentList);
    ipcMain.on('Component:getAllComponentTypes', getAllComponentTypes);
    ipcMain.on('Component:addComponent', addComponent);
    ipcMain.on('Component:updateComponent', updateComponent);
    ipcMain.on('Component:deleteComponent', deleteComponent);
    ipcMain.on('Component:openBulkInsertPage', openBulkInsertPage);
    ipcMain.on('Component:addMultipleComponents', addMultipleComponents);
}
module.exports = {
    handle
};

/**
 * Get components by Region Id
 */
const getComponentList = (e, arg) => {
    let response = component.getComponentByRegionId(arg);
    response.then(result => {
        return component.sortChildComponents(result);
    })
        .then(result2 => {
            e.sender.send("Component:getComponentListOK", result2);
        })
}

/**
 * Get Components by Facility Id
 */
const getComponentByFacilityId = (e, arg) => {
    let response = facility.getFacilityByRegionId(arg);
    response.then(result => {
        if (result != null) {
            return Promise.all((result.map(facility => {
                return component.getComponentByFacilityId(facility.facilityId)
                    .then(components => {
                        return component.sortChildComponents(components)
                            .then(sortedComponents => {
                                return sortedComponents;
                            })
                    })
            })));
        }
        else {
            return false;
        }
    }).then(results => {
        e.sender.send("Component:getComponentByFacilityIdOK", results);
    })
}

/**
 * Get used components by Region Id
 */
const getUsedComponentListByRegion = (e, arg) => {
    let response = component.getComponentFunctionalByRegionId(arg);
    response.then(result => {
        return component.sortChildComponents(result);
    })
    .then(result2 => {
        e.sender.send("Component:getUsedComponentListOK", result2);
    })
}

/**
 * Get used resource components by State Id
 */
const getUsedResourceComponentListByState = (e, arg) => {
    let response = component.getComponentResourceFunctionalByStateId(arg);
    response.then(result => {
        e.sender.send("Component:getUsedResourceComponentListByStateOK", result);
    })
}

/**
 * Get multiple used resource components by State Id
 */
const getMultipleUsedResourceComponentListByState = (e, args) => {
    let response = () => {
        return Promise.all(args.map(stateId => {
            return component.getComponentResourceFunctionalByStateId(stateId);
        }))
    }
    response().then(result => {
        e.sender.send('Component:getMultipleUsedResourceComponentListByStateOK', result);
    })
}

/**
 * Get unused components by Region Id
 */
const getUnusedComponentList = (e, arg) => {
    let response = component.getComponentUnusedByRegionId(arg);
    response.then(result => {
        return component.sortChildComponents(result);
    })
    .then(result2 => {
        e.sender.send("Component:getUnusedComponentListOK", result2);
    });
}

/**
 * Get component types
 */
const getAllComponentTypes = (e) => {
    let response = component.getComponentTypeAll();
    response.then(result => {
        e.sender.send("Component:getAllComponentTypesOK", result);
    })
}

/**
 * Insert Component
 */
const addComponent = (e, args) => {
    let response = component.addComponent(args);
    response.then(result => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Component:addComponentOK", result);
        });
    })
}

/**
 * Update Component
 */
const updateComponent = (e, args) => {
    let response = component.updateComponent(args);
    response.then(result => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Component:updateComponentOK", result);
        });
    })
}

/**
 * Delete Component
 */
const deleteComponent = (e, arg) => {
    let response = component.deleteComponentById(arg);
    response.then(result => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Component:deleteComponentOK", result);
        });
    })
}

/**
 * Open Bulk Insert Components Page with Region ID
 */
const openBulkInsertPage = (e, arg) => {
    let bulkInsertComponentsWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            additionalArguments: [arg]
        },
        title: 'Bulk Insert Components'
    });

    bulkInsertComponentsWindow.loadFile('src/views/region/component/bulkInsert.html');

    bulkInsertComponentsWindow.on('close', function () {
        bulkInsertComponentsWindow = null;
    });
}

/**
 * Add multiple components, primarily from bulk insert page
 */
const addMultipleComponents = (e, args) => {
    let response = component.addMultipleComponents(args);
    response.then(result => {
        let allWindows = webContents.getAllWebContents();
        allWindows.sort((a, b) => b - a);
        allWindows.forEach(win => {
            win.send("Component:addMultipleComponentsOK", result);
        });
    })
}