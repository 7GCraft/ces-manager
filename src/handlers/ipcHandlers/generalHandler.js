const { ipcMain } = require('electron');
const general = require('../../services/generalServices');

const handle = () => {
    ipcMain.on('General:advancingSeason', advanceSeason);
    ipcMain.on('General:getCurrentSeason', getCurrentSeason);
}
module.exports = {
    handle
};

const advanceSeason = (e) => {
    let response = general.advanceSeason();
    response.then(result => {
        e.sender.send("General:advancingSeasonOK", result);
    })
    .catch(error => {
        console.error(error);
        e.sender.send("General:advancingSeasonOK", false);
    });
}

const getCurrentSeason = (e) => {
    let response = general.getCurrentSeason();
    response.then(result => {
        e.sender.send("General:getCurrentSeasonOK", result);
    })
    .catch(error => {
        console.error(error);
        e.sender.send("General:getCurrentSeasonOK", null);
    })
}