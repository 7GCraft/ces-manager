module.exports = class Facility {
    /**
     * Constructor for facility objects.
     * @param {Number} facilityId must be an integer.
     * @param {Number} regionId must be an integer.
     * @param {String} facilityName must be a string.
     * @param {Boolean|Number} isFunctional must be a boolean or integer.
     */
    constructor(facilityId, regionId, facilityName, isFunctional) {
        this.facilityId = facilityId;
        this.regionId = regionId;
        this.facilityName = facilityName;

        if (typeof(isFunctional) !== 'boolean') {
            if (isFunctional === 0) this.isFunctional = false;
            else this.isFunctional = true;
        } else {
            this.isFunctional = isFunctional;
        }
    }

    /**
     * Summarises the food, money, and resource output of the facility.
     * @param {Array} components must be an array of component objects.
     */
    summarise(components) {
        this.foodOutput = 0;
        this.moneyOutput = 0;
        this.resource = null;
        this.usedPopulation = 0;

        if (components !== null) {
            for (let component of components) {
                if (component.componentType.componentTypeId === 4) this.foodOutput += component.value;
                else if (component.componentType.componentTypeId === 5) this.moneyOutput += component.value;
                else if (component.componentType.componentTypeId === 3) this.resource = component.value;
                else if (component.componentType.componentTypeId === 1) this.usedPopulation += component.value;
            }
        }
    }
};