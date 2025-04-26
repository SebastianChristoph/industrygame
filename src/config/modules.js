export const MODULES = {
  AGRICULTURE: {
    id: 'agriculture',
    name: 'Agrarwirtschaft',
    description: 'Produktion von landwirtschaftlichen Gütern und Nahrungsmitteln',
    icon: '🌾',
    recipes: ['watergas', 'woodplanks'],
    resources: ['water', 'wood']
  },
  TECHNOLOGY: {
    id: 'technology',
    name: 'Technik',
    description: 'Produktion von elektronischen Bauteilen und Technologie',
    icon: '💻',
    recipes: ['electrochip', 'circuit'],
    resources: ['iron', 'copper']
  },
  WEAPONS: {
    id: 'weapons',
    name: 'Waffenproduktion',
    description: 'Produktion von Waffen und militärischer Ausrüstung',
    icon: '⚔️',
    recipes: ['plastic'],
    resources: ['oil', 'stone']
  }
};

export const INITIAL_UNLOCKED_MODULES = []; 