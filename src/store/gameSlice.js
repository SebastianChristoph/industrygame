import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_RESOURCES, STORAGE_CONFIG, calculateUpgradeCost, PRODUCTION_RECIPES, RESOURCES } from '../config/resources';

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
  productionLines: [
    // Beispiel-Produktionslinien
    { id: 1, name: 'Eisenverarbeitung' },
    { id: 2, name: 'Kupferproduktion' }
  ],
  productionConfigs: {
    // Speichert die Konfiguration für jede Produktionslinie
    // Format: { [productionLineId]: { recipe, inputs: [{ source, resourceId }] } }
  },
  productionStatus: {
    // Speichert den Status jeder Produktionslinie
    // Format: { [productionLineId]: { isActive: boolean, progress: number, lastPingTime: number, error: string | null } }
  }
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
      state.productionConfigs[id] = {
        recipe: null,
        inputs: []
      };
      state.productionStatus[id] = {
        isActive: false,
        progress: 0,
        lastPingTime: 0,
        error: null
      };
    },
    removeProductionLine: (state, action) => {
      const idToRemove = action.payload;
      state.productionLines = state.productionLines.filter(line => line.id !== idToRemove);
      delete state.productionConfigs[idToRemove];
      delete state.productionStatus[idToRemove];
    },
    setProductionRecipe: (state, action) => {
      const { productionLineId, recipeId } = action.payload;
      if (state.productionConfigs[productionLineId]) {
        state.productionConfigs[productionLineId].recipe = recipeId;
        state.productionConfigs[productionLineId].inputs = [];
        // Reset production status when recipe changes
        state.productionStatus[productionLineId] = {
          isActive: false,
          progress: 0,
          lastPingTime: 0,
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
      if (state.productionStatus[productionLineId]) {
        state.productionStatus[productionLineId].isActive = 
          !state.productionStatus[productionLineId].isActive;
        
        if (state.productionStatus[productionLineId].isActive) {
          state.productionStatus[productionLineId].lastPingTime = Date.now();
          state.productionStatus[productionLineId].error = null;
        }
      }
    },
    updateProductionProgress: (state, action) => {
      const { productionLineId, currentTime } = action.payload;
      const status = state.productionStatus[productionLineId];
      const config = state.productionConfigs[productionLineId];
      
      if (!status?.isActive || !config?.recipe) return;

      const recipe = PRODUCTION_RECIPES[config.recipe];
      const elapsedPings = Math.floor((currentTime - status.lastPingTime) / 1000);
      
      if (elapsedPings > 0) {
        // Prüfe Lagerkapazität für Output
        const outputResource = state.resources[recipe.output.resourceId];
        if (outputResource.amount + recipe.output.amount > outputResource.capacity) {
          status.error = `Nicht genügend Lagerkapazität für ${RESOURCES[recipe.output.resourceId].name}`;
          status.isActive = false;
          return;
        }

        // Prüfe Ressourcen und Credits
        let requiredCredits = 0;
        const hasEnoughResources = recipe.inputs.every((input, index) => {
          const inputConfig = config.inputs[index];
          if (!inputConfig) return false;
          
          if (inputConfig.source === 'GLOBAL_STORAGE') {
            return state.resources[input.resourceId].amount >= input.amount;
          } else {
            // Berechne benötigte Credits für Einkauf
            requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
            return true;
          }
        });

        // Prüfe ob genug Credits für Einkäufe da sind
        if (requiredCredits > 0 && state.credits < requiredCredits) {
          status.error = `Nicht genügend Credits für Einkäufe (${requiredCredits} benötigt)`;
          status.isActive = false;
          return;
        }

        if (hasEnoughResources) {
          status.error = null;
          // Aktualisiere den Fortschritt
          status.progress += (elapsedPings * 100) / recipe.productionTime;
          status.lastPingTime = currentTime;

          // Wenn Produktion abgeschlossen
          if (status.progress >= 100) {
            // Verarbeite Inputs
            recipe.inputs.forEach((input, index) => {
              const inputConfig = config.inputs[index];
              if (inputConfig?.source === 'GLOBAL_STORAGE') {
                state.resources[input.resourceId].amount -= input.amount;
              } else {
                // Kaufe Ressourcen
                state.credits -= RESOURCES[input.resourceId].basePrice * input.amount;
              }
            });

            // Füge Output hinzu
            const { resourceId, amount } = recipe.output;
            state.resources[resourceId].amount += amount;

            // Reset Progress
            status.progress = 0;
          }
        } else {
          status.error = 'Nicht genügend Ressourcen im Lager';
          status.isActive = false;
        }
      }
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
  setProductionRecipe,
  setInputSource,
  toggleProduction,
  updateProductionProgress
} = gameSlice.actions;

export default gameSlice.reducer; 