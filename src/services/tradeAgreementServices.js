const config = require('./config.json');
const constants = config.constants;
const knex = require('knex')(config.knexConfig);

const componentServices = require(config.paths.componentServices);
const resourceServices = require(config.paths.resourceServices);
const stateServices = require(config.paths.stateServices);

const TradeAgreement = require(config.paths.tradeAgreementModel);
const Trader = require(config.paths.traderModel);

/**
 * Gets all trade agreements.
 * @param {Boolean} returnsList must be a boolean.
 * @returns {Array} array of trade agreement objects if successful, null otherwise.
 */
const getTradeAgreementAll = async (returnsList = true) => {
    let rawTradeAgreementHeaders = await knex
        .select('*')
        .from(constants.TABLE_TRADE_AGREEMENT_HEADER)
        .catch(e => {
            console.error(e);
        });
    
    let rawTradeAgreementDetails = await knex
        .select('*')
        .from(constants.TABLE_TRADE_AGREEMENT_DETAIL)
        .catch(e => {
            console.error(e);
        });

    if (rawTradeAgreementHeaders.length === 0 || rawTradeAgreementDetails.length === 0) return null;

    let stateDict = { };
    let componentDict = { };

    let stateIds = [];
    let componentIds = [];

    for (let rawTradeAgreementDetail of rawTradeAgreementDetails) {
        let key = rawTradeAgreementDetail.tradeAgreementId;

        if (stateDict[rawTradeAgreementDetail.stateId] === undefined) {
            stateDict[rawTradeAgreementDetail.stateId] = { 
                state: null,
                tradeAgreements: {
                    [rawTradeAgreementDetail.tradeAgreementId]: []
                }
             };
            stateIds.push(rawTradeAgreementDetail.stateId);
        } else if (stateDict[rawTradeAgreementDetail.stateId].tradeAgreements[key] === undefined) {
            stateDict[rawTradeAgreementDetail.stateId].tradeAgreements[key] = [];
        }

        if (componentDict[rawTradeAgreementDetail.resourceComponentId] === undefined) {
            componentDict[rawTradeAgreementDetail.resourceComponentId] = {
                stateId: rawTradeAgreementDetail.stateId,
                tradeAgreementId: rawTradeAgreementDetail.tradeAgreementId,
                resource: null
            };
            componentIds.push(rawTradeAgreementDetail.resourceComponentId);
        }
    }

    let states = await stateServices.getStateAllByIds(stateIds);

    let components = await componentServices.getComponentFunctionalByIds(componentIds);

    let resourceTiers = await resourceServices.getResourceTierAll();

    if (states === null || components === null) return null;

    for (let state of states) {
        stateDict[state.stateID.toString()].state = state;
    }

    for (let component of components) {
        for (let resourceTier of resourceTiers) {
            if (resourceTier.ResourceTierID === component.value.ResourceTierID) {
                component.value.setTradePower(resourceTier.ResourceTierTradePower);
            }
        }
        componentDict[component.componentId].resource = component.value;
    }

    for (let key of Object.keys(componentDict)) {
        let component = componentDict[key];
        stateDict[component.stateId.toString()].tradeAgreements[component.tradeAgreementId].push(component.resource);
    }

    let tradeAgreements = { };

    for (let rawTradeAgreementHeader of rawTradeAgreementHeaders) {
        let tradeAgreement = new TradeAgreement(
            rawTradeAgreementHeader.tradeAgreementId,
            [],
            rawTradeAgreementHeader.desc
        );

        tradeAgreements[rawTradeAgreementHeader.tradeAgreementId] = tradeAgreement;
    }

    for (let stateKey of Object.keys(stateDict)) {
        for (let key of Object.keys(stateDict[stateKey].tradeAgreements)) {
            let trader = new Trader(stateDict[stateKey].state, stateDict[stateKey].tradeAgreements[key]);

            tradeAgreements[key].traders.push(trader);
        }
    }

    let tradeAgreementList = [];

    for (let key of Object.keys(tradeAgreements)) {
        tradeAgreementList.push(tradeAgreements[key]);
    }

    for (let tradeAgreement of tradeAgreementList) {
        let totalValue = 0;

        for (let trader of tradeAgreement.traders) {
            totalValue += trader.state.TotalIncome;
        }

        for (let trader of tradeAgreement.traders) {
            trader.setTradeValue(totalValue - trader.state.TotalIncome);
        }
    }

    if (returnsList) return tradeAgreementList;
    return tradeAgreements;
}

exports.getTradeAgreementAll = getTradeAgreementAll;

// getTradeAgreementAll()
// .then(data => console.dir(data[0].traders));