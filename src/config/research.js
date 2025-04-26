export const RESEARCH_TREE = {
  agriculture: {
    id: 'agriculture',
    name: 'Agrarwirtschaft',
    technologies: {
      DUENGER_1: {
        id: 'DUENGER_1',
        name: 'Dünger I',
        description: 'Grundlegende Düngemittel für verbesserte Ernteerträge',
        cost: 100,
        requirements: [],
        unlocks: {
          resources: ['biomass'],
          recipes: ['fertilizer']
        }
      },
      DUENGER_2: {
        id: 'DUENGER_2',
        name: 'Dünger II',
        description: 'Fortgeschrittene Düngemittel für maximale Ernteerträge',
        cost: 250,
        requirements: ['DUENGER_1'],
        unlocks: {
          resources: ['compost'],
          recipes: ['compost']
        }
      },
      BIOFARMING: {
        id: 'BIOFARMING',
        name: 'Biologische Landwirtschaft',
        description: 'Ermöglicht die Produktion von Bio-Gemüse',
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
    name: 'Technik',
    technologies: {
      MASCHINEN_1: {
        id: 'MASCHINEN_1',
        name: 'Grundlegende Maschinen',
        description: 'Einfache Produktionsmaschinen',
        cost: 200,
        requirements: [],
        unlocks: {
          recipes: ['electrochip']
        }
      },
      MASCHINEN_2: {
        id: 'MASCHINEN_2',
        name: 'Fortgeschrittene Maschinen',
        description: 'Effizientere Produktionsmaschinen',
        cost: 400,
        requirements: ['MASCHINEN_1'],
        unlocks: {
          recipes: ['circuit']
        }
      },
      SOLARTECH: {
        id: 'SOLARTECH',
        name: 'Solarmodule',
        description: 'Ermöglicht die Produktion von Solarmodulen',
        cost: 350,
        requirements: ['MASCHINEN_2'],
        unlocks: {
          resources: ['solar_panel'],
          recipes: ['solar_panel']
        }
      },
      BATTERIETECH: {
        id: 'BATTERIETECH',
        name: 'Batterietechnologie',
        description: 'Ermöglicht die Produktion von Hochleistungsbatterien',
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
    name: 'Waffenproduktion',
    technologies: {
      WAFFEN_1: {
        id: 'WAFFEN_1',
        name: 'Grundlegende Waffenproduktion',
        description: 'Einfache Waffen und Ausrüstung herstellen',
        cost: 180,
        requirements: [],
        unlocks: {
          resources: ['steel'],
          recipes: ['steel']
        }
      },
      EXPLOSIVSTOFFE: {
        id: 'EXPLOSIVSTOFFE',
        name: 'Sprengstoffherstellung',
        description: 'Ermöglicht die Produktion von Sprengstoff',
        cost: 300,
        requirements: ['WAFFEN_1'],
        unlocks: {
          resources: ['explosives'],
          recipes: ['explosives']
        }
      },
      RAKETENTECH: {
        id: 'RAKETENTECH',
        name: 'Raketentechnologie',
        description: 'Ermöglicht die Produktion von Raketen',
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