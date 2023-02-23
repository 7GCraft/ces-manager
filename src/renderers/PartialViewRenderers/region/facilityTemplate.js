const facilityTemplates = [
  {
    name: 'Wart Farm',
    population: 3,
    popName: 'Farmer',
    money: 30,
    food: 15,
  },
  {
    name: 'Agricultural Farm',
    population: 5,
    popName: 'Farmer',
    money: 50,
    food: 30,
  },
  {
    name: 'Sheep Farm',
    population: 3,
    popName: 'Farmer',
    money: 300,
    food: 7,
  },
  {
    name: 'Chicken Farm',
    population: 2,
    popName: 'Farmer',
    money: 150,
    food: 8,
  },
  {
    name: 'Cow Farm',
    population: 3,
    popName: 'Farmer',
    money: 200,
    food: 15,
  },
  {
    name: 'Sheep Farm',
    population: 3,
    popName: 'Farmer',
    money: 300,
    food: 7,
  },
  {
    name: 'Camel Farm',
    population: 5,
    popName: 'Farmer',
    money: 150,
    food: 20,
  },
  {
    name: 'Trade Port',
    population: 5,
    popName: 'Sailor',
    money: 500,
  },
  {
    name: 'Fishing Port',
    population: 4,
    popName: 'Fisherman',
    money: 200,
    food: 15,
  },
  {
    name: 'Military Port',
    popName: 'Marine',
    population: 5,
  },
  {
    name: 'Barracks',
    population: 2,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Stables',
    population: 3,
    popName: 'Soldier',
    food: -15,
  },
  {
    name: 'Archery Grounds',
    population: 2,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Auxillary Barracks',
    population: 2,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Siege Workshop',
    population: 3,
    popName: 'Military Craftsman',
    food: -15,
  },
  {
    name: 'Drill Square',
    population: 1,
    popName: 'Soldier',
    food: -10,
  },
  {
    name: 'Blacksmith',
    population: 2,
    popName: 'Blacksmith',
    money: 150,
  },
  {
    name: 'Arena',
    population: 3,
    popName: 'Fighter',
    money: 600,
  },
  {
    name: 'Theatre',
    population: 3,
    popName: 'Actor',
    money: 200,
  },
  {
    name: 'Tavern',
    population: 3,
    popName: 'Bartender',
    money: 700,
    food: -15,
  },
  {
    name: 'Garden',
    popName: 'Worker',
    population: 1,
  },
  {
    name: 'Market',
    population: 3,
    popName: 'Trader',
    money: 500,
  },
  {
    name: 'Food Market',
    population: 3,
    popName: 'Trader',
    money: 200,
    food: 10,
  },
  {
    name: 'Slave Market',
    population: 3,
    popName: 'Slave Trader',
    money: 800,
  },
  {
    name: 'Charcoal Kiln',
    population: 5,
    popName: 'Worker',
    money: 600,
  },
  {
    name: 'Pewter Maker',
    popName: 'Worker',
    population: 3,
    money: 350,
  },
  {
    name: 'Monument',
    popName: 'Worker',
    population: 1,
  },

  {
    name: 'Pleasure House',
    popName: 'Prostitute',
    population: 2,
    money: 600,
  },
  {
    name: 'Library',
    popName: 'Librarian',
    population: 1,

  },
  {
    name: 'University',
    popName: 'Scholar',
    population: 3,

  },
  {
    name: 'School',
    popName: 'Teacher',
    population: 5,
    money: -600,

  },
  {
    name: 'Granary',
    population: 2,
    popName: 'Granary Worker',
    food: 5,

  },
  {
    name: 'Canal',
    popName: 'Canal Worker',
    population: 1,

  },
  {
    name: 'Goldsmith',
    population: 2,
    popName: 'Goldsmith',
    money: 600,

  },
  {
    name: 'Silversmith',
    population: 2,
    popName: 'Silversmith',
    money: 500,

  },
  {
    name: 'Quartzsmith',
    population: 2,
    popName: 'Quartzsmith',
    money: 400,
  },
  {
    name: 'Diamond Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Emerald Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Ruby Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Gold Mine',
    popName: 'Miner',
    population: 5,
    money: 1000,
  },
  {
    name: 'Silk Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Spices Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Prismarine Quarry',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Pearl Farm',
    popName: 'Pearl Farmer',
    population: 5,
  },
  {
    name: 'Silver Mine',
    popName: 'Miner',
    population: 5,
    money: 800,
  },
  {
    name: 'Quartz Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Lapis Lazuli Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Redstone Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Glowstone Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Ancient Tomes Excavator',
    popName: 'Worker',
    population: 5,
  },
  {
    name: 'Sugar Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Wine Vineyard',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Tea Plantation',
    popName: 'Plantation Worker',
    population: 5,
  },
  {
    name: 'Oil Well',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Fur Trader',
    popName: 'Hunter',
    population: 5,
  },
  {
    name: 'Iron Mine',
    popName: 'Miner',
    population: 5,
  },
  {
    name: 'Lumber Camp',
    popName: 'Lumberjack',
    population: 5,
  },
  {
    name: 'Horse Farm',
    popName: 'Horse Farmer',
    population: 5,
  },
  {
    name: 'Potters',
    popName: 'Potter',
    population: 5,
  },
  {
    name: 'Coal Mine',
    popName: 'Miner',
    population: 5,
  },
];
