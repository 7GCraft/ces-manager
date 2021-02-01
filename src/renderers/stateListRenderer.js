// const electron = require('electron');
//const ipc = electron.ipcRenderer;

$(function(){
    
    console.log("STATELIST loaded");

    ipcRenderer.send('getStateList');
    ipcRenderer.on('getStateListOK', function(e, res){
        res.forEach(state => {
            $('#ulStateList').append('<li><a class="states" href="#" data-id="'+state.StateID+'"  onclick=openStatePage(this.getAttribute("data-id"))>'+ state.StateName + '</a></li>')
        });
    });

})

function openStatePage(ID){
    alert(ID)
}