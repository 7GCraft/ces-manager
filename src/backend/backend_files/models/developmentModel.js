module.exports = class Development {
    constructor(developmentId, developmentName, populationCap, militaryTier, growthModifier, shrinkageModifier) {
        this.developmentId = developmentId;
        this.developmentName = developmentName;
        this.populationCap = populationCap;
        this.militaryTier = militaryTier;
        this.growthModifier = growthModifier;
        this.shrinkageModifier = shrinkageModifier;
    }
}