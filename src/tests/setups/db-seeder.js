const config = require('../../services/config.json');
const constants = config.constants;
const masterSeeds = require('./master-seed.json');

const seedBiome = async (knex) => {
    await knex
        .insert(masterSeeds.Biome)
        .into(constants.TABLE_BIOME);
}

const seedComponentType = async (knex) => {
    await knex
        .insert(masterSeeds.ComponentType)
        .into(constants.TABLE_COMPONENT_TYPE);
}

const seedCorruption = async (knex) => {
    await knex
        .insert(masterSeeds.Corruption)
        .into(constants.TABLE_CORRUPTION);
}

const seedDevelopment = async (knex) => {
    await knex
        .insert(masterSeeds.Development)
        .into(constants.TABLE_DEVELOPMENT);
}

const seedResource = async (knex) => {
    await knex
        .insert(masterSeeds.ResourceTier)
        .into(constants.TABLE_RESOURCE_TIER);

    await knex
        .insert(masterSeeds.Resource)
        .into(constants.TABLE_RESOURCE);
}

const seedAllMaster = async (knex) => {
    seedBiome(knex);
    seedComponentType(knex);
    seedCorruption(knex);
    seedDevelopment(knex);
    seedResource(knex);
}

module.exports = {
    seedBiome,
    seedComponentType,
    seedCorruption,
    seedDevelopment,
    seedResource,
    seedAllMaster
}