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
import { RESOURCES, calculateUpgradeCost } from '../config/resources';
import { upgradeStorage } from '../store/gameSlice';
import { Warehouse } from '@mui/icons-material';

const Storage = () => {
  const dispatch = useDispatch();
  const { credits, resources } = useSelector(state => state.game);
  const theme = useTheme();

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
            {Object.entries(RESOURCES).map(([id, resource]) => {
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {resource.icon}
                      <Typography variant="body2" color="text.primary">{resource.name}</Typography>
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
                        '& .MuiButton-startIcon': {
                          marginRight: 0.5
                        },
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          bgcolor: theme.palette.action.hover
                        }
                      }}
                    >
                      {nextUpgradeCost}
                    </Button>
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