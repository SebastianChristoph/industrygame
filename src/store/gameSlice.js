import { createSlice } from '@reduxjs/toolkit';
import { 
  INITIAL_RESOURCES, 
  STORAGE_CONFIG, 
  calculateUpgradeCost, 
  PRODUCTION_RECIPES, 
  RESOURCES,
  INPUT_SOURCES 
} from '../config/resources';

const initialState = {
  credits: 1000, // Starting credits
  resources: Object.keys(INITIAL_RESOURCES).reduce((acc, resource) => ({
    ...acc,
    [resource]: {
      amount: INITIAL_RESOURCES[resource],
      capacity: STORAGE_CONFIG.BASE_CAPACITY,
      storageLevel: 1 // Track storage level for each resource
    }
  }), {}),
  warehouses: 0, // Number of warehouses owned
  productionLines: [],
  productionConfigs: {},
  productionStatus: {}
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addCredits: (state, action) => {
      state.credits += action.payload;
    },
    spendCredits: (state, action) => {
      state.credits -= action.payload;
    },
    addResource: (state, action) => {
      const { resource, amount } = action.payload;
      if (state.resources[resource].amount + amount <= state.resources[resource].capacity) {
        state.resources[resource].amount += amount;
      }
    },
    removeResource: (state, action) => {
      const { resource, amount } = action.payload;
      state.resources[resource].amount = Math.max(0, state.resources[resource].amount - amount);
    },
    buyWarehouse: (state) => {
      if (state.credits >= 200) {
        state.credits -= 200;
        state.warehouses += 1;
        // Increase capacity for all resources
        Object.keys(state.resources).forEach(resource => {
          state.resources[resource].capacity += STORAGE_CONFIG.BASE_CAPACITY;
        });
      }
    },
    upgradeStorage: (state, action) => {
      const resourceId = action.payload;
      const currentLevel = state.resources[resourceId].storageLevel;
      const upgradeCost = calculateUpgradeCost(currentLevel);

      if (state.credits >= upgradeCost) {
        state.credits -= upgradeCost;
        state.resources[resourceId].capacity += STORAGE_CONFIG.UPGRADE_CAPACITY;
        state.resources[resourceId].storageLevel += 1;
      }
    },
    addProductionLine: (state, action) => {
      const { id, name } = action.payload;
      state.productionLines.push({ id, name });
      // Initialisiere die Konfiguration und den Status
      state.productionConfigs[id] = {
        recipe: null,
        inputs: []
      };
      state.productionStatus[id] = {
        isActive: false,
        currentPings: 0,
        error: null
      };
    },
    removeProductionLine: (state, action) => {
      const idToRemove = action.payload;
      state.productionLines = state.productionLines.filter(line => line.id !== idToRemove);
      // Cleanup related configurations
      delete state.productionConfigs[idToRemove];
      delete state.productionStatus[idToRemove];
    },
    renameProductionLine: (state, action) => {
      const { id, name } = action.payload;
      const line = state.productionLines.find(line => line.id === id);
      if (line) {
        line.name = name;
      }
    },
    setProductionRecipe: (state, action) => {
      const { productionLineId, recipeId } = action.payload;
      if (state.productionConfigs[productionLineId]) {
        state.productionConfigs[productionLineId].recipe = recipeId;
        state.productionConfigs[productionLineId].inputs = [];
        // Reset production status when recipe changes
        state.productionStatus[productionLineId] = {
          isActive: false,
          currentPings: 0,
          error: null
        };
      }
    },
    setInputSource: (state, action) => {
      const { productionLineId, inputIndex, source, resourceId } = action.payload;
      if (state.productionConfigs[productionLineId]) {
        // Stelle sicher, dass das inputs-Array lang genug ist
        while (state.productionConfigs[productionLineId].inputs.length <= inputIndex) {
          state.productionConfigs[productionLineId].inputs.push(null);
        }
        state.productionConfigs[productionLineId].inputs[inputIndex] = {
          source,
          resourceId
        };
      }
    },
    toggleProduction: (state, action) => {
      const productionLineId = action.payload;
      if (!state.productionStatus[productionLineId]) {
        state.productionStatus[productionLineId] = {
          isActive: true,
          currentPings: 0,
          error: null
        };
      } else {
        state.productionStatus[productionLineId].isActive = 
          !state.productionStatus[productionLineId].isActive;
        
        if (state.productionStatus[productionLineId].isActive) {
          state.productionStatus[productionLineId].error = null;
        }
      }
    },
    handlePing: (state) => {
      // Aktualisiere alle aktiven Produktionslinien
      Object.entries(state.productionStatus).forEach(([productionLineId, status]) => {
        if (!status.isActive) return;

        const config = state.productionConfigs[productionLineId];
        if (!config?.recipe) return;

        const recipe = PRODUCTION_RECIPES[config.recipe];
        
        // Prüfe ob genug Lagerplatz für Output vorhanden ist
        const outputResource = state.resources[recipe.output.resourceId];
        if (outputResource.amount + recipe.output.amount > outputResource.capacity) {
          status.error = "Nicht genug Lagerplatz für Output";
          status.isActive = false;
          return;
        }

        // Prüfe und reserviere Input Ressourcen
        let requiredCredits = 0;
        let canProduce = recipe.inputs.every((input, index) => {
          const inputConfig = config.inputs[index];
          if (!inputConfig) return false;

          if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
            const resource = state.resources[input.resourceId];
            return resource.amount >= input.amount;
          } else {
            requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
            return true;
          }
        });

        // Prüfe Credits für automatische Einkäufe
        if (requiredCredits > 0 && state.credits < requiredCredits) {
          status.error = "Nicht genug Credits für automatische Einkäufe";
          status.isActive = false;
          return;
        }

        if (!canProduce) {
          status.error = "Nicht genug Ressourcen verfügbar";
          status.isActive = false;
          return;
        }

        // Erhöhe den Ping-Zähler
        status.currentPings++;
        
        // Wenn genug Pings für eine Produktion erreicht wurden
        if (status.currentPings >= recipe.productionTime) {
          status.currentPings = 0;
          
          // Verarbeite Inputs
          recipe.inputs.forEach((input, index) => {
            const inputConfig = config.inputs[index];
            if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
              state.resources[input.resourceId].amount -= input.amount;
            } else {
              state.credits -= RESOURCES[input.resourceId].basePrice * input.amount;
            }
          });

          // Füge Output hinzu
          state.resources[recipe.output.resourceId].amount += recipe.output.amount;
        }
      });
    }
  },
});

export const { 
  addCredits, 
  spendCredits, 
  addResource, 
  removeResource, 
  buyWarehouse, 
  upgradeStorage,
  addProductionLine,
  removeProductionLine,
  renameProductionLine,
  setProductionRecipe,
  setInputSource,
  toggleProduction,
  handlePing
} = gameSlice.actions;

export default gameSlice.reducer; 