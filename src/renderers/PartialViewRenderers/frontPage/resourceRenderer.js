$(function () {
    //Get All Resources
    getAllResourceTiers();
    // Update Resources
    btnUpdateResources_onClick();
    // Add Resource
    frmAddResource_onSubmit();
    // Delete Resource
    frmDeleteResource_onSubmit();
});

function getAllResourceTiers() {
    ipcRenderer.send('Resource:getAllResourceTiers');
    ipcRenderer.once('Resource:getAllResourceTiersOk', function (e, res) {
        res.forEach(resourceTier => {
            $('#listsOfResourceTiers').append('<div class="resourceContainer"><h4>' + resourceTier.ResourceTierName + '(' + resourceTier.ResourceTierTradePower * 100 + '%)' + '</h4><ul class="resourceSortable" id="ResourceTier' + resourceTier.ResourceTierID + '"><li ondragover="dragOver(event)"></li></ul></div>')

            resourceTier.Resources.forEach(resource => {
                $('#ResourceTier' + resourceTier.ResourceTierID).append('<li class="individualResource" draggable="true" ondragover="dragOver(event)" ondragstart="dragStart(event)" id="Resource' + resource.ResourceID + '">' + resource.ResourceName + '</li>')

                $('#selResourceDelete').append($('<option>', {
                    value: resource.ResourceID,
                    text: resource.ResourceName
                }));
            });

            $('#selResourceTier').append($('<option>', {
                value: resourceTier.ResourceTierID,
                text: resourceTier.ResourceTierName
            }));
        });
    });
}

function btnUpdateResources_onClick() {
    $('#btnUpdateResources').on('click', function (e) {
        let resourceJsonObj = [];
        let resourceTiers = $('#listsOfResourceTiers').find('.resourceSortable');

        $.each(resourceTiers, (i, val) => {
            let resourceTierID = $(val).attr('id').replace('ResourceTier', '');
            let resources = $(val).find('.individualResource');

            $.each(resources, (j, val2) => {
                let resourceID = $(val2).attr('id').replace('Resource', '');
                let resourceName = $(val2).text();

                resource = {}
                resource["ResourceID"] = resourceID;
                resource["ResourceName"] = resourceName;
                resource["ResourceTierID"] = resourceTierID;

                resourceJsonObj.push(resource);
            })
        })

        ipcRenderer.send("Resource:updateResourceAll", resourceJsonObj);
        ipcRenderer.once("Resource:updateResourceAllOK", (e, res) => {
            if (res) {
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated resources</div>')
            }
            else {
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating resources</div>')
            }
        })
    });
}

function frmAddResource_onSubmit() {
    $('#frmAddResource').on('submit', (e) => {
        e.preventDefault();

        let newResourceObj = {};

        let resourceTierID = $('#selResourceTier').val();
        let resourceName = $('#txtResourceName').val();

        newResourceObj["ResourceTierID"] = resourceTierID
        newResourceObj["ResourceName"] = resourceName


        ipcRenderer.send("Resource:addResource", newResourceObj);
        ipcRenderer.once("Resource:addResourceOK", (e, res) => {
            if (res) {
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added resource</div>')
                $('.resourceContainer').remove();
                getAllResourceTiers();
            }
            else {
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding resource</div>')
            }

            $('#mdlAddResource').modal('toggle');
        })
    });
}

function frmDeleteResource_onSubmit() {
    $('#frmDeleteResource').on('submit', (e) => {
        e.preventDefault();

        let selectedResources = $('#selResourceDelete').val();
        ipcRenderer.send("Resource:deleteResourceById", selectedResources);
        ipcRenderer.once("Resource:deleteResourceByIdOk", (e, res) => {
            if (res) {
                $('#resourceMessage').append('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully deleted resources</div>')
                $('.resourceContainer').remove();
                getAllResourceTiers();
            }
            else {
                $('#resourceMessage').append('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting resources</div>')
            }

            $('#mdlDeleteResource').modal('toggle');
        });

    })
}