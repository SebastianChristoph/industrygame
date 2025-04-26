import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tooltip,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { MODULES } from '../config/modules';
import { RESEARCH_TREE } from '../config/research';
import { unlockModule, researchTechnology } from '../store/gameSlice';
import { RESOURCES, PRODUCTION_RECIPES } from '../config/resources';

const Research = () => {
  const dispatch = useDispatch();
  const unlockedModules = useSelector(state => state.game.unlockedModules);
  const researchedTechnologies = useSelector(state => state.game.researchedTechnologies);
  const researchPoints = useSelector(state => state.game.researchPoints);
  const [tab, setTab] = useState(0);

  const moduleKeys = Object.keys(MODULES);
  const module = MODULES[moduleKeys[tab]];
  const moduleResearch = RESEARCH_TREE[module.id];
  const isUnlocked = unlockedModules.includes(module.id);

  const handleUnlockModule = (moduleId) => {
    if (researchPoints >= 500) {
      dispatch(researchTechnology({ technologyId: `UNLOCK_MODULE_${moduleId}`, cost: 500 }));
      dispatch(unlockModule(moduleId));
    } else {
      // Optional: Feedback für zu wenig Punkte
      alert('Not enough research points!');
    }
  };

  const handleResearchTechnology = (technologyId, cost) => {
    dispatch(researchTechnology({ technologyId, cost }));
  };

  const isTechnologyResearched = (technologyId) => {
    return researchedTechnologies.includes(technologyId);
  };

  const canResearchTechnology = (technology) => {
    if (isTechnologyResearched(technology.id)) return false;
    if (researchPoints < technology.cost) return false;
    return technology.requirements.every(req => isTechnologyResearched(req));
  };

  // Hilfsfunktion: Mapping von Technologie-IDs zu Namen
  const getAllTechnologyNames = () => {
    const map = {};
    Object.values(RESEARCH_TREE).forEach(module => {
      Object.values(module.technologies).forEach(tech => {
        map[tech.id] = tech.name;
      });
    });
    return map;
  };
  const TECHNOLOGY_NAME_MAP = getAllTechnologyNames();

  // Hilfsfunktion für Freischaltungen
  const renderUnlocks = (unlocks) => {
    const purchasableResources = (unlocks?.resources || []).filter(
      resourceId => RESOURCES[resourceId]?.purchasable
    );
    const producedGoods = (unlocks?.recipes || []).map(recipeId => PRODUCTION_RECIPES[recipeId]).filter(Boolean);
    return (
      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {purchasableResources.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Resource for purchase:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              {purchasableResources.map(resourceId => (
                <Tooltip key={resourceId} title={RESOURCES[resourceId]?.name || resourceId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.85rem' }}>
                    {RESOURCES[resourceId]?.icon || <ScienceIcon fontSize="small" />} {RESOURCES[resourceId]?.name || resourceId}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
        {producedGoods.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Good for production:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              {producedGoods.map(recipe => (
                <Tooltip key={recipe.id} title={recipe.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.85rem' }}>
                    {RESOURCES[recipe.output.resourceId]?.icon || <ScienceIcon fontSize="small" />} {RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Recipe: {recipe.inputs.map((input, idx) => `${input.amount}x ${RESOURCES[input.resourceId]?.name || input.resourceId}`).join(' + ')} = {recipe.output.amount}x {RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId})
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Basis-Freischaltungen des Moduls anzeigen
  const renderModuleBaseUnlocks = (module) => (
    <Box sx={{ mb: 2 }}>
      {module.resources && module.resources.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">Base Resources:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {module.resources.map(resourceId => (
              <Tooltip key={resourceId} title={RESOURCES[resourceId]?.name || resourceId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.95rem' }}>
                  {RESOURCES[resourceId]?.icon || <ScienceIcon fontSize="small" />} {RESOURCES[resourceId]?.name || resourceId}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
      {module.recipes && module.recipes.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Base Goods:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {module.recipes.map(recipeId => {
              const recipe = PRODUCTION_RECIPES[recipeId];
              if (!recipe) return null;
              const outputRes = RESOURCES[recipe.output.resourceId];
              return (
                <Tooltip key={recipeId} title={recipe.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.95rem', flexDirection: 'column', minWidth: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {outputRes?.icon || <ScienceIcon fontSize="small" />} {recipe.name}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0, mt: 0.5 }}>
                      (Recipe: {recipe.inputs.map((input, idx) => `${input.amount}x ${RESOURCES[input.resourceId]?.name || input.resourceId}`).join(' + ')} = {recipe.output.amount}x {outputRes?.name || recipe.output.resourceId})
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Research
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Research Points: {researchPoints}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Module Tabs">
          {moduleKeys.map((key, idx) => (
            <Tab key={key} label={MODULES[key].name} icon={MODULES[key].icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '2.5rem' }}>
              {module.icon}
            </Typography>
            <Box>
              <Typography variant="h6">
                {module.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            fullWidth
            disabled={isUnlocked}
            onClick={() => handleUnlockModule(module.id)}
            sx={{ mb: 2 }}
          >
            {isUnlocked ? 'Unlocked' : `Unlock (500 research points)`}
          </Button>
          {renderModuleBaseUnlocks(module)}
          {moduleResearch ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Technologies
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 16,
                mb: 2
              }}>
                {Object.values(moduleResearch.technologies).map((technology) => {
                  const isResearched = isTechnologyResearched(technology.id);
                  const hasEnoughPoints = researchPoints >= technology.cost;
                  const canResearch = isUnlocked && canResearchTechnology(technology) && hasEnoughPoints;
                  let buttonLabel = isResearched ? 'Researched' : `Research (${technology.cost} research points)`;
                  if (!isResearched && !hasEnoughPoints) buttonLabel = 'Not enough research points';
                  return (
                    <Card key={technology.id} variant="outlined" sx={{ p: 0, borderRadius: 2, boxShadow: 0, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ p: 1.5, pb: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <ScienceIcon sx={{ color: isResearched ? 'success.main' : 'primary.main', fontSize: 28 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                              {technology.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.95rem' }}>
                            {technology.description}
                          </Typography>
                          {technology.requirements.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                              Requirements: {technology.requirements.map(req => TECHNOLOGY_NAME_MAP[req] || req).join(', ')}
                            </Typography>
                          )}
                          {renderUnlocks(technology.unlocks)}
                        </Box>
                        <Box sx={{ p: 1.5, pt: 0, mt: 'auto' }}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            disabled={!canResearch}
                            onClick={() => handleResearchTechnology(technology.id, technology.cost)}
                            sx={{ fontSize: '1rem', py: 0.5, borderRadius: 2 }}
                          >
                            {buttonLabel}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Research; 