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
   * @param {Number} Population must be an integer.
   * @param {Number} UsedPopulation must be an integer
   * @param {Number} DevelopmentId must be an integer.
   */
  constructor(
    RegionID,
    RegionName,
    RegionTotalIncome,
    RegionTotalFood,
    StateName,
    Population,
    UsedPopulation,
    DevelopmentId,
  ) {
    this.RegionID = RegionID;
    this.RegionName = RegionName;
    this.RegionTotalIncome = RegionTotalIncome;
    this.RegionTotalFood = RegionTotalFood;
    this.StateName = StateName;
    this.Population = Population;
    this.UsedPopulation = UsedPopulation;
    this.DevelopmentId = DevelopmentId;
  }
};
