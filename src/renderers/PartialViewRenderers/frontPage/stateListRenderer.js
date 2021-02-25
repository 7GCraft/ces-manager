$(function () {
    //Load all states into State List
    getStateList();
    //Add state
    frmAddState_onSubmit();
});

function getStateList() {
    ipcRenderer.send('State:getStateList');
    ipcRenderer.once('State:getStateListOK', function (e, res) {
        $('#stateContainer').append('<ul id="ulStateList"></ul>');

        res.forEach(state => {
            $('#ulStateList').append('<li><a class="states" href="#" data-id="State' + state.stateID + '"  onclick=openStatePage(this.getAttribute("data-id"))>' + state.stateName + '</a></li>');
        });
    });
}

function frmAddState_onSubmit() {
    $('#frmAddState').on('submit', function (e) {
        e.preventDefault();

        let stateObj = {};

        stateObj["stateName"] = $('#txtStateName').val();
        stateObj["treasuryAmt"] = ($('#nmbTreasury').val() == "") ? 0 : parseInt($('#nmbTreasury').val());
        stateObj["expenses"] = ($('#nmbExpenses').val() == "") ? 0 : parseInt($('#nmbExpenses').val());
        stateObj["desc"] = $('#txtDescription').val();

        ipcRenderer.send('State:addState', stateObj);
        ipcRenderer.once('State:addStateOK', (e, res) => {
            if (res) {
                $('#stateListMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added state</div>')
                $('#ulStateList').remove();
                getStateList();
            }
            else {
                $('#stateListMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding state</div>')
            }

            $('#mdlAddState').modal('toggle');
        });
    });
}

function openStatePage(ID) {
    let stateID = ID.replace('State', '');
    ipcRenderer.send('State:openStatePage', stateID);
}