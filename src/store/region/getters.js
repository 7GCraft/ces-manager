export default {
  getRegionList(region) {
    return region.regionList;
  },
  getBiomeList(region) {
    return region.biomeList;
  },
  getDevLevelList(region) {
    return region.developmentLevelList;
  },
  getCorruptionLevelList(region) {
    return region.corruptionLevelList;
  },
  getViewedRegionInfo(region){
    return region.viewedRegion.info;
  }
};
