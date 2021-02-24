const general = require('../../services/generalServices');

const advanceSeason = (e) =>{
    let response = general.advanceSeason();
    response.then(result =>{
        e.sender.send("Advancing Season",result)
    })

}
ipcMain.on('General:Advancing Season',advanceSeason);