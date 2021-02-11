module.exports = class ComponentType {
    /**
     * Constructor for component type objects.
     * @param {Number} componentTypeId must be an integer.
     * @param {String} componentTypeName must be a string.
     */
    constructor(componentTypeId, componentTypeName) {
        this.componentTypeId = componentTypeId;
        this.componentTypeName = componentTypeName;
    }
}