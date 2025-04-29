export const RESOURCES = {
  // Base Materials
  water: { id: 'water', name: 'Water', basePrice: 5, description: 'Essential for life.', icon: '💧', purchasable: true },
  seeds: { id: 'seeds', name: 'Seeds', basePrice: 10, description: 'Used for growing crops.', icon: '🌱', purchasable: true },
  iron: { id: 'iron', name: 'Iron', basePrice: 15, description: 'Basic industrial metal.', icon: '⛓️', purchasable: true },
  copper: { id: 'copper', name: 'Copper', basePrice: 20, description: 'Used in electronics.', icon: '🔶', purchasable: true },
  coal: { id: 'coal', name: 'Coal', basePrice: 12, description: 'Fuel for industry.', icon: '⚫', purchasable: true },
  oil: { id: 'oil', name: 'Oil', basePrice: 25, description: 'Liquid energy source.', icon: '🛢️', purchasable: true },

  // Agricultural Products
  wheat: { id: 'wheat', name: 'Wheat', basePrice: 40, description: 'Basic crop.', icon: '🌾', purchasable: false },
  flour: { id: 'flour', name: 'Flour', basePrice: 90, description: 'Processed wheat.', icon: '🥖', purchasable: false },
  bread: { id: 'bread', name: 'Bread', basePrice: 180, description: 'Staple food.', icon: '🍞', purchasable: false },
  biofuel: { id: 'biofuel', name: 'Biofuel', basePrice: 200, description: 'Alternative fuel.', icon: '⛽', purchasable: false },
  corn: { id: 'corn', name: 'Corn', basePrice: 30, description: 'A basic crop, easy to sell.', icon: '🌽', purchasable: false },
  // New Agricultural Products
  organic_fertilizer: { id: 'organic_fertilizer', name: 'Organic Fertilizer', basePrice: 150, description: 'Natural plant growth enhancer.', icon: '💩', purchasable: false },
  hybrid_seeds: { id: 'hybrid_seeds', name: 'Hybrid Seeds', basePrice: 300, description: 'Genetically enhanced seeds.', icon: '🧬', purchasable: false },
  premium_wine: { id: 'premium_wine', name: 'Premium Wine', basePrice: 800, description: 'High-quality fermented beverage.', icon: '🍷', purchasable: false },
  luxury_food: { id: 'luxury_food', name: 'Luxury Food', basePrice: 1200, description: 'Gourmet food products.', icon: '🍽️', purchasable: false },

  // Technology Products
  copper_wire: { id: 'copper_wire', name: 'Copper Wire', basePrice: 60, description: 'Conducts electricity.', icon: '🧵', purchasable: false },
  circuit_board: { id: 'circuit_board', name: 'Circuit Board', basePrice: 150, description: 'Electronic component.', icon: '📟', purchasable: false },
  computer: { id: 'computer', name: 'Computer', basePrice: 400, description: 'High-tech device.', icon: '💻', purchasable: false },
  quantum_chip: { id: 'quantum_chip', name: 'Quantum Chip', basePrice: 1000, description: 'Next-gen processing.', icon: '🧬', purchasable: false },
  basic_chip: { id: 'basic_chip', name: 'Basic Chip', basePrice: 60, description: 'A simple electronic chip.', icon: '💾', purchasable: false },
  // New Technology Products
  solar_panel: { id: 'solar_panel', name: 'Solar Panel', basePrice: 300, description: 'Renewable energy source.', icon: '☀️', purchasable: false },
  smart_device: { id: 'smart_device', name: 'Smart Device', basePrice: 600, description: 'Advanced consumer electronics.', icon: '📱', purchasable: false },
  ai_processor: { id: 'ai_processor', name: 'AI Processor', basePrice: 1500, description: 'Advanced AI computing unit.', icon: '🤖', purchasable: false },
  quantum_computer: { id: 'quantum_computer', name: 'Quantum Computer', basePrice: 3000, description: 'Next-generation computing power.', icon: '⚛️', purchasable: false },

  // Weapon Products
  gunpowder: { id: 'gunpowder', name: 'Gunpowder', basePrice: 50, description: 'Used in ammunition.', icon: '🎇', purchasable: false },
  bullet: { id: 'bullet', name: 'Bullet', basePrice: 120, description: 'Basic ammunition.', icon: '🔫', purchasable: false },
  rifle: { id: 'rifle', name: 'Rifle', basePrice: 300, description: 'Standard firearm.', icon: '🏹', purchasable: false },
  tank: { id: 'tank', name: 'Tank', basePrice: 1000, description: 'Heavy war machine.', icon: '🛡️', purchasable: false },
  metal_plate: { id: 'metal_plate', name: 'Metal Plate', basePrice: 20, description: 'Recycled metal, can be sold.', icon: '🔩', purchasable: false },
  // New Weapon Products
  advanced_armor: { id: 'advanced_armor', name: 'Advanced Armor', basePrice: 400, description: 'Enhanced protective gear.', icon: '🛡️', purchasable: false },
  combat_drone: { id: 'combat_drone', name: 'Combat Drone', basePrice: 800, description: 'Unmanned aerial weapon.', icon: '🚁', purchasable: false },
  missile_system: { id: 'missile_system', name: 'Missile System', basePrice: 2000, description: 'Long-range weapon system.', icon: '🚀', purchasable: false },
  mech_suit: { id: 'mech_suit', name: 'Mech Suit', basePrice: 4000, description: 'Advanced combat exoskeleton.', icon: '🤖', purchasable: false },

  // Special
  research_points: { id: 'research_points', name: 'Research Points', basePrice: 50, description: 'Used for unlocking technologies.', icon: '🔬', purchasable: false },
  steel: { id: 'steel', name: 'Steel', basePrice: 40, description: 'Advanced metal alloy.', icon: '⚙️', purchasable: false }
};

export const PRODUCTION_RECIPES = {
  wheat: { id: 'wheat', name: 'Wheat', productionTime: 5, inputs: [{ resourceId: 'seeds', amount: 2 }, { resourceId: 'water', amount: 3 }], output: { resourceId: 'wheat', amount: 2 } },
  flour: { id: 'flour', name: 'Flour', productionTime: 10, inputs: [{ resourceId: 'wheat', amount: 2 }], output: { resourceId: 'flour', amount: 2 } },
  bread: { id: 'bread', name: 'Bread', productionTime: 20, inputs: [{ resourceId: 'flour', amount: 2 }, { resourceId: 'water', amount: 1 }], output: { resourceId: 'bread', amount: 2 } },
  biofuel: { id: 'biofuel', name: 'Biofuel', productionTime: 30, inputs: [{ resourceId: 'wheat', amount: 4 }], output: { resourceId: 'biofuel', amount: 1 } },

  copper_wire: { id: 'copper_wire', name: 'Copper Wire', productionTime: 5, inputs: [{ resourceId: 'copper', amount: 2 }], output: { resourceId: 'copper_wire', amount: 3 } },
  circuit_board: { id: 'circuit_board', name: 'Circuit Board', productionTime: 10, inputs: [{ resourceId: 'copper_wire', amount: 2 }, { resourceId: 'iron', amount: 1 }], output: { resourceId: 'circuit_board', amount: 2 } },
  computer: { id: 'computer', name: 'Computer', productionTime: 20, inputs: [{ resourceId: 'circuit_board', amount: 2 }], output: { resourceId: 'computer', amount: 1 } },
  quantum_chip: { id: 'quantum_chip', name: 'Quantum Chip', productionTime: 40, inputs: [{ resourceId: 'computer', amount: 2 }], output: { resourceId: 'quantum_chip', amount: 1 } },

  gunpowder: { id: 'gunpowder', name: 'Gunpowder', productionTime: 5, inputs: [{ resourceId: 'coal', amount: 2 }, { resourceId: 'oil', amount: 1 }], output: { resourceId: 'gunpowder', amount: 2 } },
  bullet: { id: 'bullet', name: 'Bullet', productionTime: 10, inputs: [{ resourceId: 'gunpowder', amount: 2 }], output: { resourceId: 'bullet', amount: 4 } },
  rifle: { id: 'rifle', name: 'Rifle', productionTime: 20, inputs: [{ resourceId: 'bullet', amount: 4 }, { resourceId: 'iron', amount: 2 }], output: { resourceId: 'rifle', amount: 1 } },
  tank: { id: 'tank', name: 'Tank', productionTime: 40, inputs: [{ resourceId: 'rifle', amount: 2 }, { resourceId: 'steel', amount: 4 }], output: { resourceId: 'tank', amount: 1 } },
  research_points_agriculture: {
    id: 'research_points_agriculture',
    name: 'Agriculture Research',
    productionTime: 10,
    inputs: [
      { resourceId: 'seeds', amount: 1 },
      { resourceId: 'water', amount: 1 }
    ],
    output: { resourceId: 'research_points', amount: 1 }
  },
  research_points_technology: {
    id: 'research_points_technology',
    name: 'Technology Research',
    productionTime: 10,
    inputs: [
      { resourceId: 'iron', amount: 1 },
      { resourceId: 'copper', amount: 1 }
    ],
    output: { resourceId: 'research_points', amount: 1 }
  },
  research_points_weapon: {
    id: 'research_points_weapon',
    name: 'Weapons Research',
    productionTime: 10,
    inputs: [
      { resourceId: 'coal', amount: 1 },
      { resourceId: 'oil', amount: 1 }
    ],
    output: { resourceId: 'research_points', amount: 1 }
  },
  corn: {
    id: 'corn',
    name: 'Corn',
    productionTime: 5,
    inputs: [
      { resourceId: 'seeds', amount: 1 },
      { resourceId: 'water', amount: 2 }
    ],
    output: { resourceId: 'corn', amount: 2 }
  },
  basic_chip: {
    id: 'basic_chip',
    name: 'Basic Chip',
    productionTime: 6,
    inputs: [
      { resourceId: 'iron', amount: 1 },
      { resourceId: 'copper', amount: 1 }
    ],
    output: { resourceId: 'basic_chip', amount: 1 }
  },
  metal_plate: {
    id: 'metal_plate',
    name: 'Metal Plate',
    productionTime: 4,
    inputs: [
      { resourceId: 'coal', amount: 1 }
    ],
    output: { resourceId: 'metal_plate', amount: 2 }
  },
  organic_fertilizer: {
    id: 'organic_fertilizer',
    name: 'Organic Fertilizer',
    productionTime: 15,
    inputs: [
      { resourceId: 'corn', amount: 2 },
      { resourceId: 'water', amount: 3 }
    ],
    output: { resourceId: 'organic_fertilizer', amount: 1 }
  },
  hybrid_seeds: {
    id: 'hybrid_seeds',
    name: 'Hybrid Seeds',
    productionTime: 20,
    inputs: [
      { resourceId: 'seeds', amount: 3 },
      { resourceId: 'organic_fertilizer', amount: 1 }
    ],
    output: { resourceId: 'hybrid_seeds', amount: 2 }
  },
  premium_wine: {
    id: 'premium_wine',
    name: 'Premium Wine',
    productionTime: 30,
    inputs: [
      { resourceId: 'hybrid_seeds', amount: 2 },
      { resourceId: 'water', amount: 4 }
    ],
    output: { resourceId: 'premium_wine', amount: 1 }
  },
  luxury_food: {
    id: 'luxury_food',
    name: 'Luxury Food',
    productionTime: 40,
    inputs: [
      { resourceId: 'premium_wine', amount: 1 },
      { resourceId: 'bread', amount: 2 }
    ],
    output: { resourceId: 'luxury_food', amount: 1 }
  },

  solar_panel: {
    id: 'solar_panel',
    name: 'Solar Panel',
    productionTime: 15,
    inputs: [
      { resourceId: 'copper_wire', amount: 3 },
      { resourceId: 'circuit_board', amount: 1 }
    ],
    output: { resourceId: 'solar_panel', amount: 1 }
  },
  smart_device: {
    id: 'smart_device',
    name: 'Smart Device',
    productionTime: 20,
    inputs: [
      { resourceId: 'circuit_board', amount: 2 },
      { resourceId: 'basic_chip', amount: 1 }
    ],
    output: { resourceId: 'smart_device', amount: 1 }
  },
  ai_processor: {
    id: 'ai_processor',
    name: 'AI Processor',
    productionTime: 30,
    inputs: [
      { resourceId: 'smart_device', amount: 2 },
      { resourceId: 'quantum_chip', amount: 1 }
    ],
    output: { resourceId: 'ai_processor', amount: 1 }
  },
  quantum_computer: {
    id: 'quantum_computer',
    name: 'Quantum Computer',
    productionTime: 40,
    inputs: [
      { resourceId: 'ai_processor', amount: 2 },
      { resourceId: 'quantum_chip', amount: 3 }
    ],
    output: { resourceId: 'quantum_computer', amount: 1 }
  },

  advanced_armor: {
    id: 'advanced_armor',
    name: 'Advanced Armor',
    productionTime: 15,
    inputs: [
      { resourceId: 'metal_plate', amount: 3 },
      { resourceId: 'steel', amount: 2 }
    ],
    output: { resourceId: 'advanced_armor', amount: 1 }
  },
  combat_drone: {
    id: 'combat_drone',
    name: 'Combat Drone',
    productionTime: 20,
    inputs: [
      { resourceId: 'advanced_armor', amount: 1 },
      { resourceId: 'basic_chip', amount: 2 }
    ],
    output: { resourceId: 'combat_drone', amount: 1 }
  },
  missile_system: {
    id: 'missile_system',
    name: 'Missile System',
    productionTime: 30,
    inputs: [
      { resourceId: 'combat_drone', amount: 2 },
      { resourceId: 'gunpowder', amount: 4 }
    ],
    output: { resourceId: 'missile_system', amount: 1 }
  },
  mech_suit: {
    id: 'mech_suit',
    name: 'Mech Suit',
    productionTime: 40,
    inputs: [
      { resourceId: 'missile_system', amount: 1 },
      { resourceId: 'ai_processor', amount: 2 }
    ],
    output: { resourceId: 'mech_suit', amount: 1 }
  }
};

export const INITIAL_RESOURCES = {
  water: 20,
  seeds: 20,
  iron: 10,
  copper: 10,
  coal: 10,
  oil: 10,
  wheat: 0,
  flour: 0,
  bread: 0,
  biofuel: 0,
  copper_wire: 0,
  circuit_board: 0,
  computer: 0,
  quantum_chip: 0,
  gunpowder: 0,
  bullet: 0,
  rifle: 0,
  tank: 0,
  research_points: 0,
  corn: 0,
  basic_chip: 0,
  metal_plate: 0
};

// Possible sources for inputs
export const INPUT_SOURCES = {
  GLOBAL_STORAGE: 'GLOBAL_STORAGE',
  PURCHASE_MODULE: 'PURCHASE_MODULE'
};

// Possible targets for outputs
export const OUTPUT_TARGETS = {
  GLOBAL_STORAGE: 'GLOBAL_STORAGE',
  AUTO_SELL: 'AUTO_SELL',
  RESEARCH_POINTS: 'RESEARCH_POINTS'
};

// Storage configuration
export const STORAGE_CONFIG = {
  BASE_CAPACITY: 200,          // Base capacity per resource
  UPGRADE_CAPACITY: 200,        // Additional capacity per upgrade
  BASE_COST: 200,               // Base cost for an upgrade
  COST_MULTIPLIER: 1.5          // Cost multiplier per level
};

// Calculates the cost for the next storage level
export const calculateUpgradeCost = (currentLevel) => {
  return Math.floor(STORAGE_CONFIG.BASE_COST * Math.pow(STORAGE_CONFIG.COST_MULTIPLIER, currentLevel - 1));
};
