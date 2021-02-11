const config = require('../services/config.json');
const constants = config.constants;
const Biome = require(config.paths.biomeModel);
const Corruption = require(config.paths.corruptionModel);
const Development = require(config.paths.developmentModel);

module.exports = class Region {
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
    }

    summarise (facilities) {
        this.totalIncome = 0;
        this.totalFoodProduced = 0;
        this.totalFoodConsumed = 0;
        this.productiveResources = [];
        this.expectedPopulationGrowth = 0;

        if (facilities !== null) {
            for (let facility of facilities) {
                if (facility.foodOutput > 0) this.totalFoodProduced += facility.foodOutput;
                else if (facility.foodOutput < 0) this.totalFoodConsumed += facility.foodOutput;
                
                this.totalIncome += facility.moneyOutput;
    
                if (facility.resource !== null) {
                    if (facility.isFunctional) this.productiveResources.push(facility.resource);
                }
            }
        }

        this.totalFoodAvailable = this.totalFoodProduced + this.totalFoodConsumed;

        /**
         * @todo integrate with state
         */
        this.expectedPopulationGrowth = this.totalFoodAvailable / 5;

        if (this.expectedPopulationGrowth > 0) this.expectedPopulationGrowth *= this.development.growthModifier;
        else if (this.expectedPopulationGrowth < 0) this.expectedPopulationGrowth *= this.development.shrinkageModifier;

        this.expectedPopulationGrowth = Math.round(this.expectedPopulationGrowth);
    }
}