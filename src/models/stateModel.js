module.exports = class State {
  constructor(
    stateID,
    stateName,
    treasuryAmt,
    desc,
    expenses,
    adminRegionModifier
  ) {
    this.stateID = stateID;
    this.stateName = stateName;
    this.treasuryAmt = treasuryAmt;
    this.desc = desc;
    this.expenses = expenses;
    this.adminRegionModifier = adminRegionModifier;
  }

  /**
   * Summarises the secondary stats of the state.
   * @param {Array} regions must be an array of region objects.
   */
  summarise(regions, tradeAgreements = null) {
    this.TotalIncome = 0;
    this.TotalFoodProduced = 0;
    this.TotalFoodConsumed = 0;
    this.TotalPopulation = 0;
    this.AvgDevLevel = 0;
    this.ProductiveResources = [];
    this.regions = regions;

    if (regions !== null) {
      let totalDevLevel = 0;
      let regionNum = regions.length;

      for (let region of regions) {
        this.TotalIncome += region.totalIncome;
        this.TotalFoodProduced += region.totalFoodProduced;
        this.TotalFoodConsumed += region.totalFoodConsumed;
        this.TotalPopulation += region.population;
        totalDevLevel += region.development.developmentId;
        this.ProductiveResources = this.ProductiveResources.concat(
          region.productiveResources
        );
      }

      this.AvgDevLevel = Math.round(totalDevLevel / regionNum);
    }

    if (tradeAgreements !== null) {
      for (let tradeAgreement of tradeAgreements) {
        for (let trader of tradeAgreement.traders) {
          if (trader.state.stateID === this.stateID) {
            this.TotalIncome += trader.tradeValue;
          }
        }
      }
    }

    this.TotalFoodAvailable = this.TotalFoodProduced - this.TotalFoodConsumed;
    this.BaseGrowth = this.TotalFoodAvailable / 5;

    if (regions !== null) {
      for (let region of regions) {
        region.calculateGrowth(this.BaseGrowth, regions.length);
      }
    }
  }
};
