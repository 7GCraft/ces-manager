const config = require('../services/config.json');
const constants = config.constants;
const Biome = require(config.paths.biomeModel);
const Corruption = require(config.paths.corruptionModel);
const Development = require(config.paths.developmentModel);

module.exports = class Region {
    // constructor(regionId, regionName, stateId, stateName, totalIncome, totalFoodProduced, totalFoodConsumed, devLevel, devName, population, productiveResources, expectedPopulationGrowth, corruptionLevel, corruptionName, corruptionRate, biomeId, biome, desc) {
    //     this.regionId = regionId;
    //     this.regionName = regionName;
    //     this.stateId = stateId;
    //     this.stateName = stateName;
    //     this.totalIncome = totalIncome;
    //     this.totalFoodProduced = totalFoodProduced;
    //     this.totalFoodConsumed = totalFoodConsumed;
    //     this.totalFoodAvailable = this.totalFoodProduced - this.totalFoodConsumed;
    //     this.devLevel = devLevel;
    //     this.devName = devName;
    //     this.population = population;
    //     this.productiveResources = productiveResources;
    //     this.expectedPopulationGrowth = expectedPopulationGrowth;
    //     this.corruptionLevel = corruptionLevel;
    //     this.corruptionName = corruptionName;
    //     this.corruptionRate = corruptionRate;
    //     this.biomeId = biomeId;
    //     this.biome = biome;
    //     this.desc = desc;
    // }

    constructor(regionId, regionName, state, biome, {development = null, population = null, corruption = null, desc = null} = { }) {
        this.regionId = regionId;
        this.regionName = regionName;
        this.state = state;
        this.biome = biome;

        if (development === null) {
            this.development = new Development(1, 'Hamlet', 10, 1, 2, 0.5);
            this.population = 1;
        } else {
            this.development = development;

            if (population === null) {
                switch (this.development.developmentId) {
                    case 1:
                        this.population = 1;
                        break;
                    case 2:
                        this.population = 11;
                        break;
                    case 3:
                        this.population = 21;
                        break;
                    case 4:
                        this.population = 41;
                        break;
                    case 5:
                        this.population = 61;
                        break;
                    case 6:
                        this.population = 81
                        break;
                }
            } else {
                this.population = population;
            }
        }

        if (corruption === null) {
            this.corruption = new Corruption(1, 'Nonexistent', 0);
        } else {
            this.corruption = corruption;
        }

        if (desc === null) {
            desc = null;
        } else {
            this.desc = desc;
        }

        this.totalIncome = 0;
        this.totalFoodProduced = 0;
        this.totalFoodConsumed = 0;
        this.totalFoodAvailable = this.totalFoodProduced - this.totalFoodConsumed;
        this.productiveResources = [];
        this.expectedPopulationGrowth = 0;
    }
}