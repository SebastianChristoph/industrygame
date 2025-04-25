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
  Tooltip,
  IconButton
} from '@mui/material';
import { RESOURCES, calculateUpgradeCost } from '../config/resources';
import { upgradeStorage } from '../store/gameSlice';
import { Warehouse, Info } from '@mui/icons-material';

const Storage = () => {
  const dispatch = useDispatch();
  const { credits, resources } = useSelector(state => state.game);

  const handleUpgradeStorage = (resourceId) => {
    dispatch(upgradeStorage(resourceId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Rohstofflager
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Credits verfügbar: {credits}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rohstoff</TableCell>
              <TableCell>Beschreibung</TableCell>
              <TableCell align="right">Lagerbestand</TableCell>
              <TableCell>Auslastung</TableCell>
              <TableCell align="right">Level</TableCell>
              <TableCell align="right">Aktion</TableCell>
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
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '& > *': { borderBottom: 'unset' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {resource.icon}
                      <Typography>{resource.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {resource.description}
                      <Tooltip title="Klicke auf Upgrade um die Lagerkapazität zu erhöhen">
                        <IconButton size="small">
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {resourceData.amount} / {resourceData.capacity}
                  </TableCell>
                  <TableCell sx={{ width: '200px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage}
                          sx={{
                            height: 8,
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
                    {resourceData.storageLevel}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Warehouse />}
                      onClick={() => handleUpgradeStorage(id)}
                      disabled={credits < nextUpgradeCost}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Upgrade ({nextUpgradeCost} Credits)
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