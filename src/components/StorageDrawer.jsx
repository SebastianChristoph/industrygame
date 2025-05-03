import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Drawer,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import { Close, Warehouse } from '@mui/icons-material';
import { RESOURCES, calculateUpgradeCost, PRODUCTION_RECIPES } from '../config/resources';
import { getResourceImageWithFallback } from '../config/resourceImages';
import { upgradeStorage } from '../store/gameSlice';

const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const ResourceIcon = ({ iconUrls, alt, resourceId, ...props }) => {
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

// Hilfsfunktion zur Berechnung der Storage-Größe (wie in StorageOverview)
const calculateStorageSize = (data) => {
  const jsonString = JSON.stringify(data);
  const bytes = new Blob([jsonString]).size;
  const kilobytes = (bytes / 1024).toFixed(2);
  return `${kilobytes} KB`;
};

const StorageDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const gameState = useSelector(state => state.game);
  const { credits, resources, unlockedResources, unlockedRecipes } = gameState;

  // Alle Output-Resource-IDs aus den freigeschalteten Rezepten
  const unlockedOutputResources = new Set();
  if (unlockedRecipes && Array.isArray(unlockedRecipes)) {
    for (const recipeId of unlockedRecipes) {
      const recipe = PRODUCTION_RECIPES[recipeId];
      if (recipe && recipe.output && recipe.output.resourceId) {
        unlockedOutputResources.add(recipe.output.resourceId);
      }
    }
  }
  const shouldShowResource = (id) =>
    id !== 'research_points' && (
      unlockedResources.includes(id) ||
      ['water', 'seeds', 'iron', 'copper', 'coal', 'oil'].includes(id) ||
      (resources[id] && resources[id].amount > 0) ||
      unlockedOutputResources.has(id)
    );

  const handleUpgradeStorage = (resourceId) => {
    dispatch(upgradeStorage(resourceId));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 900 },
          background: 'rgba(30,30,30,0.97)',
          color: '#fff',
          boxShadow: 12
        }
      }}
    >
      <Box sx={{ p: 2 }}>
      
        
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ 
            maxWidth: '100%',
            overflowX: 'hidden',
            mt: 6,
            background: 'rgba(30,30,30,0.85)',
            color: '#fff',
            boxShadow: 6,
            '&:hover': { boxShadow: 10 }
          }}
        >
          <Table 
            size="small"
            sx={{
              minWidth: '100%',
              tableLayout: 'fixed',
              color: '#fff'
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell width="28%" sx={{ color: '#fff' }}>Resource</TableCell>
                <TableCell width="20%" align="right" sx={{ color: '#fff' }}>Stock</TableCell>
                <TableCell width="22%" sx={{ color: '#fff' }}>Utilization</TableCell>
                <TableCell width="10%" align="right" sx={{ color: '#fff' }}>Level</TableCell>
                <TableCell width="24%" align="right" sx={{ color: '#fff' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(RESOURCES)
                .filter(([id]) => shouldShowResource(id))
                .map(([id, resource]) => {
                  const resourceData = resources[id];
                  const percentage = (resourceData.amount / resourceData.capacity) * 100;
                  const nextUpgradeCost = calculateUpgradeCost(resourceData.storageLevel);

                  return (
                    <TableRow 
                      key={id}
                      sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'rgba(40,40,40,0.95)' },
                        '&:nth-of-type(even)': { bgcolor: 'rgba(30,30,30,0.85)' },
                        '& > *': { borderBottom: 'none', color: '#fff' }
                      }}
                    >
                      <TableCell sx={{ color: '#fff' }}>
                        <Tooltip title={resource.description}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            <Tooltip title={resource.name} placement="top">
                              <ResourceIcon
                                iconUrls={getResourceImageWithFallback(id, 'icon')}
                                alt={resource.name}
                                resourceId={id}
                                style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 8 }}
                              />
                            </Tooltip>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {resource.name}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff' }}>
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                          {resourceData.amount} / {resourceData.capacity}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '30%', color: '#fff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: 'grey.900',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: percentage > 90 ? 'error.main' : 
                                          percentage > 75 ? 'warning.main' : 
                                          'primary.main'
                                }
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" sx={{ color: '#fff' }}>
                              {Math.round(percentage)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff' }}>
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                          {resourceData.storageLevel}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', color: '#fff' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Warehouse />}
                            onClick={() => handleUpgradeStorage(id)}
                            disabled={credits < nextUpgradeCost}
                            sx={{ 
                              whiteSpace: 'nowrap',
                              color: 'primary.main',
                              borderColor: 'primary.main',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              minWidth: 0,
                              maxWidth: '100%',
                              '& .MuiButton-startIcon': {
                                marginRight: 0.5
                              },
                              '&:hover': {
                                borderColor: 'primary.dark',
                                bgcolor: 'action.hover'
                              }
                            }}
                          >
                            {nextUpgradeCost} Credits
                          </Button>
                          <Typography variant="caption" sx={{ color: '#fff', mt: 0.2 }}>
                            +{200} Capacity
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" color="text.secondary" sx={{ color: '#fff' }}>
          Total size: {calculateStorageSize(gameState)}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default StorageDrawer; 