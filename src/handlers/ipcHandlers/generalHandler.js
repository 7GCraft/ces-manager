const { ipcMain } = require('electron');
const general = require('../../services/generalServices');

const handle = () => {
    ipcMain.on('General:AdvancingSeason', advanceSeason);
}
module.exports = handle;

const advanceSeason = (e) => {
    let response = general.advanceSeason();
    response.then(result => {
        e.sender.send("General:AdvancingSeasonOK", result)
    })
}