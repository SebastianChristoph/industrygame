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
          recipes: []
        }
      },
      BEWAESSERUNG: {
        id: 'BEWAESSERUNG',
        name: 'Bewässerungssystem',
        description: 'Automatische Bewässerung für optimale Wachstumsbedingungen',
        cost: 150,
        requirements: ['DUENGER_1'],
        unlocks: {
          recipes: []
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
      AUTOMATISIERUNG: {
        id: 'AUTOMATISIERUNG',
        name: 'Automatisierung',
        description: 'Automatische Produktionsprozesse',
        cost: 300,
        requirements: ['MASCHINEN_2'],
        unlocks: {
          recipes: []
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
          recipes: []
        }
      },
      WAFFEN_2: {
        id: 'WAFFEN_2',
        name: 'Fortgeschrittene Waffenproduktion',
        description: 'Komplexere Waffen und Ausrüstung',
        cost: 350,
        requirements: ['WAFFEN_1'],
        unlocks: {
          recipes: []
        }
      },
      PANZERUNG: {
        id: 'PANZERUNG',
        name: 'Panzerungsfertigung',
        description: 'Herstellung von militärischer Schutzausrüstung',
        cost: 220,
        requirements: ['WAFFEN_1'],
        unlocks: {
          recipes: []
        }
      }
    }
  }
}; 