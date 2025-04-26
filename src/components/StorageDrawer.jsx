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
import { RESOURCES, calculateUpgradeCost } from '../config/resources';
import { upgradeStorage } from '../store/gameSlice';

const StorageDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { credits, resources } = useSelector(state => state.game);

  const handleUpgradeStorage = (resourceId) => {
    dispatch(upgradeStorage(resourceId));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 700 } }
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
                <TableCell width="16%">Rohstoff</TableCell>
                <TableCell width="28%" align="right">Bestand</TableCell>
                <TableCell width="22%">Auslastung</TableCell>
                <TableCell width="14%" align="right">Level</TableCell>
                <TableCell width="24%" align="right">Aktion</TableCell>
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
                      <Tooltip title={resource.description}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {resource.icon}
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