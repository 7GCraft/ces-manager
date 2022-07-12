module.exports = class ResourceTier {
  constructor(
    ResourceTierID,
    ResourceTierName,
    ResourceTierTradePower,
    Resources
  ) {
    this.ResourceTierID = ResourceTierID;
    this.ResourceTierName = ResourceTierName;
    this.ResourceTierTradePower = ResourceTierTradePower;
    this.Resources = Resources;
  }
};
