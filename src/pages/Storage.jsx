import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  useTheme
} from '@mui/material';
import { RESOURCES, calculateUpgradeCost, STORAGE_CONFIG, PRODUCTION_RECIPES } from '../config/resources';
import { upgradeStorage } from '../store/gameSlice';
import { Warehouse } from '@mui/icons-material';
import { getResourceImageWithFallback } from '../config/resourceImages';

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

const Storage = () => {
  const dispatch = useDispatch();
  const { credits, resources, unlockedResources, unlockedRecipes } = useSelector(state => state.game);
  const theme = useTheme();

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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" color="text.primary">
          Resource Storage
        </Typography>
       
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Resource</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Utilization</TableCell>
              <TableCell align="right">Level</TableCell>
              <TableCell align="right">Action</TableCell>
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
                      '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover },
                      '& > *': { 
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        padding: '8px'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <ResourceIcon
                          iconUrls={getResourceImageWithFallback(id, 'icon')}
                          alt={resource.name}
                          resourceId={id}
                          style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 8 }}
                        />
                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{resourceData.amount} / {resourceData.capacity}</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage}
                            sx={{
                              height: 6,
                              borderRadius: theme.shape.borderRadius,
                              bgcolor: theme.palette.background.default,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: percentage > 90 ? theme.palette.error.main : 
                                        percentage > 75 ? theme.palette.warning.main : 
                                        theme.palette.primary.main
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
                          {Math.round(percentage)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{resourceData.storageLevel}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Warehouse sx={{ fontSize: '1rem' }} />}
                          onClick={() => handleUpgradeStorage(id)}
                          disabled={credits < nextUpgradeCost}
                          sx={{ 
                            whiteSpace: 'nowrap',
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            '& .MuiButton-startIcon': {
                              marginRight: 0.5
                            },
                            '&:hover': {
                              borderColor: theme.palette.primary.dark,
                              bgcolor: theme.palette.action.hover
                            }
                          }}
                        >
                          {nextUpgradeCost} Credits
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
                          +{STORAGE_CONFIG.UPGRADE_CAPACITY} Capacity
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
  );
};

export default Storage; 