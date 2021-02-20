const { ipcMain, BrowserWindow } = require('electron');
const facility = require('../../services/facilityServices');
const component = require('../../services/componentServices');

const handle = () => {
    ipcMain.on('Component:getComponentList', getComponentList);
    ipcMain.on('Component:getComponentByFacilityId', getComponentByFacilityId);
    ipcMain.on('Component:getUsedComponentList', getUsedComponentList);
    ipcMain.on('Component:getUnusedComponentList', getUnusedComponentList);
    ipcMain.on('Component:getAllComponentTypes', getAllComponentTypes);
    ipcMain.on('Component:addComponent', addComponent);
    ipcMain.on('Component:updateComponent', updateComponent);
    ipcMain.on('Component:deleteComponent', deleteComponent);
}
module.exports = handle;

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
const getUsedComponentList = (e, arg) => {
    let response = component.getComponentFunctionalByRegionId(arg);
    response.then(result => {
        return component.sortChildComponents(result);
    })
        .then(result2 => {
            e.sender.send("Component:getUsedComponentListOK", result2);
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
        })
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
        e.sender.send("Component:addComponentOK", result);
    })
}

/**
 * Update Component
 */
const updateComponent = (e, args) => {
    let response = component.updateComponent(args);
    response.then(result => {
        e.sender.send("Component:updateComponentOK", result);
    })
}

/**
 * Delete Component
 */
const deleteComponent = (e, arg) => {
    let response = component.deleteComponentById(arg);
    response.then(result => {
        e.sender.send("Component:deleteComponentOK", result);
    })
}