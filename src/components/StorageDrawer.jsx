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

const StorageDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { credits, resources, unlockedResources, unlockedRecipes } = useSelector(state => state.game);

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
        sx: { width: { xs: '100%', sm: 900 } }
      }}
    >
      <Box sx={{ p: 2 }}>
      
        
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ 
            maxWidth: '100%',
            overflowX: 'hidden',
          mt: 6
          }}
        >
          <Table 
            size="small"
            sx={{
              minWidth: '100%',
              tableLayout: 'fixed'
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell width="28%">Resource</TableCell>
                <TableCell width="20%" align="right">Stock</TableCell>
                <TableCell width="22%">Utilization</TableCell>
                <TableCell width="10%" align="right">Level</TableCell>
                <TableCell width="24%" align="right">Action</TableCell>
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
                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                        '& > *': { borderBottom: 'unset' }
                      }}
                    >
                      <TableCell>
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
                            <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {resource.name}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {resourceData.amount} / {resourceData.capacity}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '30%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: percentage > 90 ? 'error.main' : 
                                          percentage > 75 ? 'warning.main' : 
                                          'primary.main'
                                }
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(percentage)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {resourceData.storageLevel}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Warehouse />}
                            onClick={() => handleUpgradeStorage(id)}
                            disabled={credits < nextUpgradeCost}
                            sx={{ 
                              whiteSpace: 'nowrap',
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              minWidth: 0,
                              maxWidth: '100%'
                            }}
                          >
                            {nextUpgradeCost} Credits
                          </Button>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
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
      </Box>
    </Drawer>
  );
};

export default StorageDrawer; 