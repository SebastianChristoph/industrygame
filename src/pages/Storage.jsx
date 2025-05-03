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
  useTheme,
  useMediaQuery
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{
      minHeight: '100vh',
      backgroundImage: isMobile ? 'url(/images/background_dark_mobil.png)' : 'url(/images/background_light.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      p: { xs: 1, sm: 3 },
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 900,
            fontSize: '2.5rem',
            color: '#fff',
            textShadow: '0 2px 8px #000, 0 1px 1px #000',
            px: 2,
            py: 1,
            borderRadius: 2,
            width: 'fit-content',
          }}
        >
          Resource Storage
        </Typography>
      </Box>

      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(RESOURCES)
            .filter(([id]) => shouldShowResource(id))
            .map(([id, resource]) => {
              const resourceData = resources[id];
              const percentage = (resourceData.amount / resourceData.capacity) * 100;
              const nextUpgradeCost = calculateUpgradeCost(resourceData.storageLevel);
              return (
                <Paper
                  key={id}
                  sx={{
                    p: 2,
                    background: '#23272a',
                    color: '#fff',
                    boxShadow: 6,
                    '&:hover': {
                      boxShadow: 10
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, bgcolor: 'rgba(30,30,30,0.97)', borderRadius: 2, boxShadow: 1 }}>
                    <ResourceIcon
                      iconUrls={getResourceImageWithFallback(id, 'icon')}
                      alt={resource.name}
                      resourceId={id}
                      style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 8 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.95rem' }}>{resourceData.amount} / {resourceData.capacity}</Typography>
                      <Typography variant="caption" sx={{ color: '#fff' }}>Utilization: {Math.round(percentage)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Warehouse sx={{ fontSize: '1rem', color: '#fff' }} />}
                        onClick={() => handleUpgradeStorage(id)}
                        disabled={credits < nextUpgradeCost}
                        sx={{
                          whiteSpace: 'nowrap',
                          color: '#fff',
                          textShadow: '0 2px 8px #000, 0 1px 1px #000',
                          backgroundColor: credits < nextUpgradeCost ? 'grey.700' : 'primary.main',
                          border: '1px solid #fff',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          boxShadow: 2,
                          '& .MuiButton-startIcon': {
                            marginRight: 0.5
                          },
                          '&:hover': {
                            backgroundColor: credits < nextUpgradeCost ? 'grey.700' : 'primary.light',
                            borderColor: '#fff',
                            color: '#fff',
                            textShadow: '0 2px 8px #000, 0 1px 1px #000',
                          },
                          '&.Mui-disabled': {
                            color: '#fff',
                            textShadow: '0 2px 8px #000, 0 1px 1px #000',
                          }
                        }}
                      >
                        {nextUpgradeCost} Credits
                      </Button>
                      <Typography variant="caption" sx={{ color: '#fff', mt: 0.2 }}>
                        +{STORAGE_CONFIG.UPGRADE_CAPACITY} Capacity
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            background: 'rgba(30,30,30,0.85)',
            color: '#fff',
            boxShadow: 6,
            '&:hover': {
              boxShadow: 10
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#fff' }}>Resource</TableCell>
                <TableCell align="right" sx={{ color: '#fff' }}>Stock</TableCell>
                <TableCell sx={{ color: '#fff' }}>Utilization</TableCell>
                <TableCell align="right" sx={{ color: '#fff' }}>Level</TableCell>
                <TableCell align="right" sx={{ color: '#fff' }}>Action</TableCell>
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
                          borderBottom: '1px solid ' + theme.palette.divider,
                        }
                      }}
                    >
                      <TableCell sx={{ color: '#fff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          <ResourceIcon
                            iconUrls={getResourceImageWithFallback(id, 'icon')}
                            alt={resource.name}
                            resourceId={id}
                            style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 8 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff' }}>
                        <Typography variant="body2" sx={{ color: '#fff' }}>{resourceData.amount} / {resourceData.capacity}</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '150px', color: '#fff' }}>
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
                          <Typography variant="body2" sx={{ color: '#fff', minWidth: 35 }}>
                            {Math.round(percentage)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff' }}>
                        <Typography variant="body2" sx={{ color: '#fff' }}>{resourceData.storageLevel}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Warehouse sx={{ fontSize: '1rem', color: '#fff' }} />}
                            onClick={() => handleUpgradeStorage(id)}
                            disabled={credits < nextUpgradeCost}
                            sx={{
                              whiteSpace: 'nowrap',
                              color: '#fff',
                              textShadow: '0 2px 8px #000, 0 1px 1px #000',
                              backgroundColor: credits < nextUpgradeCost ? 'grey.700' : 'primary.main',
                              border: '1px solid #fff',
                              padding: '2px 8px',
                              fontSize: '0.75rem',
                              boxShadow: 2,
                              '& .MuiButton-startIcon': {
                                marginRight: 0.5
                              },
                              '&:hover': {
                                backgroundColor: credits < nextUpgradeCost ? 'grey.700' : 'primary.light',
                                borderColor: '#fff',
                                color: '#fff',
                                textShadow: '0 2px 8px #000, 0 1px 1px #000',
                              },
                              '&.Mui-disabled': {
                                color: '#fff',
                                textShadow: '0 2px 8px #000, 0 1px 1px #000',
                              }
                            }}
                          >
                            {nextUpgradeCost} Credits
                          </Button>
                          <Typography variant="caption" sx={{ color: '#fff', mt: 0.2 }}>
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
      )}
    </Box>
  );
};

export default Storage;
