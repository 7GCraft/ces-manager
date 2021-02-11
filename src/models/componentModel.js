module.exports = class Component {
    /**
     * Constructor for component objects.
     * @param {*} componentId must be an integer.
     * @param {*} componentName must be a string.
     * @param {*} componentType must be a component type object.
     * @param {*} regionId must be an integer.
     * @param {*} facilityId must be an integer.
     * @param {*} value must either be an integer, string or null.
     * @param {*} children must be an array of component objects.
     * @param {*} activationTime must be an integer.
     * @param {*}
     */
    constructor (componentId, componentName, componentType, regionId, facilityId, value, children, activationTime, isChild, parentId = null) {
        this.componentId = componentId;
        this.componentName = componentName;
        this.componentType = componentType;
        this.regionId = regionId;
        this.facilityId = facilityId;

        // parse value
        if (value !== null) {
            let tokens = value.split(';');

            switch (tokens[0]) {
                // integer
                case 'i':
                    this.value = parseInt(tokens[1]);
                    break;
                // string
                case 's':
                    this.value = tokens[1];
                    break;
                default:
                    this.value = value;
            }
        } else {
            this.value = value;
        }

        this.children = children;
        this.activationTime = activationTime;
        this.isChild = isChild;

        if (isChild === true) {
            this.parentId = parentId;
        }
    }
}