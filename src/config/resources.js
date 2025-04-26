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
  biomass: {
    id: 'biomass',
    name: 'Biomasse',
    basePrice: 10,
    description: 'Organisches Material, vielseitig einsetzbar',
    icon: '🌱',
    purchasable: true
  },
  fertilizer: {
    id: 'fertilizer',
    name: 'Dünger',
    basePrice: 30,
    description: 'Verbessert das Pflanzenwachstum',
    icon: '🧪',
    purchasable: false
  },
  compost: {
    id: 'compost',
    name: 'Kompost',
    basePrice: 15,
    description: 'Organischer Dünger',
    icon: '🪱',
    purchasable: true
  },
  organic_vegetables: {
    id: 'organic_vegetables',
    name: 'Bio-Gemüse',
    basePrice: 40,
    description: 'Gesundes Bio-Gemüse',
    icon: '🥦',
    purchasable: false
  },
  solar_panel: {
    id: 'solar_panel',
    name: 'Solarmodul',
    basePrice: 120,
    description: 'Erzeugt Strom aus Sonnenlicht',
    icon: '🔆',
    purchasable: false
  },
  battery: {
    id: 'battery',
    name: 'Batterie',
    basePrice: 80,
    description: 'Speichert Energie',
    icon: '🔋',
    purchasable: false
  },
  steel: {
    id: 'steel',
    name: 'Stahl',
    basePrice: 50,
    description: 'Wichtiger Werkstoff',
    icon: '🛡️',
    purchasable: false
  },
  explosives: {
    id: 'explosives',
    name: 'Sprengstoff',
    basePrice: 100,
    description: 'Für Waffen und Bau',
    icon: '💣',
    purchasable: false
  },
  rocket: {
    id: 'rocket',
    name: 'Rakete',
    basePrice: 500,
    description: 'Fortschrittliche Waffe',
    icon: '🚀',
    purchasable: false
  },
  coal: {
    id: 'coal',
    name: 'Kohle',
    basePrice: 12,
    description: 'Brennstoff für die Stahlproduktion',
    icon: '⚫',
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
  },
  fertilizer: {
    id: 'fertilizer',
    name: 'Dünger',
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
    name: 'Kompost',
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
    name: 'Bio-Gemüse',
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
    name: 'Solarmodul',
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
    name: 'Batterie',
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
    name: 'Stahl',
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
    name: 'Sprengstoff',
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
    name: 'Rakete',
    productionTime: 20,
    inputs: [
      { resourceId: 'steel', amount: 2 },
      { resourceId: 'explosives', amount: 2 }
    ],
    output: {
      resourceId: 'rocket',
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
  coal: 0
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