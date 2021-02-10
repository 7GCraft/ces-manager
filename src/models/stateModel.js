module.exports = class State {
    constructor(stateID, stateName, treasuryAmt, desc) {
        /**
         * @todo refactor
         */
        this.stateID = stateID;
        this.stateName = stateName;
        this.treasuryAmt = treasuryAmt;
        this.desc = desc;
        this.TotalIncome = 0;
        this.TotalFoodProduced = 0;
        this.TotalFoodConsumed = 0;
        this.TotalFoodAvailable = this.TotalFoodProduced - this.TotalFoodConsumed;
        this.AvgDevLevel = 0;
        this.ProductiveResources = [];
    }
}