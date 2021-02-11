module.exports = class ComponentType {
    /**
     * Constructor for component type objects.
     * @param {*} componentTypeId must be an integer.
     * @param {*} componentTypeName must be a string.
     */
    constructor(componentTypeId, componentTypeName) {
        this.componentTypeId = componentTypeId;
        this.componentTypeName = componentTypeName;
    }
}