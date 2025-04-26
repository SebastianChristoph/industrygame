export const RESEARCH_TREE = {
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    technologies: {
      DUENGER_1: {
        id: 'DUENGER_1',
        name: 'Fertilizer I',
        description: 'Basic fertilizers for improved crop yields',
        cost: 100,
        requirements: [],
        unlocks: {
          resources: ['biomass'],
          recipes: ['fertilizer']
        }
      },
      DUENGER_2: {
        id: 'DUENGER_2',
        name: 'Fertilizer II',
        description: 'Advanced fertilizers for maximum crop yields',
        cost: 250,
        requirements: ['DUENGER_1'],
        unlocks: {
          resources: ['compost'],
          recipes: ['compost']
        }
      },
      BIOFARMING: {
        id: 'BIOFARMING',
        name: 'Organic Farming',
        description: 'Enables production of organic vegetables',
        cost: 350,
        requirements: ['DUENGER_2'],
        unlocks: {
          resources: ['organic_vegetables'],
          recipes: ['organic_vegetables']
        }
      }
    }
  },
  technology: {
    id: 'technology',
    name: 'Technology',
    technologies: {
      MASCHINEN_1: {
        id: 'MASCHINEN_1',
        name: 'Basic Machinery',
        description: 'Simple production machines',
        cost: 200,
        requirements: [],
        unlocks: {
          recipes: ['electrochip']
        }
      },
      MASCHINEN_2: {
        id: 'MASCHINEN_2',
        name: 'Advanced Machinery',
        description: 'More efficient production machines',
        cost: 400,
        requirements: ['MASCHINEN_1'],
        unlocks: {
          recipes: ['circuit']
        }
      },
      SOLARTECH: {
        id: 'SOLARTECH',
        name: 'Solar Modules',
        description: 'Enables production of solar panels',
        cost: 350,
        requirements: ['MASCHINEN_2'],
        unlocks: {
          resources: ['solar_panel'],
          recipes: ['solar_panel']
        }
      },
      BATTERIETECH: {
        id: 'BATTERIETECH',
        name: 'Battery Technology',
        description: 'Enables production of high-performance batteries',
        cost: 500,
        requirements: ['SOLARTECH'],
        unlocks: {
          resources: ['battery'],
          recipes: ['battery']
        }
      }
    }
  },
  weapons: {
    id: 'weapons',
    name: 'Weapon Production',
    technologies: {
      WAFFEN_1: {
        id: 'WAFFEN_1',
        name: 'Basic Weapon Production',
        description: 'Manufacture simple weapons and equipment',
        cost: 180,
        requirements: [],
        unlocks: {
          resources: ['steel'],
          recipes: ['steel']
        }
      },
      EXPLOSIVSTOFFE: {
        id: 'EXPLOSIVSTOFFE',
        name: 'Explosives Manufacturing',
        description: 'Enables production of explosives',
        cost: 300,
        requirements: ['WAFFEN_1'],
        unlocks: {
          resources: ['explosives'],
          recipes: ['explosives']
        }
      },
      RAKETENTECH: {
        id: 'RAKETENTECH',
        name: 'Rocket Technology',
        description: 'Enables production of rockets',
        cost: 600,
        requirements: ['EXPLOSIVSTOFFE'],
        unlocks: {
          resources: ['rocket'],
          recipes: ['rocket']
        }
      }
    }
  }
}; 