// Mission types for conditions
export const MISSION_TYPES = {
  PRODUCE_RESOURCE: 'PRODUCE_RESOURCE', // Produce X amount of a resource
  PRODUCTION_RATE: 'PRODUCTION_RATE',   // Maintain X production rate per ping
  RESEARCH_TECH: 'RESEARCH_TECH',       // Research specific technology
  UNLOCK_MODULE: 'UNLOCK_MODULE',       // Unlock specific module
  TOTAL_BALANCE: 'TOTAL_BALANCE',       // Reach total balance
  CREDITS: 'CREDITS'                    // Reach credit amount
};

// Mission structure
export const MISSIONS = {
  // Chapter 1: Basic Survival
  mission1: {
    id: 'mission1',
    chapter: 1,
    title: 'Mission 1: Secure Basic Supplies',
    image: '/images/missions/mission1.png',
    description: `"The first machines have overrun the cities. Chaos reigns. Refugees reach your camp — hungry, wounded, traumatized. You're out of everything. Your mission is clear: establish a stable supply chain. Fortunately, you've reactivated some contacts in the black market — essential goods like water and seeds are now arriving… for a price."`,
    conditions: [
      {
        type: 'UNLOCK_MODULE',
        moduleId: 'agriculture',
        description: 'Activate Agriculture Module'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'corn',
        amount: 100,
        description: 'Store at least 100 Corn'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'wheat',
        amount: 50,
        description: 'Store at least 50 Wheat'
      },
      {
        type: 'PRODUCTION_RATE',
        resourceId: 'corn',
        rate: 1,
        description: 'Maintain a production rate of at least 1 Corn per Ping'
      }
    ],
    rewards: {
      credits: 5000
    },
    completionText: `"The first meals are distributed. Your storage begins to fill. Thanks to your network, water and coal now flow steadily into the camp. But radio chatter reveals something worse: enemy machines are approaching in large numbers — it's time to arm yourself."`,
    isActive: true,
    isCompleted: false
  },

  // Chapter 1: Basic Survival
  mission2: {
    id: 'mission2',
    chapter: 1,
    title: 'Mission 2: First Line of Defense',
    image: '/images/missions/mission2.png',
    description: `Food alone won't save you. Patrols report sightings of armed machines sweeping through nearby ruins. It's only a matter of time before they find you. You must build your first weapons and unlock the means to fight back. But even resistance fighters need supplies — make sure your people are fed as well as armed. This is no longer just survival — it's resistance.`,
    conditions: [
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'gunpowder',
        amount: 50,
        description: 'Store at least 50 Gunpowder'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'bullet',
        amount: 200,
        description: 'Store at least 200 Bullets'
      },
      {
        type: 'PRODUCTION_RATE',
        resourceId: 'corn',
        rate: 1,
        description: 'Maintain a production rate of at least 1 Corn per Ping'
      },
      {
        type: 'RESEARCH_TECH',
        researchId: 'EXPLOSIVES',
        description: 'Research Explosives Engineering'
      },
      {
        type: 'UNLOCK_MODULE',
        moduleId: 'weapons',
        description: 'Unlock the Weapons Module'
      },
      {
        type: 'RESEARCH_TECH',
        researchId: 'AMMUNITION',
        description: 'Research Ammunition Manufacturing'
      },
    ],
    rewards: {
      credits: 10000,
      resources: {
        rifle: 100
      },
      unlockModule: 'technology'
    },
    completionText: `The smell of gunpowder fills the air. You've crafted your first line of defense — crude, but effective. Your scouts have spotted machine patrols hesitating at the edge of your territory. They know you're armed. Some of their weapons were left behind — now in your hands. In the heat of battle, you've learned more than just how to fight — you've taken your first steps toward understanding their technology. Now, you must prepare for escalation.`,
    isActive: false,
    isCompleted: false
  },

  mission3: {
    id: 'mission3',
    chapter: 1,
    title: 'Mission 3: Powering the Future',
    image: '/images/missions/mission3.png',
    description: `The machines grow bolder, and every bullet, every defense line relies on energy. But your diesel stockpiles are running dry, and fuel convoys are too risky to maintain. If your camp is to survive the long war, it must become energy-independent. Biofuel will carry you part of the way — but the real leap forward lies in harnessing the sun itself. It's time to reclaim the future with clean, stable power. Energy is no longer just a resource — it's your lifeline.`,
    conditions: [
      {
        type: 'RESEARCH_TECH',
        researchId: 'RENEWABLE_ENERGY',
        description: 'Research Renewable Energy'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'solar_panel',
        amount: 5,
        description: 'Produce at least 5 Solar Panels'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'biofuel',
        amount: 50,
        description: 'Store at least 50 Biofuel'
      }
    ],
    rewards: {
      credits: 8000,
      researchPoints: 300,
      passiveBonus: {
        type: 'production_speed',
        value: 0.10
      },
      unlockModule: 'energy' // Optional: define new module if desired
    },
    completionText: `Solar panels shimmer across the camp's rooftops, silently gathering power from the ruins of the old world. Biofuel tanks roar to life, feeding the machines that feed your people. You've cut the cord to fragile supply lines and taken a bold step toward autonomy. Your resistance now runs on light — and light is hard to kill.`,
    isActive: false,
    isCompleted: false
  },

  mission4: {
    id: 'mission4',
    chapter: 1,
    title: 'Mission 4: A Question of Loyalty',
    image: '/images/missions/mission4.png',
    description: `Something's wrong in the camp. Equipment goes missing, production halts mysteriously, and patrols report signs of sabotage. Not all survivors trust your leadership — or your strategy. Some whisper of peace with the machines, others of breaking away entirely. While you investigate, you'll need to boost defenses and ensure no one starves. Keep your people focused — and prove you're still in control.`,
    conditions: [
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'bread',
        amount: 100,
        description: 'Store at least 100 Bread'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'advanced_armor',
        amount: 20,
        description: 'Produce 20 Advanced Armor'
      },
      {
        type: 'PRODUCTION_RATE',
        resourceId: 'wheat',
        rate: 1,
        description: 'Maintain a production rate of at least 1 Wheat per Ping'
      }
    ],
    rewards: {
      credits: 12000,
      resources: {
        combat_drone: 10
      }
    },
    completionText: `The disruptions have stopped — for now. With food flowing and your forces better protected, the dissenters have either fled or gone silent. But something has shifted. You’ve held the camp together this time. Still, trust, once cracked, never quite fits the same.`,
    isActive: false,
    isCompleted: false
  },
  
  
};

// Helper function to check mission conditions
export const checkMissionConditions = (mission, gameState) => {
  if (!mission.conditions) return false;

  return mission.conditions.every(condition => {
    switch (condition.type) {
      case MISSION_TYPES.PRODUCE_RESOURCE:
        const resource = gameState.resources[condition.resourceId];
        return resource && resource.amount >= condition.amount;

      case MISSION_TYPES.PRODUCTION_RATE:
        // Check if any production line produces the resource at the required rate
        return Object.entries(gameState.productionConfigs).some(([lineId, config]) => {
          if (!config.recipe) return false;
          const recipe = PRODUCTION_RECIPES[config.recipe];
          return recipe.output.resourceId === condition.resourceId &&
                 recipe.output.amount >= condition.amount;
        });

      case MISSION_TYPES.RESEARCH_TECH:
        return gameState.researchedTechnologies.includes(condition.technologyId);

      case MISSION_TYPES.UNLOCK_MODULE:
        return gameState.unlockedModules.includes(condition.moduleId);

      case MISSION_TYPES.TOTAL_BALANCE:
        return gameState.credits >= condition.amount;

      case MISSION_TYPES.CREDITS:
        return gameState.credits >= condition.amount;

      default:
        return false;
    }
  });
};

// Helper function to get next available mission
export const getNextAvailableMission = (gameState) => {
  const missions = Object.values(MISSIONS);
  
  // Sort missions by chapter and order
  missions.sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.order - b.order;
  });

  // Find first incomplete mission
  return missions.find(mission => !mission.isCompleted);
};

// Helper function to get mission progress
export const getMissionProgress = (mission, gameState) => {
  if (!mission.conditions) return 0;

  const progress = mission.conditions.map(condition => {
    switch (condition.type) {
      case MISSION_TYPES.PRODUCE_RESOURCE:
        const resource = gameState.resources[condition.resourceId];
        return resource ? Math.min(100, (resource.amount / condition.amount) * 100) : 0;

      case MISSION_TYPES.PRODUCTION_RATE:
        const hasRate = Object.entries(gameState.productionConfigs).some(([lineId, config]) => {
          if (!config.recipe) return false;
          const recipe = PRODUCTION_RECIPES[config.recipe];
          return recipe.output.resourceId === condition.resourceId &&
                 recipe.output.amount >= condition.amount;
        });
        return hasRate ? 100 : 0;

      case MISSION_TYPES.RESEARCH_TECH:
        return gameState.researchedTechnologies.includes(condition.technologyId) ? 100 : 0;

      case MISSION_TYPES.UNLOCK_MODULE:
        return gameState.unlockedModules.includes(condition.moduleId) ? 100 : 0;

      case MISSION_TYPES.TOTAL_BALANCE:
        return Math.min(100, (gameState.credits / condition.amount) * 100);

      case MISSION_TYPES.CREDITS:
        return Math.min(100, (gameState.credits / condition.amount) * 100);

      default:
        return 0;
    }
  });

  // Return average progress
  return progress.reduce((a, b) => a + b, 0) / progress.length;
}; 