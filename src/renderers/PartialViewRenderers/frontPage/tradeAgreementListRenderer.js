$(function () {
  //get all trade agreements
  getAllTradeAgreements();
  //Add update Trade Agreements
  addUpdateAgreement_handler();
  // Get all states for state ddl
  tradeAgreement_getStateListForDropdown();
  // delete trade agreement
  frmDeleteAgreement_onSubmit();
  //Handle events from main page
  tradeAgreement_pageMain_eventHandler();
});

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

    if (res != null) {
      res.forEach((agreement) => {
        let firstHasDisabledResource = false;
        let secondHasDisabledResource = false;

        // console.log(agreement);
        let resourceProducedFirstState = () => {
          let resourceStr1 = "";
          if (agreement.traders[0].resources !== null) {
            agreement.traders[0].resources.forEach((resource) => {
              if (resource !== null)
                resourceStr1 += resource.ResourceName + ", ";
              else firstHasDisabledResource = true;
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
              if (resource != null)
                resourceStr2 += resource.ResourceName + ", ";
              else secondHasDisabledResource = true;
            });
            resourceStr2 = resourceStr2.slice(0, -2);
          } else {
            resourceStr2 = "No traded resources.";
          }
          return resourceStr2;
        };

        let resources1 = "<td>" + resourceProducedFirstState() + "</td>";
        let resources2 = "<td>" + resourceProducedSecondState() + "</td>";

        if (firstHasDisabledResource)
          resources1 =
            '<td class="bg-danger text-white">' +
            resourceProducedFirstState() +
            "</td>";
        if (secondHasDisabledResource)
          resources2 =
            '<td class="bg-danger text-white">' +
            resourceProducedSecondState() +
            "</td>";

        $("#tradeAgreements").append(
          `<tr id="trade-${agreement.tradeAgreementId}">` +
            "<td>" +
            agreement.traders[0].state.stateName +
            "</td>" +
            "<td>" +
            resourceProducedFirstState() +
            "</td>" +
            "<td>" +
            parseFloat(agreement.traders[0].tradePower * 100).toFixed(1) +
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
            parseFloat(agreement.traders[1].tradePower * 100).toFixed(1) +
            "%</td>" +
            "<td>" +
            parseFloat(agreement.traders[1].tradeValue).toFixed(2) +
            "</td>" +
            '<td class="trade-description">' +
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
            .attr("data-trade-agreement-id", agreement.tradeAgreementId)
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
    }
  });
}

function tradeAgreement_getStateListForDropdown() {
  ipcRenderer.send("State:getStateList");
  ipcRenderer.once("State:getStateListOK", function (e, res) {
    $("#selFirstState").empty();
    $("#selSecondState").empty();

    $("#selFirstState").append(
      "<option disabled selected value> -- Select first state -- </option>"
    );
    $("#selSecondState").append(
      "<option disabled selected value> -- Select second state -- </option>"
    );

    res.forEach((state) => {
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

function addUpdateAgreement_handler() {
  $("#btnAddAgreement").on("click", () => {
    $("#selTradeAgreement").val($("#selTradeAgreement option:first").val());
    $("#selFirstState").val($("#selFirstState option:first").val());
    $("#selFirstResource").empty();
    $("#selSecondState").val($("#selSecondState option:first").val());
    $("#selSecondResource").empty();
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

    let tradeAgreementId = $("#selTradeAgreement")
      .find(":selected")
      .data("tradeAgreementId");
    let firstStateId = $("#selTradeAgreement")
      .find(":selected")
      .data("firstStateId");
    let secondStateId = $("#selTradeAgreement")
      .find(":selected")
      .data("secondStateId");

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

    let description = $(`#trade-${tradeAgreementId}`)
      .find(".trade-description")
      .text();
    $("#txtAgreementDesc").val(description);
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
      ipcRenderer.send("Trade:addTradeAgreement", tradeAgreementObj);
      ipcRenderer.once("Trade:addTradeAgreementOK", (e, res) => {
        if (res) {
          $("#tradeAgreementMessage").append(
            '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Successfully added trade agreement</div>'
          );
          $("#tradeAgreements").empty();
          $("#selTradeAgreements").empty();

          getAllTradeAgreements();
          tradeAgreement_getStateListForDropdown();
        } else {
          $("#tradeAgreementMessage").append(
            '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Something went wrong when adding trade agreement</div>'
          );
        }

        $("#mdlAddUpdateAgreement").modal("toggle");
      });
    } else {
      tradeAgreementObj["tradeAgreementId"] = tradeAgreementId;
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

function tradeAgreement_pageMain_eventHandler() {
  ipcRenderer.on("Resource:updateResourceAllOK", (e, res) => {
    if (res) {
      getAllTradeAgreements();
    }
  });
}
