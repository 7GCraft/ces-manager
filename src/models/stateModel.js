module.exports = class State {
    constructor(StateID, StateName, TreasuryAmt, Desc, TotalIncome, TotalFoodProduced, TotalFoodConsumed, AvgDevLevel, ProductiveResources) {
        this.StateID = StateID;
        this.StateName = StateName;
        this.TreasuryAmt = TreasuryAmt;
        this.Desc = Desc;
        this.TotalIncome = TotalIncome;
        this.TotalFoodProduced = TotalFoodProduced;
        this.TotalFoodConsumed = TotalFoodConsumed;
        this.TotalFoodAvailable = this.TotalFoodProduced - this.TotalFoodConsumed;
        this.AvgDevLevel = AvgDevLevel;
        this.ProductiveResources = ProductiveResources;
    }
}