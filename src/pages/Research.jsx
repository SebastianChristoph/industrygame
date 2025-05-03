import React, { useState, useRef, useLayoutEffect } from 'react';
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
import { getResourceImageWithFallback } from '../config/resourceImages';
import { useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Hilfskomponente für Icon mit Fallback-Handling
const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const ResourceIcon = ({ iconUrls, alt, resourceId, ...props }) => {
  // Sonderfall: Research-Icons (Name, ResourceId oder Output-ResourceId enthält 'research')
  if (
    (alt && /research$/i.test(alt.trim())) ||
    (resourceId && /research(_points)?/i.test(resourceId))
  ) {
    return <img src="/images/icons/Research.png" alt={alt} {...props} />;
  }
  const [idx, setIdx] = React.useState(0);
  const handleError = () => {
    if (idx < iconUrls.length - 1) setIdx(idx + 1);
    else setIdx(-1);
  };
  if (!iconUrls || iconUrls.length === 0) return <img src={PLACEHOLDER_ICON} alt={alt} {...props} />;
  if (idx === -1) return <img src={PLACEHOLDER_ICON} alt={alt} {...props} />;
  return (
    <img
      src={iconUrls[idx]}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

const Research = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const unlockedModules = useSelector(state => state.game.unlockedModules);
  const researchedTechnologies = useSelector(state => state.game.researchedTechnologies);
  const researchPoints = useSelector(state => state.game.researchPoints);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tabParam = params.get('tab'); // z.B. 'technology'

  const moduleKeys = Object.keys(MODULES);
  // Mapping von tabKey zu Index, unabhängig von Großschreibung der Keys in MODULES
  const tabKeyToIndex = {
    agriculture: moduleKeys.findIndex(key => MODULES[key].id === 'agriculture'),
    technology: moduleKeys.findIndex(key => MODULES[key].id === 'technology'),
    weapons: moduleKeys.findIndex(key => MODULES[key].id === 'weapons'),
    business: moduleKeys.findIndex(key => MODULES[key].id === 'business'),
  };

  const [tab, setTab] = useState(
    tabParam && tabKeyToIndex[tabParam] !== -1 ? tabKeyToIndex[tabParam] : 0
  );
  const cardRefs = useRef({});
  const [arrowPositions, setArrowPositions] = useState([]);

  const module = MODULES[moduleKeys[tab]];
  const moduleResearch = RESEARCH_TREE[module.id];
  const isUnlocked = unlockedModules.includes(module.id);
  const hasEnoughPoints = researchPoints >= 500;

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

  // Helper for displaying sell value only if resource is sellable
  const getSellValueSpan = (resourceId) => {
    const res = RESOURCES[resourceId];
    if (!res || res.purchasable || resourceId === 'research_points' || res.basePrice === 0) return null;
    // Only show for non-special, non-research, non-zero basePrice
    if (resourceId !== 'research_points' && res.basePrice > 0 && res.purchasable !== false) {
      return <span style={{ color: '#2e7d32', fontWeight: 600 }}>(+${res.basePrice})</span>;
    }
    // Show for all with basePrice > 0 and not research_points
    if (resourceId !== 'research_points' && res.basePrice > 0 && res.purchasable === false) {
      return <span style={{ color: '#2e7d32', fontWeight: 600 }}>(+${res.basePrice})</span>;
    }
    return null;
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
            <Typography variant="caption" color="text.secondary">Resource for purchase:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              {purchasableResources.map(resourceId => (
                <Tooltip key={resourceId} title={RESOURCES[resourceId]?.name || resourceId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.85rem' }}>
                    <ResourceIcon iconUrls={getResourceImageWithFallback(resourceId, 'icon')} alt={RESOURCES[resourceId]?.name || resourceId} style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} resourceId={resourceId} />
                    {RESOURCES[resourceId]?.name || resourceId} {getSellValueSpan(resourceId)}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
        {producedGoods.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ color: '#fff' }}>Good for production:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              {producedGoods.map(recipe => {
                const outputRes = RESOURCES[recipe.output.resourceId];
                return (
                  <Tooltip key={recipe.id} title={recipe.name}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.85rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ResourceIcon iconUrls={getResourceImageWithFallback(recipe.output.resourceId, 'icon')} alt={RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId} style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} resourceId={recipe.output.resourceId} />
                        {RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId} {getSellValueSpan(recipe.output.resourceId)}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, color: '#fff' }}>
                        (Recipe: {recipe.inputs.map((input, idx) => `${input.amount}x ${RESOURCES[input.resourceId]?.name || input.resourceId}`).join(' + ')} = {recipe.output.amount}x {RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId})
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
  };

  // Basis-Freischaltungen des Moduls anzeigen
  const renderModuleBaseUnlocks = (module) => (
    <Box sx={{ mb: 2 }}>
      {module.resources && module.resources.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#fff' }}>Base Resources:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {module.resources.map(resourceId => (
              <Tooltip key={resourceId} title={RESOURCES[resourceId]?.name || resourceId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.95rem' }}>
                  <ResourceIcon iconUrls={getResourceImageWithFallback(resourceId, 'icon')} alt={RESOURCES[resourceId]?.name || resourceId} style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} resourceId={resourceId} />
                  <span style={{ color: '#fff' }}>{RESOURCES[resourceId]?.name || resourceId} {getSellValueSpan(resourceId)}</span>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
      {module.recipes && module.recipes.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#fff' }}>Base Goods:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {module.recipes.map(recipeId => {
              const recipe = PRODUCTION_RECIPES[recipeId];
              if (!recipe) return null;
              const outputRes = RESOURCES[recipe.output.resourceId];
              return (
                <Tooltip key={recipeId} title={recipe.name}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.95rem', minWidth: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ResourceIcon iconUrls={getResourceImageWithFallback(recipe.output.resourceId, 'icon')} alt={RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId} style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} resourceId={recipe.output.resourceId} />
                      <span style={{ color: '#fff' }}>{RESOURCES[recipe.output.resourceId]?.name || recipe.output.resourceId} {getSellValueSpan(recipe.output.resourceId)}</span>
                    </Box>
                    <Typography variant="caption" sx={{ mt: 0.5, color: '#fff' }}>
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

  useLayoutEffect(() => {
    // Nach dem Rendern: Positionen der Cards abgreifen
    const positions = {};
    Object.entries(cardRefs.current).forEach(([techId, ref]) => {
      if (ref && ref.getBoundingClientRect) {
        const rect = ref.getBoundingClientRect();
        positions[techId] = rect;
      }
    });
    // Berechne Pfeile: von jeder Karte mit requirements zu ihren Requirements
    const arrows = [];
    if (moduleResearch) {
      Object.values(moduleResearch.technologies).forEach(tech => {
        if (tech.requirements && tech.requirements.length > 0 && positions[tech.id]) {
          tech.requirements.forEach(reqId => {
            if (positions[reqId]) {
              arrows.push({
                from: reqId,
                to: tech.id,
                fromRect: positions[reqId],
                toRect: positions[tech.id],
              });
            }
          });
        }
      });
    }
    setArrowPositions(arrows);
  }, [tab, moduleResearch]);

  return (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      backgroundImage: {
        xs: 'url(/images/background_dark_mobil.png)',
        md: 'url(/images/background.png)'
      },
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#fff',
    }}>
   <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 900,
                fontSize: "2.5rem",
                color: "#fff",
                textShadow: "0 2px 8px #000, 0 1px 1px #000",
                //   background: 'rgba(30,30,30,0.7)',
                px: 2,
                py: 1,
                borderRadius: 2,
                width: "fit-content",
              }}
            >
           Research
            </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, color: '#fff' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          aria-label="Module Tabs"
          variant="scrollable"
          scrollButtons="auto"
          centered={false}
          TabIndicatorProps={{ sx: { height: 3, bgcolor: '#fff' } }}
        >
          {moduleKeys.map((key, idx) => (
            <Tab
              key={key}
              label={
                <span style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
                  {MODULES[key].icon}
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{MODULES[key].name}</span>
                </span>
              }
              icon={null}
              iconPosition="start"
              sx={{
                minWidth: { xs: 120, sm: 160 },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: '#fff',
                '& .MuiTab-wrapper': {
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'center',
                  color: '#fff',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>
      <Card sx={{ background: 'rgba(30,30,30,0.95)', color: '#fff', boxShadow: 8 }}>
        <CardContent sx={{ color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, color: '#fff' }}>
            <Typography variant="h2" sx={{ fontSize: '2.5rem', color: '#fff' }}>
              {module.icon}
            </Typography>
            <Box sx={{ color: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#fff' }}>
                {module.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff' }}>
                {module.description}
              </Typography>
            </Box>
          </Box>
          {!isUnlocked && (
            <>
              <Button
                variant="contained"
                fullWidth
                disabled={!hasEnoughPoints}
                onClick={hasEnoughPoints ? () => handleUnlockModule(module.id) : undefined}
                sx={{ mb: 2, bgcolor: !hasEnoughPoints ? 'grey.400' : undefined, color: '#fff' }}
              >
                {hasEnoughPoints ? 'Unlock (500 research points)' : 'Not enough research points (500 needed)'}
              </Button>
              <Box sx={{ color: '#fff' }}>{renderModuleBaseUnlocks(module)}</Box>
            </>
          )}
          {moduleResearch ? (
            <>
              <Divider sx={{ my: 2, bgcolor: '#fff' }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Technologies
              </Typography>
              <Box sx={{ position: 'relative', color: '#fff' }}>
                {/* SVG-Overlay für Abhängigkeits-Pfeile nur auf Desktop/Tablet */}
                {!isMobile && (
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
                    {arrowPositions.map((arrow, idx) => {
                      // Berechne Start- und Endpunkte (mittig oben/unten der Cards)
                      const gridBox = document.querySelector('[data-research-grid]');
                      if (!gridBox) return null;
                      const gridRect = gridBox.getBoundingClientRect();
                      const from = arrow.fromRect;
                      const to = arrow.toRect;
                      // Start: rechts Mitte der from-Card
                      const startX = from.right - gridRect.left;
                      const startY = from.top + from.height / 2 - gridRect.top;
                      // Ende: links Mitte der to-Card
                      const endX = to.left - gridRect.left;
                      const endY = to.top + to.height / 2 - gridRect.top;
                      return (
                        <line
                          key={idx}
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#bbb"
                          strokeWidth={2}
                          markerEnd="url(#arrowhead)"
                          opacity={0.7}
                        />
                      );
                    })}
                    <defs>
                      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
                        <polygon points="0 0, 8 4, 0 8" fill="#bbb" />
                      </marker>
                    </defs>
                  </svg>
                )}
                <Box
                  data-research-grid
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(320px, 1fr))' },
                    gap: { xs: 2, sm: 6 },
                    mb: 2,
                    position: 'relative',
                    zIndex: 3,
                    justifyItems: 'center',
                    px: { xs: 1, sm: 0 },
                    color: '#fff',
                  }}
                >
                  {Object.values(moduleResearch.technologies).map((technology) => {
                    const isResearched = isTechnologyResearched(technology.id);
                    const hasEnoughPoints = researchPoints >= technology.cost;
                    const canResearch = isUnlocked && canResearchTechnology(technology) && hasEnoughPoints;
                    let buttonLabel = isResearched ? 'Researched' : `Research (${technology.cost} research points)`;
                    if (!isResearched && !hasEnoughPoints) buttonLabel = `Not enough research points (${technology.cost} needed)`;
                    return (
                      <Card
                        key={technology.id}
                        ref={el => (cardRefs.current[technology.id] = el)}
                        variant="outlined"
                        sx={{
                          p: 0,
                          borderRadius: 2,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          width: '100%',
                          maxWidth: 360,
                          mx: { xs: 'auto', sm: 0 },
                          boxSizing: 'border-box',
                          background: 'rgba(40,50,70,0.97)',
                          color: '#fff',
                          boxShadow: '0 0 16px 4px rgba(0,180,255,0.18), 0 4px 32px 0 rgba(0,0,0,0.45)',
                          border: '2px solid rgba(0,180,255,0.35)',
                          transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                          '&:hover': {
                            boxShadow: '0 0 32px 8px rgba(0,180,255,0.35), 0 8px 48px 0 rgba(0,0,0,0.60)',
                            border: '2.5px solid #00b4ff',
                            background: 'rgba(50,70,100,0.99)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
                          <Box sx={{ p: 1.5, pb: 0, display: 'flex', flexDirection: 'column', height: '100%', color: '#fff' }}>
                            <Box sx={{ minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', color: '#fff' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#fff' }}>
                                <ScienceIcon sx={{ color: isResearched ? 'success.main' : 'primary.main', fontSize: 28 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                  {technology.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.95rem', color: '#fff' }}>
                                {technology.description}
                              </Typography>
                              {technology.requirements.length > 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', color: '#fff' }}>
                                  Requirements: {technology.requirements.map(req => TECHNOLOGY_NAME_MAP[req] || req).join(', ')}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ minHeight: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', mt: 1, color: '#fff' }}>
                              {renderUnlocks(technology.unlocks)}
                            </Box>
                          </Box>
                          <Box sx={{ p: 1.5, pt: 0, mt: 2 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              size="small"
                              disabled={!canResearch}
                              onClick={() => handleResearchTechnology(technology.id, technology.cost)}
                              sx={{
                                fontSize: '1rem',
                                py: 0.5,
                                borderRadius: 2,
                                minHeight: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                ...(canResearch ? {} : {
                                  backgroundColor: '#333 !important',
                                  color: '#bbb !important',
                                  border: '1px solid #444',
                                  opacity: 1,
                                  boxShadow: 'none',
                                })
                              }}
                            >
                              {buttonLabel}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Research; 