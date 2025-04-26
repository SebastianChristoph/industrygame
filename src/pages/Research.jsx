import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tooltip
} from '@mui/material';
import { MODULES } from '../config/modules';
import { unlockModule } from '../store/gameSlice';

const Research = () => {
  const dispatch = useDispatch();
  const unlockedModules = useSelector(state => state.game.unlockedModules);

  const handleUnlockModule = (moduleId) => {
    dispatch(unlockModule(moduleId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Forschung
      </Typography>

      <Grid container spacing={3}>
        {Object.values(MODULES).map((module) => {
          const isUnlocked = unlockedModules.includes(module.id);
          
          return (
            <Grid item xs={12} md={4} key={module.id}>
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

                  <Typography variant="subtitle2" gutterBottom>
                    Verfügbare Rezepte:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {module.recipes.map((recipeId) => (
                      <Tooltip key={recipeId} title={recipeId}>
                        <Box
                          sx={{
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {recipeId}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Verfügbare Ressourcen:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {module.resources.map((resourceId) => (
                      <Tooltip key={resourceId} title={resourceId}>
                        <Box
                          sx={{
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {resourceId}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isUnlocked}
                    onClick={() => handleUnlockModule(module.id)}
                  >
                    {isUnlocked ? 'Freigeschaltet' : 'Freischalten'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Research; 