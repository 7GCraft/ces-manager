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

    let states = await stateServices.getStateAllByIdsWithoutTrade(stateIds);

    let components = await componentServices.getComponentFunctionalByIds(componentIds);

    let resourceTiers = await resourceServices.getResourceTierAll();

    if (states === null || components === null || resourceTiers === null) return null;

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
            let trader = new Trader(stateDict[stateKey].state, {resources: stateDict[stateKey].tradeAgreements[key]});

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

/**
 * Gets all trade agreements that the state of the given ID is part of.
 * @param {Number} stateId must be an integer.
 * @param {Boolean} returnsList must be a boolean.
 * @returns {Array} array of trade agreement objects if successful, null otherwise.
 */
const getTradeAgreementByStateId = async (stateId, returnsList = true) => {
    let rawTradeAgreementIds = await knex(constants.TABLE_TRADE_AGREEMENT_DETAIL)
        .distinct(constants.COLUMN_TRADE_AGREEMENT_ID)
        .where(constants.COLUMN_STATE_ID, stateId)
        .catch(e => {
            console.error(e);
        });
    
    if (rawTradeAgreementIds.length === 0) return null;

    let tradeAgreementIds = [];

    for (let rawTradeAgreementId of rawTradeAgreementIds) {
        tradeAgreementIds.push(rawTradeAgreementId.tradeAgreementId);
    }

    let rawTradeAgreementHeaders = await knex
        .select('*')
        .from(constants.TABLE_TRADE_AGREEMENT_HEADER)
        .whereIn(constants.COLUMN_TRADE_AGREEMENT_ID, tradeAgreementIds)
        .catch(e => {
            console.error(e);
        });
    
    let rawTradeAgreementDetails = await knex
        .select('*')
        .from(constants.TABLE_TRADE_AGREEMENT_DETAIL)
        .whereIn(constants.COLUMN_TRADE_AGREEMENT_ID, tradeAgreementIds)
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

    let states = await stateServices.getStateAllByIdsWithoutTrade(stateIds);

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
            let trader = new Trader(stateDict[stateKey].state, {resources: stateDict[stateKey].tradeAgreements[key]});

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

/**
 * Creates a new trade agreement.
 * @param {TradeAgreement} tradeAgreement must be a trade agreement object. Must have traders with resource components.
 * @returns {Boolean} true if successful, false otherwise.
 */
const addTradeAgreement = async (tradeAgreement) => {
    let resStatus = true;

    let tradeAgreementId = await knex
        .insert({
            desc: tradeAgreement.desc
        })
        .into(constants.TABLE_TRADE_AGREEMENT_HEADER)
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    tradeAgreementId = tradeAgreementId[0];

    if (!resStatus) return resStatus;

    const traders = tradeAgreement.traders;

    let promises = [];

    for (let trader of traders) {
        if (trader.resourceComponents !== null) {
            for (let resourceComponent of trader.resourceComponents) {
                let promise = knex
                    .insert({
                        tradeAgreementId: tradeAgreementId,
                        stateId: trader.state.stateId,
                        resourceComponentId: resourceComponent.componentId
                    })
                    .into(constants.TABLE_TRADE_AGREEMENT_DETAIL)
                    .catch(e => {
                        console.error(e);
                        resStatus = false;
                    });
    
                promises.push(promise);
            }
        }
    }

    await Promise.all(promises);

    return resStatus;
}

/**
 * Updates the information of a trade agreement.
 * @param {TradeAgreement} tradeAgreement must be a trade agreement object. Must have traders with resource components.
 * @returns {Boolean} true if successful, false otherwise.
 */
const updateTradeAgreement = async (tradeAgreement) => {
    let resStatus = true;

    await knex(constants.TABLE_TRADE_AGREEMENT_HEADER)
        .where({tradeAgreementId: tradeAgreement.tradeAgreementId})
        .update({
            desc: tradeAgreement.desc
        })
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    if (!resStatus) return resStatus;

    const traders = tradeAgreement.traders;

    let promises = [];

    for (let trader of traders) {
        await knex(constants.TABLE_TRADE_AGREEMENT_DETAIL)
            .where({tradeAgreementId: tradeAgreement.tradeAgreementId})
            .del()
            .catch(e => {
                console.error(e);
                resStatus = false;
            });

        if (!resStatus) break;

        if (trader.resourceComponents !== null) {
            for (let resourceComponent of trader.resourceComponents) {
                let promise = knex
                    .insert({
                        tradeAgreementId: tradeAgreementId,
                        stateId: trader.state.stateId,
                        resourceComponentId: resourceComponent.componentId
                    })
                    .into(constants.TABLE_TRADE_AGREEMENT_DETAIL)
                    .catch(e => {
                        console.error(e);
                        resStatus = false;
                    });
    
                promises.push(promise);
            }
        }
    }

    await Promise.all(promises);

    return resStatus;
}

/**
 * Deletes a trade agreement.
 * @param {Number} id must be an integer.
 * @returns {Boolean} true if successful, false otherwise.
 */
const deleteTradeAgreementById = async (id) => {
    let resStatus = true;

    await knex(constants.TABLE_TRADE_AGREEMENT_HEADER)
        .where({tradeAgreementId: id})
        .del()
        .catch(e => {
            console.error(e);
            resStatus = false;
        });
    
    await knex(constants.TABLE_TRADE_AGREEMENT_DETAIL)
        .where({tradeAgreementId: id})
        .del()
        .catch(e => {
            console.error(e);
            resStatus = false;
        });

    return resStatus;
}

exports.getTradeAgreementAll = getTradeAgreementAll;
exports.getTradeAgreementByStateId = getTradeAgreementByStateId;
exports.addTradeAgreement = addTradeAgreement;
exports.updateTradeAgreement = updateTradeAgreement;
exports.deleteTradeAgreementById = deleteTradeAgreementById;

// getTradeAgreementAll()
// .then(data => console.dir(data[0].traders));
// addTradeAgreement({
//     desc: "Test Trade Agreement",
//     traders: [
//         {
//             state: {
//                 stateID: 1
//             },
//             resourceComponents: [
//                 {
//                     componentId: 1
//                 },
//                 {
//                     componentId: 2
//                 }
//             ]
//         },
//         {
//             state: {
//                 stateID: 2
//             },
//             resourceComponents: [
//                 {
//                     componentId: 3
//                 }
//             ]
//         }
//     ]
// }).then(data => console.log(data));
// deleteTradeAgreementById(7);
// getTradeAgreementByStateId(8).then(data => console.log(data));