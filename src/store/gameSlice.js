import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_RESOURCES, BASE_STORAGE_CAPACITY } from '../config/resources';

const STORAGE_UPGRADE_COST = 200; // Cost per storage upgrade

const initialState = {
  credits: 1000, // Starting credits
  resources: Object.keys(INITIAL_RESOURCES).reduce((acc, resource) => ({
    ...acc,
    [resource]: {
      amount: INITIAL_RESOURCES[resource],
      capacity: BASE_STORAGE_CAPACITY,
      storageLevel: 1 // Track storage level for each resource
    }
  }), {}),
  warehouses: 0, // Number of warehouses owned
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
          state.resources[resource].capacity += BASE_STORAGE_CAPACITY;
        });
      }
    },
    upgradeStorage: (state, action) => {
      const resourceId = action.payload;
      if (state.credits >= STORAGE_UPGRADE_COST) {
        state.credits -= STORAGE_UPGRADE_COST;
        state.resources[resourceId].capacity += BASE_STORAGE_CAPACITY;
        state.resources[resourceId].storageLevel += 1;
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
  upgradeStorage 
} = gameSlice.actions;

export default gameSlice.reducer; 