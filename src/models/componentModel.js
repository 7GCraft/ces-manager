module.exports = class Component {
    /**
     * Constructor for component objects.
     * @param {Number} componentId must be an integer.
     * @param {String} componentName must be a string.
     * @param {ComponentType} componentType must be a component type object.
     * @param {Number} regionId must be an integer.
     * @param {Number} facilityId must be an integer.
     * @param {Number|String|null} value must either be an integer, string or null.
     * @param {Number} activationTime must be an integer.
     * @param {Boolean} isChild must be a boolean.
     * @param {Number|null} parentId must be an integer or null.
     */
    constructor (componentId, componentName, componentType, regionId, facilityId, value, activationTime, isChild, parentId = null) {
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

        this.activationTime = activationTime;

        // parse is child
        if (typeof(isChild) !== 'boolean') {
            if (isChild === 0) {
                this.isChild = false;
            } else {
                this.isChild = true;
            }
        } else {
            this.isChild = isChild;
        }

        if (this.isChild === true) {
            this.parentId = parentId;

            this.parent = null;
        }
    }
}