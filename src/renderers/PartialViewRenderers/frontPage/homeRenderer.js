$(function () {
    //Get Current Season
    getCurrentSeason();
    //Trigger next season calculation
    btnNextSeason_onclick();
})

function getCurrentSeason() {
    ipcRenderer.send('General:getCurrentSeason');
    ipcRenderer.once('General:getCurrentSeasonOK', (e, res) => {
        if (res === null) {
            $('#currentSeasonWrapper').hide();
            $('#nextSeasonMessage').append('<div class="alert alert-danger">Something went wrong when retrieving current season</div>');
        }
        else {
            $('#currentSeasonWrapper').show();
            $('#lblCurrentSeason').text(res.season);
            $('#lblCurrentYear').text(res.year);
        }
    });
}

function btnNextSeason_onclick() {
    $('#btnNextSeason').on('click', () => {
        ipcRenderer.send('General:advancingSeason');
        ipcRenderer.once('General:advancingSeasonOK', (e, res) => {
            $('#mdlAdvanceSeason').modal('hide');
            if (res !== false) {
                console.log(res);
                var blob = new Blob([res[1]], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", })
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                var fileName = res[0];
                link.download = fileName;
                link.click();
                link.remove();
                $('#nextSeasonMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully advanced to next season</div>');
            }
            else {
                $('#nextSeasonMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when advancing season</div>');
            }
            getCurrentSeason();
        })
    })
}