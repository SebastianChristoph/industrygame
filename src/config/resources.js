export const RESOURCES = {
  // Base Materials
  water: { id: 'water', name: 'Water', basePrice: 5, description: 'Essential for life.', icon: '💧', purchasable: true },
  seeds: { id: 'seeds', name: 'Seeds', basePrice: 10, description: 'Used for growing crops.', icon: '🌱', purchasable: true },
  iron: { id: 'iron', name: 'Iron', basePrice: 15, description: 'Basic industrial metal.', icon: '⛓️', purchasable: true },
  copper: { id: 'copper', name: 'Copper', basePrice: 20, description: 'Used in electronics.', icon: '🔶', purchasable: true },
  coal: { id: 'coal', name: 'Coal', basePrice: 12, description: 'Fuel for industry.', icon: '⚫', purchasable: true },
  oil: { id: 'oil', name: 'Oil', basePrice: 25, description: 'Liquid energy source.', icon: '🛢️', purchasable: true },

  // Agricultural Products
  wheat: { id: 'wheat', name: 'Wheat', basePrice: 40, description: 'Basic crop.', icon: '🌾', purchasable: false }, // vorher 15
  flour: { id: 'flour', name: 'Flour', basePrice: 90, description: 'Processed wheat.', icon: '🥖', purchasable: false }, // vorher 30
  bread: { id: 'bread', name: 'Bread', basePrice: 180, description: 'Staple food.', icon: '🍞', purchasable: false }, // vorher 60
  biofuel: { id: 'biofuel', name: 'Biofuel', basePrice: 200, description: 'Alternative fuel.', icon: '⛽', purchasable: false }, // vorher 100

  // Technology Products
  copper_wire: { id: 'copper_wire', name: 'Copper Wire', basePrice: 60, description: 'Conducts electricity.', icon: '🧵', purchasable: false }, // vorher 30
  circuit_board: { id: 'circuit_board', name: 'Circuit Board', basePrice: 150, description: 'Electronic component.', icon: '📟', purchasable: false }, // vorher 70
  computer: { id: 'computer', name: 'Computer', basePrice: 400, description: 'High-tech device.', icon: '💻', purchasable: false }, // vorher 150
  quantum_chip: { id: 'quantum_chip', name: 'Quantum Chip', basePrice: 1000, description: 'Next-gen processing.', icon: '🧬', purchasable: false }, // vorher 300

  // Weapon Products
  gunpowder: { id: 'gunpowder', name: 'Gunpowder', basePrice: 50, description: 'Used in ammunition.', icon: '🎇', purchasable: false }, // vorher 20
  bullet: { id: 'bullet', name: 'Bullet', basePrice: 120, description: 'Basic ammunition.', icon: '🔫', purchasable: false }, // vorher 50
  rifle: { id: 'rifle', name: 'Rifle', basePrice: 300, description: 'Standard firearm.', icon: '🏹', purchasable: false }, // vorher 120
  tank: { id: 'tank', name: 'Tank', basePrice: 1000, description: 'Heavy war machine.', icon: '🛡️', purchasable: false }, // vorher 300

  // Special
  research_points: { id: 'research_points', name: 'Research Points', basePrice: 50, description: 'Used for unlocking technologies.', icon: '🔬', purchasable: false }
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
  research_points: 0
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
