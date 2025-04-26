export const MODULES = {
  AGRICULTURE: {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Access to farming basics',
    icon: '🌾',
    recipes: ['research_points_agriculture'], // <-- Nur Forschung am Anfang möglich
    resources: ['water', 'seeds']             // <-- Seeds und Water freischalten
  },
  TECHNOLOGY: {
    id: 'technology',
    name: 'Technology',
    description: 'Access to electronics basics',
    icon: '💻',
    recipes: ['research_points_technology'],
    resources: ['iron', 'copper']
  },
  WEAPONS: {
    id: 'weapons',
    name: 'Weapons Factory',
    description: 'Access to basic military resources',
    icon: '⚔️',
    recipes: ['research_points_weapon'],
    resources: ['coal', 'oil']
  }
};

export const INITIAL_UNLOCKED_MODULES = [];
