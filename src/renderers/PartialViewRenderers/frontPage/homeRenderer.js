$(function () {
    //Trigger next season calculation
    btnNextSeason_onclick();
})

function btnNextSeason_onclick() {
    $('#btnNextSeason').on('click', () => {
        ipcRenderer.send('General:advancingSeason');
        ipcRenderer.once('General:advancingSeasonOK', (e, res) => {
            $('#mdlAdvanceSeason').modal('hide');
            if (res) {
                $('#nextSeasonMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully advanced to next season</div>');
            }
            else {
                $('#nextSeasonMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when advancing season</div>');
            }
        })
    })
}