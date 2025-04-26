export const RESOURCES = {
  iron: {
    id: 'iron',
    name: 'Iron',
    basePrice: 10,
    description: 'An important basic material for production',
    icon: '🪨',
    purchasable: true // Can be purchased through purchase module
  },
  copper: {
    id: 'copper',
    name: 'Copper',
    basePrice: 15,
    description: 'A valuable raw material for electronics',
    icon: '🔶',
    purchasable: true
  },
  oil: {
    id: 'oil',
    name: 'Oil',
    basePrice: 20,
    description: 'Black gold, essential for many products',
    icon: '🛢️',
    purchasable: true
  },
  water: {
    id: 'water',
    name: 'Water',
    basePrice: 5,
    description: 'Fundamental for many chemical processes',
    icon: '💧',
    purchasable: true
  },
  wood: {
    id: 'wood',
    name: 'Wood',
    basePrice: 8,
    description: 'A versatile basic material',
    icon: '🪵',
    purchasable: true
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    basePrice: 8,
    description: 'A stable building material',
    icon: '⛰️',
    purchasable: true
  },
  biomass: {
    id: 'biomass',
    name: 'Biomass',
    basePrice: 10,
    description: 'Organic material, versatile in use',
    icon: '🌱',
    purchasable: true
  },
  fertilizer: {
    id: 'fertilizer',
    name: 'Fertilizer',
    basePrice: 30,
    description: 'Improves plant growth',
    icon: '🧪',
    purchasable: false
  },
  compost: {
    id: 'compost',
    name: 'Compost',
    basePrice: 15,
    description: 'Organic fertilizer',
    icon: '🪱',
    purchasable: true
  },
  organic_vegetables: {
    id: 'organic_vegetables',
    name: 'Organic Vegetables',
    basePrice: 40,
    description: 'Healthy organic vegetables',
    icon: '🥦',
    purchasable: false
  },
  solar_panel: {
    id: 'solar_panel',
    name: 'Solar Panel',
    basePrice: 120,
    description: 'Generates electricity from sunlight',
    icon: '🔆',
    purchasable: false
  },
  battery: {
    id: 'battery',
    name: 'Battery',
    basePrice: 80,
    description: 'Stores energy',
    icon: '🔋',
    purchasable: false
  },
  steel: {
    id: 'steel',
    name: 'Steel',
    basePrice: 50,
    description: 'Important construction material',
    icon: '🛡️',
    purchasable: false
  },
  explosives: {
    id: 'explosives',
    name: 'Explosives',
    basePrice: 100,
    description: 'For weapons and construction',
    icon: '💣',
    purchasable: false
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    basePrice: 500,
    description: 'Advanced weapon',
    icon: '🚀',
    purchasable: false
  },
  coal: {
    id: 'coal',
    name: 'Coal',
    basePrice: 12,
    description: 'Fuel for steel production',
    icon: '⚫',
    purchasable: true
  },
  // Manufactured products
  electrochip: {
    id: 'electrochip',
    name: 'Electrochip',
    basePrice: 50,
    description: 'An electronic component',
    icon: '💻',
    purchasable: false
  },
  watergas: {
    id: 'watergas',
    name: 'Water Gas',
    basePrice: 30,
    description: 'A gas mixture of hydrogen and carbon monoxide',
    icon: '☁️',
    purchasable: false
  },
  plastic: {
    id: 'plastic',
    name: 'Plastic',
    basePrice: 40,
    description: 'A versatile plastic',
    icon: '🧊',
    purchasable: false
  },
  woodplanks: {
    id: 'woodplanks',
    name: 'Wood Planks',
    basePrice: 25,
    description: 'Processed wood for further production',
    icon: '📏',
    purchasable: false
  },
  circuit: {
    id: 'circuit',
    name: 'Circuit',
    basePrice: 100,
    description: 'A complex electronic component',
    icon: '🔌',
    purchasable: false
  },
  research_points: {
    id: 'research_points',
    name: 'Research Points',
    basePrice: 50,
    description: 'Points used for research and development',
    icon: '🔬',
    purchasable: false
  }
};

export const PRODUCTION_RECIPES = {
  // Simple recipes with one input
  watergas: {
    id: 'watergas',
    name: 'Water Gas',
    productionTime: 2,
    inputs: [
      { resourceId: 'water', amount: 2 }
    ],
    output: {
      resourceId: 'watergas',
      amount: 1
    }
  },
  woodplanks: {
    id: 'woodplanks',
    name: 'Wood Planks',
    productionTime: 8,
    inputs: [
      { resourceId: 'wood', amount: 2 }
    ],
    output: {
      resourceId: 'woodplanks',
      amount: 3
    }
  },
  // Recipes with two inputs
  plastic: {
    id: 'plastic',
    name: 'Plastic',
    productionTime: 12,
    inputs: [
      { resourceId: 'oil', amount: 2 },
      { resourceId: 'watergas', amount: 1 } // Requires manufactured water gas
    ],
    output: {
      resourceId: 'plastic',
      amount: 1
    }
  },
  electrochip: {
    id: 'electrochip',
    name: 'Electrochip',
    productionTime: 10,
    inputs: [
      { resourceId: 'copper', amount: 1 },
      { resourceId: 'iron', amount: 1 }
    ],
    output: {
      resourceId: 'electrochip',
      amount: 1
    }
  },
  // Complex recipe with manufactured input
  circuit: {
    id: 'circuit',
    name: 'Circuit',
    productionTime: 15,
    inputs: [
      { resourceId: 'electrochip', amount: 2 }, // Requires manufactured electrochips
      { resourceId: 'plastic', amount: 1 }      // Requires manufactured plastic
    ],
    output: {
      resourceId: 'circuit',
      amount: 1
    }
  },
  fertilizer: {
    id: 'fertilizer',
    name: 'Fertilizer',
    productionTime: 5,
    inputs: [
      { resourceId: 'water', amount: 1 },
      { resourceId: 'biomass', amount: 1 }
    ],
    output: {
      resourceId: 'fertilizer',
      amount: 1
    }
  },
  compost: {
    id: 'compost',
    name: 'Compost',
    productionTime: 6,
    inputs: [
      { resourceId: 'biomass', amount: 2 }
    ],
    output: {
      resourceId: 'compost',
      amount: 1
    }
  },
  organic_vegetables: {
    id: 'organic_vegetables',
    name: 'Organic Vegetables',
    productionTime: 10,
    inputs: [
      { resourceId: 'compost', amount: 1 },
      { resourceId: 'water', amount: 2 }
    ],
    output: {
      resourceId: 'organic_vegetables',
      amount: 2
    }
  },
  solar_panel: {
    id: 'solar_panel',
    name: 'Solar Panel',
    productionTime: 12,
    inputs: [
      { resourceId: 'copper', amount: 2 },
      { resourceId: 'plastic', amount: 2 }
    ],
    output: {
      resourceId: 'solar_panel',
      amount: 1
    }
  },
  battery: {
    id: 'battery',
    name: 'Battery',
    productionTime: 8,
    inputs: [
      { resourceId: 'iron', amount: 1 },
      { resourceId: 'copper', amount: 1 }
    ],
    output: {
      resourceId: 'battery',
      amount: 1
    }
  },
  steel: {
    id: 'steel',
    name: 'Steel',
    productionTime: 10,
    inputs: [
      { resourceId: 'iron', amount: 3 },
      { resourceId: 'coal', amount: 1 }
    ],
    output: {
      resourceId: 'steel',
      amount: 2
    }
  },
  explosives: {
    id: 'explosives',
    name: 'Explosives',
    productionTime: 15,
    inputs: [
      { resourceId: 'oil', amount: 2 },
      { resourceId: 'biomass', amount: 1 }
    ],
    output: {
      resourceId: 'explosives',
      amount: 1
    }
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    productionTime: 20,
    inputs: [
      { resourceId: 'steel', amount: 2 },
      { resourceId: 'explosives', amount: 2 }
    ],
    output: {
      resourceId: 'rocket',
      amount: 1
    }
  },
  research_points_agriculture: {
    id: 'research_points_agriculture',
    name: 'Research Points (Agriculture)',
    productionTime: 10,
    inputs: [
      { resourceId: 'water', amount: 5 }
    ],
    output: {
      resourceId: 'research_points',
      amount: 1
    }
  },
  research_points_technology: {
    id: 'research_points_technology',
    name: 'Research Points (Technology)',
    productionTime: 10,
    inputs: [
      { resourceId: 'iron', amount: 5 }
    ],
    output: {
      resourceId: 'research_points',
      amount: 1
    }
  },
  research_points_weapon: {
    id: 'research_points_weapon',
    name: 'Research Points (Weapon)',
    productionTime: 10,
    inputs: [
      { resourceId: 'oil', amount: 5 }
    ],
    output: {
      resourceId: 'research_points',
      amount: 1
    }
  }
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

export const INITIAL_RESOURCES = {
  iron: 20,
  copper: 20,
  oil: 0,
  water: 0,
  wood: 0,
  stone: 0,
  biomass: 0,
  fertilizer: 0,
  electrochip: 0,
  watergas: 0,
  plastic: 0,
  woodplanks: 0,
  circuit: 0,
  compost: 0,
  organic_vegetables: 0,
  solar_panel: 0,
  battery: 0,
  steel: 0,
  explosives: 0,
  rocket: 0,
  coal: 0,
  research_points: 0
};

// Storage configuration
export const STORAGE_CONFIG = {
  BASE_CAPACITY: 200,          // Base capacity per resource
  UPGRADE_CAPACITY: 200,       // Additional capacity per upgrade
  BASE_COST: 200,             // Base cost for an upgrade
  COST_MULTIPLIER: 1.5,       // Cost multiplier per level
};

// Calculates the cost for the next storage level
export const calculateUpgradeCost = (currentLevel) => {
  return Math.floor(STORAGE_CONFIG.BASE_COST * Math.pow(STORAGE_CONFIG.COST_MULTIPLIER, currentLevel - 1));
}; 