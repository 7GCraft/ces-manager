module.exports = class RegionListItem {
    /**
     * Constructor for region list item objects.
     * @todo change property names to follow convention.
     * @todo refactor to use method to calculate total income and food.
     * @param {Number} RegionID must be an integer.
     * @param {String} RegionName must be a string.
     * @param {Number} RegionTotalIncome must be an integer.
     * @param {Number} RegionTotalFood must be an integer.
     * @param {String} StateName must be a string.
     */
    constructor(RegionID, RegionName, RegionTotalIncome, RegionTotalFood, StateName) {
        this.RegionID = RegionID;
        this.RegionName = RegionName;
        this.RegionTotalIncome = RegionTotalIncome;
        this.RegionTotalFood = RegionTotalFood;
        this.StateName = StateName;
    }
}