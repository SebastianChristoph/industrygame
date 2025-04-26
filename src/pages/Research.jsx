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
      alert('Nicht genug Forschungspunkte!');
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
            <Typography variant="caption" color="text.secondary">Resource zum Einkauf:</Typography>
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
            <Typography variant="caption" color="text.secondary">Ware zur Produktion:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              {producedGoods.map(recipe => (
                <Tooltip key={recipe.id} title={recipe.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.85rem' }}>
                    {RESOURCES[recipe.output.resourceId]?.icon || <ScienceIcon fontSize="small" />} {RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Rezept: {recipe.inputs.map((input, idx) => `${input.amount}x ${RESOURCES[input.resourceId]?.name || input.resourceId}`).join(' + ')} = {recipe.output.amount}x {RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId})
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
          <Typography variant="subtitle2" color="text.secondary">Basis-Ressourcen:</Typography>
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
          <Typography variant="subtitle2" color="text.secondary">Basis-Waren:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {module.recipes.map(recipeId => (
              <Tooltip key={recipeId} title={PRODUCTION_RECIPES[recipeId]?.name || recipeId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.95rem' }}>
                  {PRODUCTION_RECIPES[recipeId]?.output ? RESOURCES[PRODUCTION_RECIPES[recipeId].output.resourceId]?.icon : <ScienceIcon fontSize="small" />} {PRODUCTION_RECIPES[recipeId]?.name || recipeId}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Forschung
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Forschungspunkte: {researchPoints}
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
            {isUnlocked ? 'Freigeschaltet' : 'Freischalten'}
          </Button>
          {renderModuleBaseUnlocks(module)}
          {moduleResearch ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Technologien
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.values(moduleResearch.technologies).map((technology) => {
                  const isResearched = isTechnologyResearched(technology.id);
                  const hasEnoughPoints = researchPoints >= technology.cost;
                  const canResearch = isUnlocked && canResearchTechnology(technology) && hasEnoughPoints;
                  let buttonLabel = isResearched ? 'Erforscht' : 'Erforschen';
                  if (!isResearched && !hasEnoughPoints) buttonLabel = 'Nicht genug Forschungspunkte';
                  return (
                    <Card key={technology.id} variant="outlined" sx={{ mb: 1, p: 0, borderRadius: 2, boxShadow: 0, minHeight: 0 }}>
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <ScienceIcon sx={{ color: isResearched ? 'success.main' : 'primary.main', fontSize: 28 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            {technology.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.95rem' }}>
                          {technology.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                          Kosten: {technology.cost} Forschungspunkte
                        </Typography>
                        {technology.requirements.length > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                            Voraussetzungen: {technology.requirements.join(', ')}
                          </Typography>
                        )}
                        {renderUnlocks(technology.unlocks)}
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          disabled={!canResearch}
                          onClick={() => handleResearchTechnology(technology.id, technology.cost)}
                          sx={{ mt: 1, fontSize: '1rem', py: 0.5, borderRadius: 2 }}
                        >
                          {buttonLabel}
                        </Button>
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