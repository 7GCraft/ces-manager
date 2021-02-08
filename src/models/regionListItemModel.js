module.exports = class RegionListItem {
    constructor(RegionID, RegionName, RegionTotalIncome, RegionTotalFood, StateName) {
        this.RegionID = RegionID;
        this.RegionName = RegionName;
        this.RegionTotalIncome = RegionTotalIncome;
        this.RegionTotalFood = RegionTotalFood;
        this.StateName = StateName;
    }
}