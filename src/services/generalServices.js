const config = require('./config.json');

const stateServices = require(config.paths.stateServices);
const regionServices = require(config.paths.regionServices);

/**
 * Advances the economy by one season.
 * Calculates the change in income and population of each state and region.
 * @returns {Boolean} true if successful, false otherwise.
 */
const advanceSeason = async () => {
    let resStatus = true;

    const states = await stateServices.getStateAll();

    if (states === null) resStatus = false;

    for (let state of states) {
        let seasonalIncome = state.TotalIncome;

        seasonalIncome -= state.expenses;

        await stateServices.updateStateTreasuryByStateId(state.stateID, state.treasuryAmt + seasonalIncome);

        let stateRegions = state.regions;

        for (let stateRegion of stateRegions) {
            stateRegion.calculateGrowth(state.BaseGrowth);
            await regionServices.updateRegionPopulation(stateRegion);
        }
    }

    return resStatus;
};

exports.advanceSeason = advanceSeason;