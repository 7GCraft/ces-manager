module.exports = class Resource {
    constructor(ResourceID, ResourceName, ResourceTierID) {
        this.ResourceID = ResourceID;
        this.ResourceName = ResourceName;
        this.ResourceTierID = ResourceTierID;
    }
}