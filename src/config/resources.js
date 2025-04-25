export const RESOURCES = {
  iron: {
    id: 'iron',
    name: 'Eisen',
    basePrice: 10,
    description: 'Ein wichtiger Grundstoff für die Produktion',
    icon: '🪨',
    purchasable: true // Kann über Einkaufsmodul beschafft werden
  },
  copper: {
    id: 'copper',
    name: 'Kupfer',
    basePrice: 15,
    description: 'Ein wertvoller Rohstoff für die Elektronik',
    icon: '🔶',
    purchasable: true
  },
  oil: {
    id: 'oil',
    name: 'Öl',
    basePrice: 20,
    description: 'Schwarzes Gold, essentiell für viele Produkte',
    icon: '🛢️',
    purchasable: true
  },
  water: {
    id: 'water',
    name: 'Wasser',
    basePrice: 5,
    description: 'Grundlegend für viele chemische Prozesse',
    icon: '💧',
    purchasable: true
  },
  wood: {
    id: 'wood',
    name: 'Holz',
    basePrice: 8,
    description: 'Ein vielseitiger Grundstoff',
    icon: '🪵',
    purchasable: true
  },
  stone: {
    id: 'stone',
    name: 'Stein',
    basePrice: 8,
    description: 'Ein stabiler Baustoff',
    icon: '⛰️',
    purchasable: true
  },
  // Hergestellte Produkte
  electrochip: {
    id: 'electrochip',
    name: 'Elektrochip',
    basePrice: 50,
    description: 'Ein elektronisches Bauteil',
    icon: '💻',
    purchasable: false
  },
  watergas: {
    id: 'watergas',
    name: 'Wassergas',
    basePrice: 30,
    description: 'Ein Gasgemisch aus Wasserstoff und Kohlenmonoxid',
    icon: '☁️',
    purchasable: false
  },
  plastic: {
    id: 'plastic',
    name: 'Plastik',
    basePrice: 40,
    description: 'Ein vielseitiger Kunststoff',
    icon: '🧊',
    purchasable: false
  },
  woodplanks: {
    id: 'woodplanks',
    name: 'Holzbretter',
    basePrice: 25,
    description: 'Verarbeitetes Holz für weitere Produktion',
    icon: '📏',
    purchasable: false
  },
  circuit: {
    id: 'circuit',
    name: 'Schaltkreis',
    basePrice: 100,
    description: 'Ein komplexes elektronisches Bauteil',
    icon: '🔌',
    purchasable: false
  }
};

export const PRODUCTION_RECIPES = {
  // Einfache Rezepte mit einem Input
  watergas: {
    id: 'watergas',
    name: 'Wassergas',
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
    name: 'Holzbretter',
    productionTime: 8,
    inputs: [
      { resourceId: 'wood', amount: 2 }
    ],
    output: {
      resourceId: 'woodplanks',
      amount: 3
    }
  },
  // Rezepte mit zwei Inputs
  plastic: {
    id: 'plastic',
    name: 'Plastik',
    productionTime: 12,
    inputs: [
      { resourceId: 'oil', amount: 2 },
      { resourceId: 'watergas', amount: 1 } // Benötigt hergestelltes Wassergas
    ],
    output: {
      resourceId: 'plastic',
      amount: 1
    }
  },
  electrochip: {
    id: 'electrochip',
    name: 'Elektrochip',
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
  // Komplexes Rezept mit hergestelltem Input
  circuit: {
    id: 'circuit',
    name: 'Schaltkreis',
    productionTime: 15,
    inputs: [
      { resourceId: 'electrochip', amount: 2 }, // Benötigt hergestellte Elektrochips
      { resourceId: 'plastic', amount: 1 }      // Benötigt hergestelltes Plastik
    ],
    output: {
      resourceId: 'circuit',
      amount: 1
    }
  }
};

// Mögliche Quellen für Inputs
export const INPUT_SOURCES = {
  GLOBAL_STORAGE: 'GLOBAL_STORAGE',
  PURCHASE_MODULE: 'PURCHASE_MODULE'
};

// Mögliche Ziele für Outputs
export const OUTPUT_TARGETS = {
  GLOBAL_STORAGE: 'GLOBAL_STORAGE',
  AUTO_SELL: 'AUTO_SELL'
};

export const INITIAL_RESOURCES = {
  iron: 20,
  copper: 20,
  oil: 0,
  water: 0,
  wood: 0,
  stone: 0,
  electrochip: 0,
  watergas: 0,
  plastic: 0,
  woodplanks: 0,
  circuit: 0
};

// Storage configuration
export const STORAGE_CONFIG = {
  BASE_CAPACITY: 200,          // Grundkapazität pro Rohstoff
  UPGRADE_CAPACITY: 200,       // Zusätzliche Kapazität pro Upgrade
  BASE_COST: 200,             // Grundkosten für ein Upgrade
  COST_MULTIPLIER: 1.5,       // Kostenmultiplikator pro Level
};

// Berechnet die Kosten für das nächste Storage-Level
export const calculateUpgradeCost = (currentLevel) => {
  return Math.floor(STORAGE_CONFIG.BASE_COST * Math.pow(STORAGE_CONFIG.COST_MULTIPLIER, currentLevel - 1));
}; 