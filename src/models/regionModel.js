module.exports = class Region {
    constructor(regionId, regionName, stateId, stateName, totalIncome, totalFoodProduced, totalFoodConsumed, devLevel, devName, population, productiveResources, expectedPopulationGrowth, corruptionLevel, corruptionName, corruptionRate, biomeId, biome, desc) {
        this.regionId = regionId;
        this.regionName = regionName;
        this.stateId = stateId;
        this.stateName = stateName;
        this.totalIncome = totalIncome;
        this.totalFoodProduced = totalFoodProduced;
        this.totalFoodConsumed = totalFoodConsumed;
        this.totalFoodAvailable = this.totalFoodProduced - this.totalFoodConsumed;
        this.devLevel = devLevel;
        this.devName = devName;
        this.population = population;
        this.productiveResources = productiveResources;
        this.expectedPopulationGrowth = expectedPopulationGrowth;
        this.corruptionLevel = corruptionLevel;
        this.corruptionName = corruptionName;
        this.corruptionRate = corruptionRate;
        this.biomeId = biomeId;
        this.biome = biome;
        this.desc = desc;
    }
}