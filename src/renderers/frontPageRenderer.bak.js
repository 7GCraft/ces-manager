const electron = require("electron");
const { ipcRenderer } = electron;
const $ = require("jquery");

$(function () {
  loadFrontPage();
  handleButtonandSubmitCalls();
});

//Functions that load everything to front page are placed here
function loadFrontPage() {
  //Load all states into State List
  getStateList();
  //Get All Resources
  getAllResourceTiers();
  //Get All regions by State ID
  getAllRegionsByStateId();
  //get all trade agreements
  getAllTradeAgreements();
}

function handleButtonandSubmitCalls() {
  //Add state
  frmAddState_onSubmit();

  //Add Region
  frmAddRegion_onSubmit();

  //Add update Trade Agreements
  addUpdateAgreement_handler();

  // delete trade agreement
  frmDeleteAgreement_onSubmit();

  //Update Resources (resources.html)
  btnUpdateResources_onClick();
  //Add Resource
  frmAddResource_onSubmit();
  //Delete Resource
  frmDeleteResource_onSubmit();
}

/**
 * Loading related functions
 */
function getStateList() {
  ipcRenderer.send("State:getStateList");
  ipcRenderer.once("State:getStateListOK", function (e, res) {
    $("#stateContainer").append('<ul id="ulStateList"></ul>');

    $("#selFirstState").append(
      "<option disabled selected value> -- Select first state -- </option>"
    );
    $("#selSecondState").append(
      "<option disabled selected value> -- Select second state -- </option>"
    );
    res.forEach((state) => {
      $("#ulStateList").append(
        '<li><a class="states" href="#" data-id="State' +
          state.stateID +
          '"  onclick=openStatePage(this.getAttribute("data-id"))>' +
          state.stateName +
          "</a></li>"
      );

      $("#selState").append(
        $("<option>", {
          value: state.stateID,
          text: state.stateName,
        })
      );

      $("#selFirstState").append(
        $("<option>", {
          value: state.stateID,
          text: state.stateName,
        })
      );

      $("#selSecondState").append(
        $("<option>", {
          value: state.stateID,
          text: state.stateName,
        })
      );
    });
  });
}

function getAllResourceTiers() {
  ipcRenderer.send("Resource:getAllResourceTiers");
  ipcRenderer.once("Resource:getAllResourceTiersOk", function (e, res) {
    //console.log(res);
    res.forEach((resourceTier) => {
      $("#listsOfResourceTiers").append(
        '<div class="resourceContainer"><h4>' +
          resourceTier.ResourceTierName +
          "(" +
          resourceTier.ResourceTierTradePower * 100 +
          "%)" +
          '</h4><ul class="resourceSortable" id="ResourceTier' +
          resourceTier.ResourceTierID +
          '"><li ondragover="dragOver(event)"></li></ul></div>'
      );

      resourceTier.Resources.forEach((resource) => {
        $("#ResourceTier" + resourceTier.ResourceTierID).append(
          '<li class="individualResource" draggable="true" ondragover="dragOver(event)" ondragstart="dragStart(event)" id="Resource' +
            resource.ResourceID +
            '">' +
            resource.ResourceName +
            "</li>"
        );

        $("#selResourceDelete").append(
          $("<option>", {
            value: resource.ResourceID,
            text: resource.ResourceName,
          })
        );
      });

      $("#selResourceTier").append(
        $("<option>", {
          value: resourceTier.ResourceTierID,
          text: resourceTier.ResourceTierName,
        })
      );
    });
  });
}

function getAllRegionsByStateId() {
  $("#selState").empty();
  $("#selFirstState").empty();
  $("#selSecondState").empty();
  $("#selBiome").empty();
  $("#selDevelopment").empty();
  $("#selCorruption").empty();
  ipcRenderer.send("Region:getAllRegionsByStateId");
  ipcRenderer.once("Region:getAllRegionsByStateIdOK", (e, res) => {
    res.forEach((state) => {
      if (Array.isArray(state.Regions) && state.Regions.length) {
        $("#listOfRegionsByState").append(
          '<div class="regionContainer"><h5>' +
            state.stateName +
            '</h5><ul class="regionsList" id="StateRegion' +
            state.stateID +
            '"></ul></div>'
        );

        state.Regions.forEach((region) => {
          $("#StateRegion" + state.stateID).append(
            '<li class="individualRegion" id="Region' +
              region.RegionID +
              '"><a href=#  onclick=openRegionPage(this.parentNode.getAttribute("id"))>' +
              region.RegionName +
              '</a><span class="totalIncome">' +
              region.RegionTotalIncome +
              '</span><span class="totalFood">' +
              region.RegionTotalFood +
              "</span></li>"
          );
        });
      }
    });
  });

  ipcRenderer.send("Region:getBiomesForAdd");
  ipcRenderer.once("Region:getBiomesForAddOK", (e, res) => {
    console.log(res);

    res.forEach((biome) => {
      $("#selBiome").append(
        $("<option>", {
          value: biome.biomeId,
          text: biome.biomeName,
        })
      );
    });
  });

  ipcRenderer.send("Region:getDevelopmentForAdd");
  ipcRenderer.once("Region:getDevelopmentForAddOK", (e, res) => {
    res.forEach((dev) => {
      $("#selDevelopment").append(
        $("<option>", {
          value: dev.developmentId,
          text: dev.developmentName,
        })
      );
    });
  });

  ipcRenderer.send("Region:getCorruptionForAdd");
  ipcRenderer.once("Region:getCorruptionForAddOK", (e, res) => {
    res.forEach((corruption) => {
      $("#selCorruption").append(
        $("<option>", {
          value: corruption.corruptionId,
          text: corruption.corruptionName,
        })
      );
    });
  });
}

function getAllTradeAgreements() {
  ipcRenderer.send("Trade:getAllTradeAgreements");
  ipcRenderer.once("Trade:getAllTradeAgreementsOK", (e, res) => {
    // emptying previous contents
    $("#tradeAgreements").empty();
    $("#selTradeAgreement").empty();
    $("#selAgreementDelete").empty();

    $("#selTradeAgreement").append(
      "<option disabled selected value> -- Select a trade agreement -- </option>"
    );
    res.forEach((agreement) => {
      console.log(agreement);
      let resourceProducedFirstState = () => {
        let resourceStr1 = "";
        if (agreement.traders[0].resources !== null) {
          agreement.traders[0].resources.forEach((resource) => {
            resourceStr1 += resource.ResourceName + ", ";
          });
          resourceStr1 = resourceStr1.slice(0, -2);
        } else {
          resourceStr1 = "No traded resources.";
        }
        return resourceStr1;
      };

      let resourceProducedSecondState = () => {
        let resourceStr2 = "";
        if (agreement.traders[1].resources !== null) {
          agreement.traders[1].resources.forEach((resource) => {
            resourceStr2 += resource.ResourceName + ", ";
          });
          resourceStr2 = resourceStr2.slice(0, -2);
        } else {
          resourceStr2 = "No traded resources.";
        }
        return resourceStr2;
      };

      $("#tradeAgreements").append(
        "<tr>" +
          "<td>" +
          agreement.traders[0].state.stateName +
          "</td>" +
          "<td>" +
          resourceProducedFirstState() +
          "</td>" +
          "<td>" +
          agreement.traders[0].tradePower * 100 +
          "%</td>" +
          "<td>" +
          parseFloat(agreement.traders[0].tradeValue).toFixed(2) +
          "</td>" +
          "<td>" +
          agreement.traders[1].state.stateName +
          "</td>" +
          "<td>" +
          resourceProducedSecondState() +
          "</td>" +
          "<td>" +
          agreement.traders[1].tradePower * 100 +
          "%</td>" +
          "<td>" +
          parseFloat(agreement.traders[1].tradeValue).toFixed(2) +
          "</td>" +
          "<td>" +
          agreement.desc +
          "</td>" +
          +"</tr>"
      );

      $("#selTradeAgreement").append(
        $("<option />")
          .val(agreement.tradeAgreementId)
          .text(
            agreement.traders[0].state.stateName +
              " - " +
              agreement.traders[1].state.stateName
          )
          .attr("data-first-state-id", agreement.traders[0].state.stateID)
          .attr("data-second-state-id", agreement.traders[1].state.stateID)
      );

      // appends all existing trade agreements to the trade agreements to delete select
      $("#selAgreementDelete").append(
        $("<option />")
          .val(agreement.tradeAgreementId)
          .text(
            agreement.traders[0].state.stateName +
              " - " +
              agreement.traders[1].state.stateName
          )
      );
    });
  });
}

/**
 * End of Loading related functions
 */

/**
 * Start of Button and Submit event related functions
 */

function frmAddState_onSubmit() {
  $("#frmAddState").on("submit", function (e) {
    e.preventDefault();

    let stateObj = {};

    stateObj["stateName"] = $("#txtStateName").val();
    stateObj["treasuryAmt"] =
      $("#nmbTreasury").val() == "" ? 0 : parseInt($("#nmbTreasury").val());
    stateObj["expenses"] =
      $("#nmbExpenses").val() == "" ? 0 : parseInt($("#nmbExpenses").val());
    stateObj["desc"] = $("#txtDescription").val();

    ipcRenderer.send("State:addState", stateObj);
    ipcRenderer.once("State:addStateOK", (e, res) => {
      if (res) {
        $("#stateListMessage").append(
          '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added state</div>'
        );
        $("#ulStateList").remove();
        getStateList();
      } else {
        $("#stateListMessage").append(
          '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding state</div>'
        );
      }

      $("#mdlAddState").modal("toggle");
    });
  });
}

function frmAddRegion_onSubmit() {
  $("#frmAddRegion").on("submit", (e) => {
    e.preventDefault();

    let regionObj = {};

    let isValid = true;
    const regionName = $("#txtRegionName").val();
    const population = $("#nmbPopulation").val();

    if (regionName == null || regionName == "") {
      isValid = false;
      $("#txtRegionName").addClass("is-invalid");
    } else {
      $("#txtRegionName").removeClass("is-invalid");
    }

    if (population == null || population == "") {
      isValid = false;
      $("#nmbPopulation").addClass("is-invalid");
      $("#nmbPopulationMessage").text("Population cannot be empty");
    } else if (parseInt(population) <= 0) {
      isValid = false;
      $("#nmbPopulation").addClass("is-invalid");
      $("#nmbPopulationMessage").text(
        "Population cannot be less or equal to zero"
      );
    } else {
      $("#nmbPopulation").removeClass("is-invalid");
    }

    if (!isValid) {
      return;
    }

    regionObj["regionName"] = $("#txtRegionName").val();
    regionObj["state"] = { stateId: parseInt($("#selState").val()) };
    regionObj["corruption"] = {
      corruptionId: parseInt($("#selCorruption").val()),
    };
    regionObj["biome"] = { biomeId: parseInt($("#selBiome").val()) };
    regionObj["development"] = {
      developmentId: parseInt($("#selDevelopment").val()),
    };
    regionObj["population"] = parseInt($("#nmbPopulation").val());
    regionObj["desc"] = $("#txtDescRegion").val();
    regionObj["taxRate"] = parseFloat($("#nmbTaxRate").val());

    ipcRenderer.send("Region:addRegion", regionObj);
    ipcRenderer.once("Region:addRegionOK", (e, res) => {
      if (res) {
        $("#regionListMessage").append(
          '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added region</div>'
        );
        $("#listOfRegionsByState").empty();
        getAllRegionsByStateId();
      } else {
        $("#regionListMessage").append(
          '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding region</div>'
        );
      }
      $("#mdlAddRegion").modal("toggle");
    });
  });
}

function addUpdateAgreement_handler() {
  $("#btnAddAgreement").on("click", () => {
    $("#selTradeAgreement").val($("#selTradeAgreement option:first").val());
    $("#selFirstState").val($("#selFirstState option:first").val());
    $("#selSecondState").val($("#selSecondState option:first").val());
    $("#txtAgreementDesc").val("");

    $("#selTradeAgreementField").hide();
    $("#agreementFields").show();
  });

  $("#btnUpdateAgreement").on("click", () => {
    $("#selTradeAgreement").val($("#selTradeAgreement option:first").val());
    $("#selFirstState").val($("#selFirstState option:first").val());
    $("#selSecondState").val($("#selSecondState option:first").val());
    $("#txtAgreementDesc").val("");

    $("#selTradeAgreementField").show();
    $("#agreementFields").hide();
  });

  $("#selTradeAgreement").on("change", () => {
    $("#agreementFields").show();

    let firstStateId = $("#selTradeAgreement")
      .find(":selected")
      .data("firstStateId");
    let secondStateId = $("#selTradeAgreement")
      .find(":selected")
      .data("secondStateId");

    console.log(secondStateId);

    $("#selFirstState").val(firstStateId);
    $("#selSecondState").val(secondStateId);

    $("#selFirstResource").empty();
    $("#selSecondResource").empty();

    let stateIds = [firstStateId, secondStateId];

    ipcRenderer.send(
      "Component:getMultipleUsedResourceComponentListByState",
      stateIds
    );
    ipcRenderer.once(
      "Component:getMultipleUsedResourceComponentListByStateOK",
      (e, res) => {
        if (res[0] != null) {
          res[0].forEach((resourceComponent) => {
            $("#selFirstResource").append(
              $("<option>", {
                value: resourceComponent.componentId,
                text: resourceComponent.value.ResourceName,
              })
            );
          });
        }
        if (res[1] != null) {
          res[1].forEach((resourceComponent) => {
            $("#selSecondResource").append(
              $("<option>", {
                value: resourceComponent.componentId,
                text: resourceComponent.value.ResourceName,
              })
            );
          });
        }
      }
    );
  });

  $("#selFirstState").on("change", () => {
    $("#selFirstResource").empty();
    ipcRenderer.send(
      "Component:getUsedResourceComponentListByState",
      $("#selFirstState").val()
    );
    ipcRenderer.once(
      "Component:getUsedResourceComponentListByStateOK",
      (e, res) => {
        if (res != null) {
          res.forEach((resourceComponent) => {
            $("#selFirstResource").append(
              $("<option>", {
                value: resourceComponent.componentId,
                text: resourceComponent.value.ResourceName,
              })
            );
          });
        }
      }
    );
  });

  $("#selSecondState").on("change", () => {
    $("#selSecondResource").empty();
    ipcRenderer.send(
      "Component:getUsedResourceComponentListByState",
      $("#selSecondState").val()
    );
    ipcRenderer.once(
      "Component:getUsedResourceComponentListByStateOK",
      (e, res) => {
        if (res != null) {
          res.forEach((resourceComponent) => {
            $("#selSecondResource").append(
              $("<option>", {
                value: resourceComponent.componentId,
                text: resourceComponent.value.ResourceName,
              })
            );
          });
        }
      }
    );
  });

  $("#frmAddUpdateAgreement").on("submit", (e) => {
    e.preventDefault();

    let tradeAgreementId = $("#selTradeAgreement").val();
    let firstStateId = parseInt($("#selFirstState").val());
    let secondStateId = parseInt($("#selSecondState").val());
    let firstResourceRawComponents = $("#selFirstResource").val();
    let secondResourceRawComponents = $("#selSecondResource").val();
    let description = $("#txtAgreementDesc").val();

    let firstResourceComponents = () => {
      let componentArray = [];
      if (firstResourceRawComponents.length > 0) {
        firstResourceRawComponents.forEach((componentId) => {
          let componentObj = { componentId: parseInt(componentId) };
          componentArray.push(componentObj);
        });
      } else {
        componentArray = null;
      }
      return componentArray;
    };

    let secondResourceComponents = () => {
      let componentArray = [];
      if (secondResourceRawComponents.length > 0) {
        secondResourceRawComponents.forEach((componentId) => {
          let componentObj = { componentId: parseInt(componentId) };
          componentArray.push(componentObj);
        });
      } else {
        componentArray = null;
      }
      return componentArray;
    };
    let tradeAgreementObj = {};

    tradeAgreementObj["desc"] = description;
    tradeAgreementObj["traders"] = [
      {
        state: { stateId: firstStateId },
        resourceComponents: firstResourceComponents(),
      },
      {
        state: { stateId: secondStateId },
        resourceComponents: secondResourceComponents(),
      },
    ];

    if (tradeAgreementId == null) {
      //console.log(tradeAgreementObj);
      ipcRenderer.send("Trade:addTradeAgreement", tradeAgreementObj);
      ipcRenderer.once("Trade:addTradeAgreementOK", (e, res) => {
        if (res) {
          $("#tradeAgreementMessage").append(
            '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added trade agreement</div>'
          );
          $("#tradeAgreements").empty();
          $("#selTradeAgreements").empty();

          getAllTradeAgreements();
        } else {
          $("#tradeAgreementMessage").append(
            '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding trade agreement</div>'
          );
        }

        $("#mdlAddUpdateAgreement").modal("toggle");
      });
    } else {
      tradeAgreementObj["tradeAgreementId"] = tradeAgreementId;
      //console.log(tradeAgreementObj);
      ipcRenderer.send("Trade:updateTradeAgreement", tradeAgreementObj);
      ipcRenderer.once("Trade:updateTradeAgreementOK", (e, res) => {
        if (res) {
          $("#tradeAgreementMessage").append(
            '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated trade agreement</div>'
          );

          getAllTradeAgreements();
        } else {
          $("#tradeAgreementMessage").append(
            '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating trade agreement</div>'
          );
        }

        $("#mdlAddUpdateAgreement").modal("toggle");
      });
    }
  });
}

/**
 * Handles deleting a trade agreement.
 */
function frmDeleteAgreement_onSubmit() {
  $("#frmDeleteAgreement").on("submit", (e) => {
    e.preventDefault();

    let selectedTradeAgreement = $("#selAgreementDelete").val();
    ipcRenderer.send("Trade:deleteTradeAgreement", selectedTradeAgreement);
    ipcRenderer.once("Trade:deleteTradeAgreementOK", (e, res) => {
      if (res) {
        $("#tradeAgreementMessage").append(
          '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully deleted trade agreement</div>'
        );

        getAllTradeAgreements();
      } else {
        $("#tradeAgreementMessage").append(
          '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting trade agreement</div>'
        );
      }

      $("#mdlDeleteAgreement").modal("toggle");
    });
  });
}

function btnUpdateResources_onClick() {
  $("#btnUpdateResources").on("click", function (e) {
    let resourceJsonObj = [];
    let resourceTiers = $("#listsOfResourceTiers").find(".resourceSortable");

    $.each(resourceTiers, (i, val) => {
      let resourceTierID = $(val).attr("id").replace("ResourceTier", "");
      let resources = $(val).find(".individualResource");

      $.each(resources, (j, val2) => {
        let resourceID = $(val2).attr("id").replace("Resource", "");
        let resourceName = $(val2).text();

        resource = {};
        resource["ResourceID"] = resourceID;
        resource["ResourceName"] = resourceName;
        resource["ResourceTierID"] = resourceTierID;

        resourceJsonObj.push(resource);
      });
    });

    //console.log(resourceJsonObj);

    ipcRenderer.send("Resource:updateResourceAll", resourceJsonObj);
    ipcRenderer.once("Resource:updateResourceAllOK", (e, res) => {
      if (res) {
        $("#resourceMessage").append(
          '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully updated resources</div>'
        );
      } else {
        $("#resourceMessage").append(
          '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when updating resources</div>'
        );
      }
    });
  });
}

function frmAddResource_onSubmit() {
  $("#frmAddResource").on("submit", (e) => {
    e.preventDefault();

    let newResourceObj = {};

    let resourceTierID = $("#selResourceTier").val();
    let resourceName = $("#txtResourceName").val();

    newResourceObj["ResourceTierID"] = resourceTierID;
    newResourceObj["ResourceName"] = resourceName;

    ipcRenderer.send("Resource:addResource", newResourceObj);
    ipcRenderer.once("Resource:addResourceOK", (e, res) => {
      if (res) {
        $("#resourceMessage").append(
          '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added resource</div>'
        );
        $(".resourceContainer").remove();
        getAllResourceTiers();
      } else {
        $("#resourceMessage").append(
          '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding resource</div>'
        );
      }

      $("#mdlAddResource").modal("toggle");
    });
  });
}

function frmDeleteResource_onSubmit() {
  $("#frmDeleteResource").on("submit", (e) => {
    e.preventDefault();

    let selectedResources = $("#selResourceDelete").val();
    ipcRenderer.send("Resource:deleteResourceById", selectedResources);
    ipcRenderer.once("Resource:deleteResourceByIdOk", (e, res) => {
      if (res) {
        $("#resourceMessage").append(
          '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully deleted resources</div>'
        );
        $(".resourceContainer").remove();
        getAllResourceTiers();
      } else {
        $("#resourceMessage").append(
          '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when deleting resources</div>'
        );
      }

      $("#mdlDeleteResource").modal("toggle");
    });
  });
}

/**
 * End of Button and Submit event related functions
 */
//Called in home.html
ipcRenderer.once;

//Called in getStateList()
function openStatePage(ID) {
  let stateID = ID.replace("State", "");
  //alert(stateID);
  ipcRenderer.send("State:openStatePage", stateID);
}

//called on region click

$("#btnSeason").on("click", () => {
  ipcRenderer.send("General:AdvancingSeason");
  ipcRenderer.once("General:AdvancingSeason", (e, res) => {
    if (res) {
      $("#nextSeasonMessage").append("<div>This is working</div>");
    } else {
      $("#nextSeasonMessage").append("<div>Error not working</div>");
    }
  });
});
