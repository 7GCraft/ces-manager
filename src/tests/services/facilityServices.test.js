const config = require('../../services/config.json');
const constants = config.constants;
const dbSetup = require('../setups/database');
const dbSeeder = require('../setups/db-seeder');
const dbContext = require('../../repository/DbContext');
const facilityServices = require('../../services/facilityServices');

let knex = null;

const stateObj = {
    stateName: "Test State",
    treasuryAmt: 1000,
    desc: "",
    expenses: 0
};

const stateSeeder = async (knex) => {
    await knex
        .insert({
            name: stateObj.stateName,
            treasuryAmt: stateObj.treasuryAmt,
            desc: stateObj.desc,
            expenses: stateObj.expenses
        })
        .into(constants.TABLE_STATE);
}

let regionObj = {
    regionName: "Test Region",
    stateId: 1,
    corruptionId: 1,
    biomeId: 1,
    developmentId: 1,
    population: 10,
    desc: "",
    taxRate: 0.05
};

const regionSeeder = async (knex) => {
    await knex
        .insert({
            name: regionObj.regionName,
            stateId: regionObj.stateId,
            corruptionId: regionObj.corruptionId,
            biomeId: regionObj.biomeId,
            developmentId: regionObj.developmentId,
            population: regionObj.population,
            desc: regionObj.desc,
            taxRate: regionObj.taxRate
        })
        .into(constants.TABLE_REGION);
};

const regionId = 1;

beforeAll(async () => {
    knex = dbSetup.createTestDBConnection();
    dbContext.getKnexObject = jest.fn(() => {
        return knex;
    });
    await dbSeeder.seedAllMaster(knex);
    await stateSeeder(knex);
    await regionSeeder(knex);
});

afterAll(async () => {
    await knex.destroy();
    await dbSetup.dropTestDB();
});

describe('Modify Facility Table', () => {
    afterEach(async () => {

        const resetTables = [
            constants.TABLE_FACILITY
        ];
        await dbSetup.resetTables(knex, resetTables);
    });

    describe('addMultipleFacilities', () => {
        const facilityGeneralGenerator = (name, isFunctional) => {
            return {
                facilityModel: {
                    regionId: regionId,
                    facilityName: name,
                    isFunctional: isFunctional
                },
                databaseModel: {
                    regionId: regionId,
                    name: name,
                    isFunctional: isFunctional ? 1 : 0
                }
            };
        };

        test('given facility models should insert those facilities and return OK', async () => {
            let addFacilities = [];
            let expectedFacilities = [];

            let facilities = [
                {
                    name: 'Facility 1',
                    isFunctional: true
                },
                {
                    name: 'Facility 2',
                    isFunctional: false
                },
                {
                    name: 'Facility 3',
                    isFunctional: true
                }
            ];

            facilities.forEach(facility => {
                const tempfacility = facilityGeneralGenerator(facility.name, facility.isFunctional);
                addFacilities.push(tempfacility.facilityModel);
                expectedFacilities.push(tempfacility.databaseModel);
            });

            let resStatus = await facilityServices.addMultipleFacilities(addFacilities);

            let facilityResult = await knex(constants.TABLE_FACILITY).select('*');

            expect(resStatus).toBeTruthy();
            expect(facilityResult).toHaveLength(expectedFacilities.length);
            if (facilityResult.length == expectedFacilities.length) {
                for (let i = 0; i < facilityResult.length; i++) {
                    expect(facilityResult[i]).toMatchObject(expectedFacilities[i]);
                }
            }
        })
    })
});