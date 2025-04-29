import { createSlice } from '@reduxjs/toolkit';
import { 
  INITIAL_RESOURCES, 
  STORAGE_CONFIG, 
  calculateUpgradeCost, 
  PRODUCTION_RECIPES, 
  RESOURCES,
  INPUT_SOURCES,
  OUTPUT_TARGETS
} from '../config/resources';
import { INITIAL_UNLOCKED_MODULES } from '../config/modules';
import { RESEARCH_TREE } from '../config/research';
import { MODULES } from '../config/modules';

const initialState = {
  credits: 2000, // Starting credits
  researchPoints: 1000,
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
  productionStatus: {},
  unlockedModules: INITIAL_UNLOCKED_MODULES,
  researchedTechnologies: [],
  unlockedRecipes: [],
  unlockedResources: [],
  // New statistics data
  statistics: {
    resourceHistory: {}, // { [resourceId]: [{ timestamp: number, amount: number }] }
    salesHistory: [], // [{ timestamp: number, amount: number, resourceId: string }]
    purchaseHistory: [], // [{ timestamp: number, amount: number, resourceId: string }]
    productionHistory: [], // [{ timestamp: number, productionLineId: number, amount: number }]
    profitHistory: [], // [{ timestamp: number, profit: number, productionLineId: number }]
    globalStatsHistory: [] // [{ timestamp, perPing, totalBalance, credits }]
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
        state.productionConfigs[productionLineId].outputTarget = OUTPUT_TARGETS.GLOBAL_STORAGE; // Default to global storage
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
    setOutputTarget: (state, action) => {
      const { productionLineId, target } = action.payload;
      if (state.productionConfigs[productionLineId]) {
        state.productionConfigs[productionLineId].outputTarget = target;
      }
    },
    handlePing: (state) => {
      // Aktualisiere alle aktiven Produktionslinien
      Object.entries(state.productionStatus).forEach(([productionLineId, status]) => {
        if (!status.isActive) return;

        const config = state.productionConfigs[productionLineId];
        if (!config || !config.recipe) return;

        const recipe = PRODUCTION_RECIPES[config.recipe];
        if (!recipe) return;

        // Prüfe, ob genug Ressourcen im Lager sind (für alle Inputs aus GLOBAL_STORAGE)
        let hasEnough = true;
        for (let i = 0; i < recipe.inputs.length; i++) {
          const input = recipe.inputs[i];
          const inputConfig = config.inputs[i];
          if (inputConfig && inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
            if (state.resources[input.resourceId].amount < input.amount) {
              hasEnough = false;
              break;
            }
          }
        }
        // Prüfe, ob genug Lagerplatz für Output vorhanden ist (nur bei auf Lager)
        if (config.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
          const outputRes = state.resources[recipe.output.resourceId];
          if (outputRes.amount + recipe.output.amount > outputRes.capacity) {
            status.error = 'Not enough storage space for output';
            return;
          }
        }
        if (!hasEnough) {
          status.error = 'Not enough resources in stock';
          return;
        } else {
          status.error = null;
        }

        // Erhöhe die Pings
        status.currentPings = (status.currentPings || 0) + 1;
        status.totalPings = (status.totalPings || 0) + 1;
        
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

          // Verarbeite Output basierend auf dem Ziel
          const outputResource = RESOURCES[recipe.output.resourceId];
          if (recipe.output.resourceId === 'research_points') {
            // Research Points werden direkt zu den globalen Research Points hinzugefügt
            state.researchPoints += recipe.output.amount;
          } else if (config.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
            state.resources[recipe.output.resourceId].amount += recipe.output.amount;
          } else if (config.outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
            // Verkaufe die produzierten Ressourcen zum Basispreis
            state.credits += outputResource.basePrice * recipe.output.amount;
          }
        }
      });

      // Nach der Verarbeitung aller Linien:
      // Summiere perPing und totalBalance wie im Header
      let totalBalance = 0;
      let totalPerPing = 0;
      Object.values(state.productionLines).forEach(line => {
        const config = state.productionConfigs[line.id];
        const status = state.productionStatus[line.id];
        if (status?.isActive) {
          const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
          if (recipe) {
            // Bilanz-Logik wie in calculateLineBalanceLogic
            const allInputsFromStock = recipe.inputs.every((input, idx) => {
              const inputConfig = config.inputs[idx];
              return inputConfig && inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE;
            });
            const purchaseCost = recipe.inputs.reduce((sum, input, idx) => {
              const inputConfig = config.inputs[idx];
              if (inputConfig && inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE) {
                return sum + RESOURCES[input.resourceId].basePrice * input.amount;
              }
              return sum;
            }, 0);
            const sellIncome = RESOURCES[recipe.output.resourceId].basePrice * recipe.output.amount;
            const isSelling = config?.outputTarget === OUTPUT_TARGETS.AUTO_SELL;
            const isStoring = config?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE;
            let balance = 0;
            if (allInputsFromStock && isStoring) {
              balance = 0;
            } else if (isSelling) {
              balance = sellIncome - purchaseCost;
            } else {
              balance = -purchaseCost;
            }
            const balancePerPing = recipe.productionTime > 0 ? Math.round((balance / recipe.productionTime) * 100) / 100 : 0;
            totalBalance += balance;
            totalPerPing += balancePerPing;
          }
        }
      });
      // Schreibe nur, wenn mindestens eine Linie existiert
      if (state.productionLines.length > 0) {
        state.statistics.globalStatsHistory.push({
          timestamp: Date.now(),
          perPing: totalPerPing,
          totalBalance: totalBalance,
          credits: state.credits
        });
        // Optional: Limitiere die Länge auf 1000 Einträge
        if (state.statistics.globalStatsHistory.length > 1000) {
          state.statistics.globalStatsHistory = state.statistics.globalStatsHistory.slice(-1000);
        }
      }
    },
    unlockModule: (state, action) => {
      if (!state.unlockedModules.includes(action.payload)) {
        state.unlockedModules.push(action.payload);
        // Füge alle Startrezepte des Moduls zu unlockedRecipes hinzu
        const moduleKey = Object.keys(MODULES).find(key => MODULES[key].id === action.payload);
        if (moduleKey) {
          MODULES[moduleKey].recipes.forEach(recipeId => {
            if (!state.unlockedRecipes.includes(recipeId)) {
              state.unlockedRecipes.push(recipeId);
            }
          });
        }
      }
    },
    researchTechnology: (state, action) => {
      const { technologyId, cost } = action.payload;
      if (state.researchPoints >= cost && !state.researchedTechnologies.includes(technologyId)) {
        state.researchPoints -= cost;
        state.researchedTechnologies.push(technologyId);
        // Unlock recipes/resources from research
        // Suche die Technologie in allen Research-Trees
        for (const moduleKey in RESEARCH_TREE) {
          const tech = RESEARCH_TREE[moduleKey].technologies[technologyId];
          if (tech) {
            if (tech.unlocks?.recipes) {
              tech.unlocks.recipes.forEach(recipeId => {
                if (!state.unlockedRecipes.includes(recipeId)) {
                  state.unlockedRecipes.push(recipeId);
                }
              });
            }
            if (tech.unlocks?.resources) {
              tech.unlocks.resources.forEach(resourceId => {
                if (!state.unlockedResources.includes(resourceId)) {
                  state.unlockedResources.push(resourceId);
                }
              });
            }
          }
        }
      }
    },
    // New reducers for statistics
    recordResourceChange: (state, action) => {
      const { resourceId, amount } = action.payload;
      const timestamp = Date.now();
      
      if (!state.statistics.resourceHistory[resourceId]) {
        state.statistics.resourceHistory[resourceId] = [];
      }
      
      state.statistics.resourceHistory[resourceId].push({
        timestamp,
        amount: state.resources[resourceId].amount
      });
    },
    recordSale: (state, action) => {
      const { amount, resourceId } = action.payload;
      const timestamp = Date.now();
      
      state.statistics.salesHistory.push({
        timestamp,
        amount,
        resourceId
      });
    },
    recordPurchase: (state, action) => {
      const { amount, resourceId } = action.payload;
      const timestamp = Date.now();
      
      state.statistics.purchaseHistory.push({
        timestamp,
        amount,
        resourceId
      });
    },
    recordProduction: (state, action) => {
      const { productionLineId, amount } = action.payload;
      const timestamp = Date.now();
      
      state.statistics.productionHistory.push({
        timestamp,
        productionLineId,
        amount
      });
    },
    recordProfit: (state, action) => {
      const { profit, productionLineId } = action.payload;
      const timestamp = Date.now();
      state.statistics.profitHistory.push({
        timestamp,
        profit,
        productionLineId
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
  setOutputTarget,
  handlePing,
  unlockModule,
  researchTechnology,
  recordResourceChange,
  recordSale,
  recordPurchase,
  recordProduction,
  recordProfit
} = gameSlice.actions;

export default gameSlice.reducer; 