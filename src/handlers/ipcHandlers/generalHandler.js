const { ipcMain } = require('electron');
const general = require('../../services/generalServices');

const handle = () => {
    ipcMain.on('General:advancingSeason', advanceSeason);
}
module.exports = handle;

const advanceSeason = (e) => {
    let response = general.advanceSeason();
    response.then(result => {
        e.sender.send("General:advancingSeasonOK", result);
    })
    .catch(error => {
        console.error(error);
        let result = false;
        e.sender.send("General:advancingSeasonOK", result);
    });
}