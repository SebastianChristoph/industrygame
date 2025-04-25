import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  LinearProgress,
  Stack
} from '@mui/material';
import { RESOURCES } from '../config/resources';
import { upgradeStorage } from '../store/gameSlice';
import { Warehouse } from '@mui/icons-material';

const Storage = () => {
  const dispatch = useDispatch();
  const { credits, resources } = useSelector(state => state.game);

  const handleUpgradeStorage = (resourceId) => {
    dispatch(upgradeStorage(resourceId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rohstofflager
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Credits verfügbar: {credits}
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(RESOURCES).map(([id, resource]) => {
          const resourceData = resources[id];
          const percentage = (resourceData.amount / resourceData.capacity) * 100;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {resource.icon}
                      </Typography>
                      <Typography variant="h6">
                        {resource.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {resource.description}
                    </Typography>
                    
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Lagerbestand: {resourceData.amount} / {resourceData.capacity}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ mb: 2 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Lagerstufe: {resourceData.storageLevel}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Warehouse />}
                        onClick={() => handleUpgradeStorage(id)}
                        disabled={credits < 200}
                      >
                        Upgrade (200 Credits)
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Storage; 