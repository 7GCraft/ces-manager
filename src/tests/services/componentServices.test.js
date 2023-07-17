const config = require('../../services/config.json');

const { constants } = config;
const dbSetup = require('../setups/database');
const dbSeeder = require('../setups/db-seeder');
const dbContext = require('../../repository/DbContext');
const componentServices = require('../../services/componentServices.v2');
const facilityServices = require('../../services/facilityServices');

let knex = null;

beforeAll(async () => {
  knex = dbSetup.createTestDBConnection();
  dbContext.getKnexObject = jest.fn(() => knex);
  await dbSeeder.seedAllMaster(knex);
});

afterAll(async () => {
  await knex.destroy();
  await dbSetup.dropTestDB();
});

const stateObj = {
  stateName: 'Test State',
  treasuryAmt: 1000,
  desc: '',
  expenses: 0,
};

const stateSeeder = async (knex) => {
  await knex
    .insert({
      name: stateObj.stateName,
      treasuryAmt: stateObj.treasuryAmt,
      desc: stateObj.desc,
      expenses: stateObj.expenses,
    })
    .into(constants.TABLE_STATE);
};

const regionObj = {
  regionName: 'Test Region',
  stateId: 1,
  corruptionId: 1,
  biomeId: 1,
  developmentId: 1,
  population: 10,
  desc: '',
  taxRate: 0.05,
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
      taxRate: regionObj.taxRate,
    })
    .into(constants.TABLE_REGION);
};

const regionId = 1;

describe('Modify Component Table', () => {
  facilityServices.addMultipleFacilities = jest.fn(async (facilities) => {
    const mappedFacilities = facilities.map((facility) => ({
      regionId: facility.regionId,
      name: facility.facilityName,
      isFunctional: facility.isFunctional ? 1 : 0,
    }));

    await knex
      .insert(mappedFacilities)
      .into(constants.TABLE_FACILITY);
    return true;
  });

  beforeEach(async () => {
    await stateSeeder(knex);
    await regionSeeder(knex);
  });

  afterEach(async () => {
    const resetTables = [
      constants.TABLE_FACILITY,
      constants.TABLE_COMPONENT,
      constants.TABLE_REGION,
      constants.TABLE_STATE,
    ];
    await dbSetup.resetTables(knex, resetTables);
  });

  describe('addComponent', () => {
    test('given just a component model should insert a component, decrease state treasury by its cost, and return OK', async () => {
      const newComponent = {
        componentName: 'New Component',
        componentType: {
          componentTypeId: 1,
        },
        cost: 250,
        regionId,
        facilityId: null,
        isChild: false,
        parentId: null,
        value: 5,
        activationTime: 1,
      };

      let expectedComponent = {
        ...newComponent,
        name: newComponent.componentName,
        componentTypeId: newComponent.componentType.componentTypeId,
        value: 'i;5',
        isChild: 0,
      };
      expectedComponent = JSON.parse(JSON.stringify(expectedComponent));

      delete expectedComponent.componentName;
      delete expectedComponent.componentType;
      delete expectedComponent.cost;

      const resStatus = await componentServices.addComponent({ component: newComponent });

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBe('OK');
      expect(facilityResult).toHaveLength(0);
      expect(componentResult).toHaveLength(1);
      if (componentResult.length > 0) {
        const componentResultObject = componentResult[0];
        const expectedTreasury = stateObj.treasuryAmt - newComponent.cost;
        expect(componentResultObject).toMatchObject(expectedComponent);
        expect(stateResult.treasuryAmt).toBe(expectedTreasury);
      }
    });

    test('given a component model with higher cost than the state treasury should return "Cost exceeding treasury amount"', async () => {
      const newComponent = {
        componentName: 'New Component',
        componentType: {
          componentTypeId: 1,
        },
        cost: 1100,
        regionId,
        facilityId: null,
        isChild: false,
        parentId: null,
        value: 5,
        activationTime: 1,
      };

      const resStatus = await componentServices.addComponent({ component: newComponent });

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBe('Cost exceeding treasury amount');
      expect(facilityResult).toHaveLength(0);
      expect(componentResult).toHaveLength(0);
      expect(stateResult.treasuryAmt).toBe(stateObj.treasuryAmt);
    });

    test('given a component model with temporary facility name should insert a component, insert a facility, decrease state treasury by its cost, and return OK', async () => {
      const newComponent = {
        componentName: 'New Component',
        componentType: {
          componentTypeId: 1,
        },
        cost: 250,
        regionId,
        facilityId: null,
        isChild: false,
        parentId: null,
        value: 5,
        activationTime: 1,
      };

      const expectedFacilityId = 1;
      let expectedComponent = {
        ...newComponent,
        name: newComponent.componentName,
        componentTypeId: newComponent.componentType.componentTypeId,
        value: 'i;5',
        isChild: 0,
        facilityId: expectedFacilityId,
      };
      expectedComponent = JSON.parse(JSON.stringify(expectedComponent));

      delete expectedComponent.componentName;
      delete expectedComponent.componentType;
      delete expectedComponent.cost;

      const tempFacilityName = 'New Facility';
      const addComponentParameter = {
        component: newComponent,
        tempFacilityName,
      };
      const resStatus = await componentServices.addComponent(addComponentParameter);

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBe('OK');
      expect(componentResult).toHaveLength(1);

      if (componentResult.length > 0) {
        const componentResultObject = componentResult[0];
        const expectedTreasury = stateObj.treasuryAmt - newComponent.cost;
        expect(componentResultObject).toMatchObject(expectedComponent);
        expect(stateResult.treasuryAmt).toBe(expectedTreasury);
      }

      expect(facilityResult).toHaveLength(1);
      if (facilityResult.length > 0) {
        const expectedFacility = {
          regionId,
          name: tempFacilityName,
          isFunctional: 0,
        };
        const facilityResultObject = facilityResult[0];
        expect(facilityResultObject).toMatchObject(expectedFacility);
      }
    });

    test.todo('given a component model with facility id not existing in facility table should not insert the component and should return error');
  });

  describe('updateComponent', () => {
    const beforeUpdateComponent = {
      name: 'Before Update Component',
      componentTypeId: 1,
      regionId,
      facilityId: null,
      parentId: null,
      value: 'i;5',
      activationTime: 1,
      isChild: 0,
    };

    const baseExpectedComponent = {
      name: 'After Update Component',
      componentTypeId: 4,
      regionId,
      facilityId: null,
      parentId: null,
      value: 'i;10',
      activationTime: 0,
      isChild: 0,
    };

    beforeEach(async () => {
      await knex
        .insert(beforeUpdateComponent)
        .into(constants.TABLE_COMPONENT);
    });

    test('given just a component model should update the component and return OK', async () => {
      const updateComponent = {
        componentId: 1,
        componentName: baseExpectedComponent.name,
        componentType: {
          componentTypeId: baseExpectedComponent.componentTypeId,
        },
        regionId: baseExpectedComponent.regionId,
        facilityId: baseExpectedComponent.facilityId,
        isChild: (baseExpectedComponent.isChild == 1),
        parentId: null,
        value: 10,
        activationTime: baseExpectedComponent.activationTime,
      };

      const resStatus = await componentServices.updateComponent({ component: updateComponent });

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBeTruthy();
      expect(facilityResult).toHaveLength(0);
      expect(componentResult).toHaveLength(1);
      if (componentResult.length > 0) {
        const componentResultObject = componentResult[0];
        expect(componentResultObject).toMatchObject(baseExpectedComponent);
        expect(stateResult.treasuryAmt).toBe(stateObj.treasuryAmt);
      }
    });

    test('given a component model with temporary facility name update the component, insert a facility, and return OK', async () => {
      const updateComponent = {
        componentId: 1,
        componentName: baseExpectedComponent.name,
        componentType: {
          componentTypeId: baseExpectedComponent.componentTypeId,
        },
        regionId: baseExpectedComponent.regionId,
        facilityId: baseExpectedComponent.facilityId,
        isChild: (baseExpectedComponent.isChild == 1),
        parentId: null,
        value: 10,
        activationTime: baseExpectedComponent.activationTime,
      };

      const expectedComponent = JSON.parse(JSON.stringify(baseExpectedComponent));
      expectedComponent.facilityId = 1;

      const tempFacilityName = 'New Facility';
      const updateComponentParameter = {
        component: updateComponent,
        tempFacilityName,
      };
      const resStatus = await componentServices.updateComponent(updateComponentParameter);

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBeTruthy();
      expect(componentResult).toHaveLength(1);
      if (componentResult.length > 0) {
        const componentResultObject = componentResult[0];
        expect(componentResultObject).toMatchObject(expectedComponent);
        expect(stateResult.treasuryAmt).toBe(stateObj.treasuryAmt);
      }

      expect(facilityResult).toHaveLength(1);
      if (facilityResult.length > 0) {
        const expectedFacility = {
          regionId,
          name: tempFacilityName,
          isFunctional: 0,
        };
        const facilityResultObject = facilityResult[0];
        expect(facilityResultObject).toMatchObject(expectedFacility);
      }
    });

    test.todo('given a component model with facility id not existing in facility table should not update the component and should return error');
  });

  describe('addMultipleComponents', () => {
    const componentGeneralGenerator = (name, componentTypeId, cost, facilityId, value, activationTime) => ({
      componentModel: {
        componentName: name,
        componentType: {
          componentTypeId,
        },
        cost,
        regionId,
        facilityId,
        isChild: false,
        parentId: null,
        value,
        activationTime,
      },
      databaseModel: {
        name,
        componentTypeId,
        regionId,
        facilityId,
        parentId: null,
        value: (value == null) ? null : `i;${value}`,
        activationTime,
        isChild: 0,
      },
    });

    test('given component models without temporary facility map should insert those components, decrease state treasury by total cost, and return OK', async () => {
      const addComponents = [];
      const expectedComponents = [];
      let totalCost = 0;

      const components = [
        {
          name: 'New Component 1',
          componentTypeId: 1,
          cost: 250,
          facilityId: null,
          value: 5,
          activationTime: 1,
        },
        {
          name: 'New Component 2',
          componentTypeId: 2,
          cost: 250,
          facilityId: null,
          value: null,
          activationTime: 1,
        },
        {
          name: 'New Component 3',
          componentTypeId: 4,
          cost: 0,
          facilityId: null,
          value: 500,
          activationTime: 0,
        },
      ];

      components.forEach((component) => {
        const tempComponent = componentGeneralGenerator(component.name, component.componentTypeId, component.cost, component.facilityId, component.value, component.activationTime);
        addComponents.push(tempComponent.componentModel);
        expectedComponents.push(tempComponent.databaseModel);
        totalCost += component.cost;
      });

      const resStatus = await componentServices.addMultipleComponents({ components: addComponents });

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBeTruthy();
      expect(facilityResult).toHaveLength(0);
      expect(componentResult).toHaveLength(expectedComponents.length);
      if (componentResult.length == expectedComponents.length) {
        const expectedTreasury = stateObj.treasuryAmt - totalCost;
        expect(stateResult.treasuryAmt).toBe(expectedTreasury);

        for (let i = 0; i < componentResult.length; i++) {
          expect(componentResult[i]).toMatchObject(expectedComponents[i]);
        }
      }
    });

    test('given component models with total costs higher than the state treasury should not insert those components and return error', async () => {
      const addComponents = [];

      const components = [
        {
          name: 'New Component 1',
          componentTypeId: 1,
          cost: 500,
          facilityId: null,
          value: 5,
          activationTime: 1,
        },
        {
          name: 'New Component 2',
          componentTypeId: 1,
          cost: 500,
          facilityId: null,
          value: null,
          activationTime: 1,
        },
        {
          name: 'New Component 3',
          componentTypeId: 1,
          cost: 100,
          facilityId: null,
          value: 500,
          activationTime: 1,
        },
      ];

      components.forEach((component) => {
        const tempComponent = componentGeneralGenerator(component.name, component.componentTypeId, component.cost, component.facilityId, component.value, component.activationTime);
        addComponents.push(tempComponent.componentModel);
      });

      const resStatus = await componentServices.addMultipleComponents({ components: addComponents });

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');

      expect(resStatus).not.toBeTruthy();
      expect(facilityResult).toHaveLength(0);
      expect(componentResult).toHaveLength(0);
    });

    test('given component models with temporary facility map should insert those components, decrease state treasury by total cost, insert the facilities, and return OK', async () => {
      const addComponents = [];
      const expectedComponents = [];
      let totalCost = 0;

      const components = [
        {
          name: 'New Component 1',
          componentTypeId: 1,
          cost: 250,
          facilityId: -2,
          value: 5,
          activationTime: 1,
        },
        {
          name: 'New Component 2',
          componentTypeId: 2,
          cost: 250,
          facilityId: null,
          value: null,
          activationTime: 1,
        },
        {
          name: 'New Component 3',
          componentTypeId: 4,
          cost: 0,
          facilityId: -1,
          value: 500,
          activationTime: 0,
        },
      ];

      // In this test, we use negative index so that its absolute value matches actual facility id in the table
      const facilityMap = new Map([
        [-1, 'Facility 1'],
        [-2, 'Facility 2'],
      ]);
      const expectedFacilities = [
        {
          facilityId: 1,
          regionId,
          name: 'Facility 1',
          isFunctional: 0,
        },
        {
          facilityId: 2,
          regionId,
          name: 'Facility 2',
          isFunctional: 0,
        },
      ];

      components.forEach((component) => {
        const tempComponent = componentGeneralGenerator(component.name, component.componentTypeId, component.cost, component.facilityId, component.value, component.activationTime);
        tempComponent.databaseModel.facilityId = tempComponent.databaseModel.facilityId == null
          ? null
          : Math.abs(tempComponent.databaseModel.facilityId);
        addComponents.push(tempComponent.componentModel);
        expectedComponents.push(tempComponent.databaseModel);
        totalCost += component.cost;
      });

      const addComponentsParameter = {
        components: addComponents,
        tempFacilityMap: facilityMap,
      };

      const resStatus = await componentServices.addMultipleComponents(addComponentsParameter);

      const componentResult = await knex(constants.TABLE_COMPONENT).select('*');
      const facilityResult = await knex(constants.TABLE_FACILITY).select('*');
      const stateResult = (await knex(constants.TABLE_STATE).select('*'))[0];

      expect(resStatus).toBeTruthy();
      expect(componentResult).toHaveLength(expectedComponents.length);
      if (componentResult.length == expectedComponents.length) {
        const expectedTreasury = stateObj.treasuryAmt - totalCost;
        expect(stateResult.treasuryAmt).toBe(expectedTreasury);

        for (let i = 0; i < componentResult.length; i++) {
          expect(componentResult[i]).toMatchObject(expectedComponents[i]);
        }
      }

      expect(facilityResult).toHaveLength(expectedFacilities.length);
      if (facilityResult.length == expectedFacilities.length) {
        for (let i = 0; i < facilityResult.length; i++) {
          expect(facilityResult[i]).toMatchObject(expectedFacilities[i]);
        }
      }
    });
  });
});
