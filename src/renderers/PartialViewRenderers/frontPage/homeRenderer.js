$(function () {
    //Trigger next season calculation
    btnNextSeason_onclick();
})

function btnNextSeason_onclick() {
    $('#btnNextSeason').on('click', () => {
        ipcRenderer.send('General:advanceToNextSeason');
        ipcRenderer.once('General:advanceToNextSeasonOK', (e, res) => {
            if (res) {
                $('#nextSeasonMessage').append('<div>This is working</div>')
            }
            else {
                $('#nextSeasonMessage').append('<div>Error not working</div>')
            }
            $('#mdlAdvanceSeason').modal('toggle');
        })
    })
}