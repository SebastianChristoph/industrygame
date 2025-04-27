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
      }
    }
  }
};
