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
        amount: 300,
        description: 'Produce at least 300x Corn'
      },
      {
        type: 'PRODUCE_RESOURCE',
        resourceId: 'wheat',
        amount: 100,
        description: 'Produce at least 100x Wheat'
      },
      {
        type: 'PRODUCTION_RATE',
        resourceId: 'corn',
        rate: 1,
        description: 'Maintain a production rate of 1 Corn per Ping'
      }
    ],
    rewards: {
      credits: 5000
    },
    completionText: `"The first meals are distributed. Your storage begins to fill. Thanks to your network, water and coal now flow steadily into the camp. But radio chatter reveals something worse: enemy machines are approaching in large numbers — it's time to arm yourself."`,
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