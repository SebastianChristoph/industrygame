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
  wood: {
    id: 'wood',
    name: 'Holz',
    basePrice: 5,
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
  electrochip: {
    id: 'electrochip',
    name: 'Elektrochip',
    basePrice: 50,
    description: 'Ein elektronisches Bauteil',
    icon: '💻',
    purchasable: false
  }
};

export const PRODUCTION_RECIPES = {
  electrochip: {
    id: 'electrochip',
    name: 'Elektrochip',
    productionTime: 10, // in Pings
    inputs: [
      { resourceId: 'copper', amount: 1 },
      { resourceId: 'iron', amount: 1 }
    ],
    output: {
      resourceId: 'electrochip',
      amount: 1
    }
  }
  // Hier können weitere Rezepte hinzugefügt werden
};

// Mögliche Quellen für Inputs
export const INPUT_SOURCES = {
  GLOBAL_STORAGE: 'GLOBAL_STORAGE',
  PURCHASE_MODULE: 'PURCHASE_MODULE'
};

export const INITIAL_RESOURCES = {
  iron: 20,
  copper: 20,
  wood: 0,
  stone: 0,
  electrochip: 0
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