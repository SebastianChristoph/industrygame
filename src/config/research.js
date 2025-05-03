export const RESEARCH_TREE = {
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    technologies: {
      SEEDS: {
        id: 'SEEDS',
        name: 'Seed Cultivation',
        description: 'Unlock basic wheat production.',
        cost: 100,
        requirements: [],
        unlocks: { recipes: ['wheat'] }
      },
      MILLING: {
        id: 'MILLING',
        name: 'Milling Technology',
        description: 'Unlock flour production.',
        cost: 200,
        requirements: ['SEEDS'],
        unlocks: { recipes: ['flour'] }
      },
      BAKERY: {
        id: 'BAKERY',
        name: 'Baking Technology',
        description: 'Unlock bread production.',
        cost: 400,
        requirements: ['MILLING'],
        unlocks: { recipes: ['bread'] }
      },
      BIOFUEL: {
        id: 'BIOFUEL',
        name: 'Biofuel Production',
        description: 'Turn wheat into energy.',
        cost: 600,
        requirements: ['BAKERY'],
        unlocks: { recipes: ['biofuel'] }
      },
      ORGANIC_FARMING: {
        id: 'ORGANIC_FARMING',
        name: 'Organic Farming',
        description: 'Unlock organic fertilizer production.',
        cost: 800,
        requirements: ['BIOFUEL'],
        unlocks: { recipes: ['organic_fertilizer'] }
      },
      GENETIC_ENGINEERING: {
        id: 'GENETIC_ENGINEERING',
        name: 'Genetic Engineering',
        description: 'Create hybrid seeds for better yields.',
        cost: 1200,
        requirements: ['ORGANIC_FARMING'],
        unlocks: { recipes: ['hybrid_seeds'] }
      },
      VITICULTURE: {
        id: 'VITICULTURE',
        name: 'Viticulture',
        description: 'Master the art of wine making.',
        cost: 1600,
        requirements: ['GENETIC_ENGINEERING'],
        unlocks: { recipes: ['premium_wine'] }
      },
      GOURMET_CUISINE: {
        id: 'GOURMET_CUISINE',
        name: 'Gourmet Cuisine',
        description: 'Create luxury food products.',
        cost: 2000,
        requirements: ['VITICULTURE'],
        unlocks: { recipes: ['luxury_food'] }
      }
    }
  },
  technology: {
    id: 'technology',
    name: 'Technology',
    technologies: {
      BASIC_ELECTRONICS: {
        id: 'BASIC_ELECTRONICS',
        name: 'Basic Electronics',
        description: 'Unlock copper wire production.',
        cost: 150,
        requirements: [],
        unlocks: { recipes: ['copper_wire'] }
      },
      STEEL_PRODUCTION: {
        id: 'STEEL_PRODUCTION',
        name: 'Steel Production',
        description: 'Learn to produce steel from iron and coal.',
        cost: 200,
        requirements: [],
        unlocks: { recipes: ['steel'] }
      },
      PCB_DESIGN: {
        id: 'PCB_DESIGN',
        name: 'PCB Design',
        description: 'Unlock circuit board production.',
        cost: 300,
        requirements: ['BASIC_ELECTRONICS'],
        unlocks: { recipes: ['circuit_board'] }
      },
      COMPUTER_SCIENCE: {
        id: 'COMPUTER_SCIENCE',
        name: 'Computer Production',
        description: 'Manufacture computers.',
        cost: 600,
        requirements: ['PCB_DESIGN'],
        unlocks: { recipes: ['computer'] }
      },
      QUANTUM_TECH: {
        id: 'QUANTUM_TECH',
        name: 'Quantum Technology',
        description: 'Unlock production of quantum chips.',
        cost: 1200,
        requirements: ['COMPUTER_SCIENCE'],
        unlocks: { recipes: ['quantum_chip'] }
      },
      RENEWABLE_ENERGY: {
        id: 'RENEWABLE_ENERGY',
        name: 'Renewable Energy',
        description: 'Develop solar panel technology.',
        cost: 800,
        requirements: ['PCB_DESIGN'],
        unlocks: { recipes: ['solar_panel'] }
      },
      SMART_DEVICES: {
        id: 'SMART_DEVICES',
        name: 'Smart Devices',
        description: 'Create advanced consumer electronics.',
        cost: 1000,
        requirements: ['COMPUTER_SCIENCE'],
        unlocks: { recipes: ['smart_device'] }
      },
      ARTIFICIAL_INTELLIGENCE: {
        id: 'ARTIFICIAL_INTELLIGENCE',
        name: 'Artificial Intelligence',
        description: 'Develop AI processors.',
        cost: 1600,
        requirements: ['QUANTUM_TECH'],
        unlocks: { recipes: ['ai_processor'] }
      },
      QUANTUM_COMPUTING: {
        id: 'QUANTUM_COMPUTING',
        name: 'Quantum Computing',
        description: 'Build quantum computers.',
        cost: 2000,
        requirements: ['ARTIFICIAL_INTELLIGENCE'],
        unlocks: { recipes: ['quantum_computer'] }
      }
    }
  },
  weapons: {
    id: 'weapons',
    name: 'Weapons',
    technologies: {
      EXPLOSIVES: {
        id: 'EXPLOSIVES',
        name: 'Explosives Engineering',
        description: 'Create gunpowder.',
        cost: 120,
        requirements: [],
        unlocks: { recipes: ['gunpowder'] }
      },
      AMMUNITION: {
        id: 'AMMUNITION',
        name: 'Ammunition Manufacturing',
        description: 'Produce bullets.',
        cost: 250,
        requirements: ['EXPLOSIVES'],
        unlocks: { recipes: ['bullet'] }
      },
      FIREARMS: {
        id: 'FIREARMS',
        name: 'Firearms Assembly',
        description: 'Produce rifles.',
        cost: 500,
        requirements: ['AMMUNITION'],
        unlocks: { recipes: ['rifle'] }
      },
      HEAVY_WEAPONS: {
        id: 'HEAVY_WEAPONS',
        name: 'Heavy Weapons Engineering',
        description: 'Manufacture tanks.',
        cost: 1000,
        requirements: ['FIREARMS'],
        unlocks: { recipes: ['tank'] }
      },
      ADVANCED_ARMOR: {
        id: 'ADVANCED_ARMOR',
        name: 'Advanced Armor',
        description: 'Develop enhanced protective gear.',
        cost: 800,
        requirements: ['FIREARMS'],
        unlocks: { recipes: ['advanced_armor'] }
      },
      DRONE_TECHNOLOGY: {
        id: 'DRONE_TECHNOLOGY',
        name: 'Drone Technology',
        description: 'Create combat drones.',
        cost: 1200,
        requirements: ['ADVANCED_ARMOR'],
        unlocks: { recipes: ['combat_drone'] }
      },
      MISSILE_SYSTEMS: {
        id: 'MISSILE_SYSTEMS',
        name: 'Missile Systems',
        description: 'Develop advanced missile technology.',
        cost: 1600,
        requirements: ['DRONE_TECHNOLOGY'],
        unlocks: { recipes: ['missile_system'] }
      },
      MECH_SUITS: {
        id: 'MECH_SUITS',
        name: 'Mech Suits',
        description: 'Create advanced combat exoskeletons.',
        cost: 2000,
        requirements: ['MISSILE_SYSTEMS'],
        unlocks: { recipes: ['mech_suit'] }
      }
    }
  }
};
