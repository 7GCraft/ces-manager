module.exports = class Resource {
    constructor(ResourceID, ResourceName, ResourceTierID) {
        this.ResourceID = ResourceID;
        this.ResourceName = ResourceName;
        this.ResourceTierID = ResourceTierID;
    }

    /**
     * Sets the trade power of the resource.
     * @param {Number} tradePower must be a double.
     */
    setTradePower(tradePower) {
        this.tradePower = tradePower;
    }
}