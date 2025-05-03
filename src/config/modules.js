export const MODULES = {
  AGRICULTURE: {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Access to farming basics',
    icon: '🌾',
    recipes: ['research_points_agriculture', 'corn'], // <-- Jetzt auch Corn
    resources: ['water', 'seeds']             // <-- Seeds und Water freischalten
  },
  TECHNOLOGY: {
    id: 'technology',
    name: 'Technology',
    description: 'Access to electronics basics',
    icon: '💻',
    recipes: ['research_points_technology', 'basic_chip'], // <-- Jetzt auch Basic Chip
    resources: ['iron', 'copper']
  },
  WEAPONS: {
    id: 'weapons',
    name: 'Weapons Factory',
    description: 'Access to basic military resources',
    icon: '⚔️',
    recipes: ['research_points_weapon', 'metal_plate'], // <-- Jetzt auch Metal Plate
    resources: ['coal', 'oil']
  }
};

export const INITIAL_UNLOCKED_MODULES = [];
