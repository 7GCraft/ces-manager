<template>
  <div class="mt-4 flex flex-col space-y-2 max-w-4xl mx-auto my-1 mb-4">
    <h4
      class="text-2xl mb-4 font-bold border border-2 rounded-full w-1/3 mx-auto bg-havelockBlue text-white py-1 tracking-wider"
    >
      State Military
    </h4>
    <div class="grid grid-cols-2 gap-5">
      <div
        v-for="(regionFacility, regionName) in stateMilitaryFacilities"
        :key="regionName"
        className="flex flex-col w-fit"
      >
        <div class="flex flex-row h-fit">
          <h4 className="bg-black text-white p-3 text-2xl items-center justify-center flex ">
            {{ regionName }}
          </h4>
          <div class="flex-col flex border border-black border-b-0 bg-gray-100">
            <div
              v-for="(facility, index) in regionFacility"
              :key="index"
              class=" h-full flex items-center"
            >
              <h4
                class=" flex items-center  justify-center text-md border-2 border-gray-600 bg-gray-500 text-white h-full px-2 "
              >
                {{ facility.facilityName }}
              </h4>
            </div>
          </div>
          <div class="flex-col flex border border-gray-400 bg-gray-100">
            <div
              v-for="(facility, index) in regionFacility"
              :key="index"
              class="border-2 border-gray-400 h-full"
            >
              <h4 class="text-xs flex items-center justify-center h-full px-2">
                {{ findEffect(facility.facilityName.toLowerCase()) }}
              </h4>
            </div>
          </div>
        </div>
        <div class="border border-black flex flex-col text-left font-semibold text-sm w-full ">   
          <h1 class="border border-b-black px-2">Army: {{listRegionArmyRecruitment(regionFacility)}}</h1>
          <h1 class="px-2">Navy: {{ processNavalFacilities(regionFacility)}}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const _ = require("lodash");
export default {
  props: ["state-facility-data"],
  mounted() {
    setTimeout(() => {
     
    }, 500);
  },
  computed: {
    stateMilitaryFacilities() {
      let data = this.stateFacilityData;
      let newData = _.merge(data.economy, data["food and resources"]);
      console.log(newData, "rossikaya gundam");
      for (let regionObj in newData) {
        newData[regionObj] = newData[regionObj].filter((facility) =>
          facility.facilityName.includes("Port"),
        );
        if (newData[regionObj].length <= 0) {
          delete newData[regionObj];
        }
      }

      console.log(newData, "chars redemption");
      newData = _.merge(newData, data.military);
      return newData;
    },
  },
  methods: {
    findEffect(name) {
      console.log(name.includes("military port"), "IRS REPORT");

      switch (true) {
        case name.includes("barrack"):
          return "Unlock Melee Infantry, +1 Recruitment";
        case name.includes("stable"):
          return "Unlock Cavalry, +1 Recruitment";
        case name.includes("archer"):
          return "Unlock Missile Infantry, +1 Recruitment";
        case name.includes("smith"):
          return "Unlock Tier II and Tier III recruitment(ground)";
        case name.includes("siege"):
          return "Unlock Siege Weapons, +1 Recruitment";
        case name.includes("trade"):
          return "Unlock Light Ships";
        case name.includes("trade port"):
          return "Unlock Light Ships";
        case name.includes("military port"):
          return "Unlock Light, Medium, and Heavy Ships, +1 Naval Recruitment";
      }
    },

    listRegionArmyRecruitment(facilities){
    let recruitmentCount = 0;
    let unlockInfantry = false;
    let unlockCavalry = false;
    let unlockArchers = false;
    let unlockSiegeWeapons = false;
    let unlockAllTier = false;

    // Count the number of each facility
    const facilityCounts = {
        barracks: 0,
        stables: 0,
        archeryGround: 0,
        siegeWorkshop: 0,
        blacksmith: 0
    };

    facilities.forEach(facility => {
      const facilityName = facility.facilityName.toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
            .replace(/\s+/g, '');
        if (Object.prototype.hasOwnProperty.call(facilityCounts, facilityName)) {
            facilityCounts[facilityName]++;
        }
    });

    // Calculate recruitment and unit unlocks
    if (facilityCounts.barracks > 0 ||  facilityCounts.stables > 0 || facilityCounts.archeryGround > 0 || facilityCounts.siegeWorkshop > 0) {
        recruitmentCount = 1; // base recruitment
        if (facilityCounts.barracks > 0) {
            recruitmentCount += facilityCounts.barracks;
            unlockInfantry = true;
        }
        if (facilityCounts.stables > 0) {
            recruitmentCount += facilityCounts.stables;
            unlockCavalry = true;
        }
        if (facilityCounts.archeryGround > 0) {
            recruitmentCount += facilityCounts.archeryGround;
            unlockArchers = true;
        }
        if (facilityCounts.siegeWorkshop > 0) {
            recruitmentCount += facilityCounts.siegeWorkshop;
            unlockSiegeWeapons = true;
        }
    } else {
        return "No Recruitment";
    }

    // Check for blacksmith
    if (facilityCounts.blacksmith > 0) {
        unlockAllTier = true;
    }

    // Build the summary string
    let summary = `${recruitmentCount} Recruitment`;
    if (unlockAllTier) {
        summary += ", Unlock All Tier";
    } else {
        summary += ", Unlock Tier I Only";
    }
    if (unlockInfantry) {
        summary += ", Unlock Infantry";
    }
    if (unlockCavalry) {
        summary += ", Unlock Cavalry";
    }
    if (unlockArchers) {
        summary += ", Unlock Archers";
    }
    if (unlockSiegeWeapons) {
        summary += ", Unlock Siege Weapons";
    }

    return summary;
},
 processNavalFacilities(facilities) {
    let navalRecruitmentCount = 0;
    let canRecruitLightShips = false;
    let canRecruitAllShips = false;

    // Count the number of each facility
    const navalFacilityCounts = {
        fishingPort: 0,
        tradePort: 0,
        militaryPort: 0
    };

    facilities.forEach(facility => {

      const facilityName = facility.facilityName.toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
            .replace(/\s+/g, '');

        if (Object.prototype.hasOwnProperty.call(navalFacilityCounts, facilityName)) {
            navalFacilityCounts[facilityName]++;
        }
    });

    // Calculate naval recruitment and ship unlocks
    if (navalFacilityCounts.fishingPort > 0 || navalFacilityCounts.tradePort > 0 || navalFacilityCounts.militaryPort > 0) {
        if (navalFacilityCounts.fishingPort > 0 || navalFacilityCounts.tradePort > 0) {
            navalRecruitmentCount = 1; // base recruitment for fishing or trade port
            canRecruitLightShips = true;
        }
        if (navalFacilityCounts.militaryPort > 0) {
            navalRecruitmentCount += navalFacilityCounts.militaryPort; // additional recruitment for each military port
            canRecruitAllShips = true;
        }
    } else {
        return "No Naval Recruitment";
    }

    // Build the summary string
    let summary = `${navalRecruitmentCount} Naval Recruitment`;
    if (canRecruitAllShips) {
        summary += ", can recruit all ships";
    } else if (canRecruitLightShips) {
        summary += ", only light ships";
    }

    return summary;
}
    }
};
</script>
