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

    /**
     * Summarises the secondary stats of the region.
     * @param {Array} facilities must be an array of facility objects.
     * @param {Number} baseGrowth must be a double.
     */
    summarise (facilities, baseGrowth = null) {
        this.totalIncome = 0;
        this.totalFoodProduced = 0;
        this.totalFoodConsumed = 0;
        this.productiveResources = [];
        this.expectedPopulationGrowth = 0;

        if (facilities !== null) {
            for (let facility of facilities) {
                if (facility.isFunctional) {
                    if (facility.foodOutput > 0) this.totalFoodProduced += facility.foodOutput;
                    else if (facility.foodOutput < 0) this.totalFoodConsumed += facility.foodOutput;
                    
                    this.totalIncome += facility.moneyOutput;
        
                    if (facility.resource !== null) {
                        this.productiveResources.push(facility.resource);
                    }
                }
            }
        }

        this.totalFoodAvailable = this.totalFoodProduced + this.totalFoodConsumed;
        if (baseGrowth !== null) {
            if (baseGrowth > 0) this.expectedPopulationGrowth = Math.round(baseGrowth * this.development.growthModifier);
            else if (baseGrowth < 0) this.expectedPopulationGrowth = Math.round(baseGrowth * this.development.shrinkageModifier);
        }
    }

    /**
     * Calculates the growth of the region.
     * @param {Number} baseGrowth must be an double.
     */
    calculateGrowth(baseGrowth) {
        if (baseGrowth > 0) this.expectedPopulationGrowth = Math.round(baseGrowth * this.development.growthModifier);
        else if (baseGrowth < 0) this.expectedPopulationGrowth = Math.round(baseGrowth * this.development.shrinkageModifier);
    }
}