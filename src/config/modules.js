export const MODULES = {
  AGRICULTURE: {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Production of agricultural goods and food',
    icon: '🌾',
    recipes: ['watergas', 'woodplanks', 'research_points_agriculture'],
    resources: ['water', 'wood']
  },
  TECHNOLOGY: {
    id: 'technology',
    name: 'Technology',
    description: 'Production of electronic components and technology',
    icon: '💻',
    recipes: ['electrochip', 'circuit', 'research_points_technology'],
    resources: ['iron', 'copper']
  },
  WEAPONS: {
    id: 'weapons',
    name: 'Weapon Production',
    description: 'Production of weapons and military equipment',
    icon: '⚔️',
    recipes: ['plastic', 'research_points_weapon'],
    resources: ['oil', 'stone']
  }
};

export const INITIAL_UNLOCKED_MODULES = []; 