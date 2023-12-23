export default {
  getStateTrade(context, payload) {
    window.ipcRenderer.send("Trade:getTradeAgreementsByStateId", payload);
    window.ipcRenderer.once("Trade:getTradeAgreementsByStateIdOK", (e, res) => {
      console.log("is this of real", res);
      context.commit("setViewedStateTradeAgreements", res);
    });
  },
};
