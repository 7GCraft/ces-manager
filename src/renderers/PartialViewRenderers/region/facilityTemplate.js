const facilityTemplates = [
  {
    name: 'Wart Farm',
    componentBuildingName: 'Wart Farm',
    population: 3,
    popName: 'Farmer',
    money: 30,
    food: 15,
  },
  {
    name: 'Agricultural Farm',
    componentBuildingName: 'Agricultural Farm',
    population: 5,
    popName: 'Farmer',
    money: 50,
    food: 30,
  },
  {
    name: 'Sheep Farm',
    componentBuildingName: 'Sheep Farm',
    population: 3,
    popName: 'Farmer',
    money: 300,
    food: 7,
  },
  {
    name: 'Chicken Farm',
    componentBuildingName: 'Chicken Farm',
    population: 2,
    popName: 'Farmer',
    money: 150,
    food: 8,
  },
  {
    name: 'Cow Farm',
    componentBuildingName: 'Cow Farm',
    population: 3,
    popName: 'Farmer',
    money: 200,
    food: 15,
  },
  {
    name: 'Sheep Farm',
    componentBuildingName: 'Sheep Farm',
    population: 3,
    popName: 'Farmer',
    money: 300,
    food: 7,
  },
  {
    name: 'Camel Farm',
    componentBuildingName: 'Camel Farm',
    population: 5,
    popName: 'Farmer',
    money: 150,
    food: 20,
  },
  {
    name: 'Trade Port',
    componentBuildingName: 'Trade Port',
    population: 5,
    popName: 'Sailor',
    money: 500,
  },
  {
    name: 'Fishing Port',
    componentBuildingName: 'Fishing Port',
    population: 4,
    popName: 'Fisherman',
    money: 200,
    food: 15,
  },
  {
    name: 'Military Port',
    componentBuildingName: 'Military Port',
    popName: 'Marine',
    population: 5,
  },
  {
    name: 'Barracks',
    componentBuildingName: 'Barracks',
    population: 2,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Stables',
    componentBuildingName: 'Stables',
    population: 3,
    popName: 'Soldier',
    food: -15,
  },
  {
    name: 'Archery Grounds',
    componentBuildingName: 'Archery Grounds',
    population: 2,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Auxillary Barracks',
    componentBuildingName: 'Auxillary Barracks',
    population: 2,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Siege Workshop',
    componentBuildingName: 'Siege Workshop',
    population: 3,
    popName: 'Military Craftsman',
    food: -15,
  },
  {
    name: 'Drill Square',
    componentBuildingName: 'Drill Square',
    population: 1,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Blacksmith',
    componentBuildingName: 'Blacksmith',
    population: 2,
    popName: 'Blacksmith',
    money: 150,
  },
  {
    name: 'Arena',
    componentBuildingName: 'Arnea',
    population: 3,
    popName: 'Fighter',
    money: 600,
  },
  {
    name: 'Theatre',
    componentBuildingName: 'Theatre',
    population: 3,
    popName: 'Actor',
    money: 200,
  },
  {
    name: 'Tavern',
    componentBuildingName: 'Tavern',
    population: 3,
    popName: 'Bartender',
    money: 700,
    food: -15,
  },
  {
    name: 'Garden',
    componentBuildingName: 'Garden',
    popName: 'Worker',
    population: 1,
  },
  {
    name: 'Market',
    componentBuildingName: 'Market',
    population: 3,
    popName: 'Trader',
    money: 500,
  },
  {
    name: 'Food Market',
    componentBuildingName: 'Food Trader',
    population: 3,
    popName: 'Trader',
    money: 200,
    food: 10,
  },
  {
    name: 'Slave Market',
    componentBuildingName: 'Slave Market',
    population: 3,
    popName: 'Slave Trader',
    money: 800,
  },
  {
    name: 'Charcoal Kiln',
    componentBuildingName: 'Charcoal Kiln',
    population: 5,
    popName: 'Worker',
    money: 600,
  },
  {
    name: 'Pewter Maker',
    componentBuildingName: 'Pewter Maker',
    popName: 'Worker',
    population: 3,
    money: 350,
  },
  {
    name: 'Monument',
    componentBuildingName: 'Monument',
    popName: 'Worker',
    population: 1,
  },

  {
    name: 'Pleasure House',
    componentBuildingName: 'Pleasure House',
    popName: 'Prostitute',
    population: 2,
    money: 600,
  },
  {
    name: 'Library',
    componentBuildingName: 'Library',
    popName: 'Librarian',
    population: 1,

  },
  {
    name: 'University',
    componentBuildingName: 'University',
    popName: 'Scholar',
    population: 3,

  },
  {
    name: 'School',
    componentBuildingName: 'School',
    popName: 'Teacher',
    population: 5,
    money: -600,

  },
  {
    name: 'Granary',
    componentBuildingName: 'Granary',
    population: 2,
    popName: 'Granary Worker',
    food: 5,

  },
  {
    name: 'Canal',
    componentBuildingName: 'Canal',
    popName: 'Canal Worker',
    population: 1,

  },
  {
    name: 'Goldsmith',
    componentBuildingName: 'Goldsmith',
    population: 2,
    popName: 'Goldsmith',
    money: 600,

  },
  {
    name: 'Silversmith',
    componentBuildingName: 'Silversmith',
    population: 2,
    popName: 'Silversmith',
    money: 500,

  },
  {
    name: 'Quartzsmith',
    componentBuildingName: 'Quartzsmith',
    population: 2,
    popName: 'Quartzsmith',
    money: 400,
  },
  {
    name: 'Diamond Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Emerald Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Ruby Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Gold Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
    money: 1000,
  },
  {
    name: 'Silk Plantation',
    componentBuildingName: 'Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Spices Plantation',
    componentBuildingName: 'Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Prismarine Quarry',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Pearl Farm',
    componentBuildingName: 'Pearl Farm',
    popName: 'Pearl Farmer',
    population: 5,
  },
  {
    name: 'Silver Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
    money: 800,
  },
  {
    name: 'Quartz Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Lapis Lazuli Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Redstone Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Glowstone Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Ancient Tomes Excavator',
    componentBuildingName: 'Ancient Tome Excavator',
    popName: 'Worker',
    population: 5,
  },
  {
    name: 'Sugar Plantation',
    componentBuildingName: 'Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Wine Vineyard',
    componentBuildingName: 'Wine Vineyard',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Tea Plantation',
    componentBuildingName: 'Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Oil Well',
    componentBuildingName: 'Oil Well',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Fur Trader',
    componentBuildingName: 'Fur Trader',
    popName: 'Hunter',
    population: 5,
  },
  {
    name: 'Iron Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Lumber Camp',
    componentBuildingName: 'Lumber Camp',
    popName: 'Lumberjack',
    population: 5,
  },
  {
    name: 'Horse Farm',
    componentBuildingName: 'Horse Farm',
    popName: 'Horse Farmer',
    population: 5,
  },
  {
    name: 'Potters',
    componentBuildingName: 'Potters',
    popName: 'Potter',
    population: 5,
  },
  {
    name: 'Coal Mine',
    componentBuildingName: 'Mine',
    popName: 'Miner',
    population: 5,
  },
];
