import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack, 
  Settings, 
  Storage, 
  ShoppingCart,
  ArrowForward,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { 
  PRODUCTION_RECIPES, 
  RESOURCES, 
  INPUT_SOURCES 
} from '../config/resources';
import { 
  setProductionRecipe, 
  setInputSource,
  toggleProduction,
  updateProductionProgress
} from '../store/gameSlice';

const ProductionLine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [selectedInputIndex, setSelectedInputIndex] = useState(null);

  const productionLine = useSelector(state => 
    state.game.productionLines.find(line => line.id === Number(id))
  );
  
  const productionConfig = useSelector(state => 
    state.game.productionConfigs[Number(id)] || { recipe: null, inputs: [] }
  );

  const productionStatus = useSelector(state =>
    state.game.productionStatus[Number(id)] || { isActive: false, progress: 0 }
  );

  const resources = useSelector(state => state.game.resources);

  // Aktualisiere den Fortschritt regelmäßig
  useEffect(() => {
    if (productionStatus.isActive) {
      const interval = setInterval(() => {
        dispatch(updateProductionProgress({
          productionLineId: Number(id),
          currentTime: Date.now()
        }));
      }, 1000); // Aktualisiere jede Sekunde

      return () => clearInterval(interval);
    }
  }, [productionStatus.isActive, id, dispatch]);

  const handleRecipeChange = (event) => {
    dispatch(setProductionRecipe({
      productionLineId: Number(id),
      recipeId: event.target.value
    }));
  };

  const handleInputSourceSelect = (source, resourceId) => {
    dispatch(setInputSource({
      productionLineId: Number(id),
      inputIndex: selectedInputIndex,
      source,
      resourceId
    }));
    setIsSourceDialogOpen(false);
  };

  const handleToggleProduction = () => {
    dispatch(toggleProduction(Number(id)));
  };

  const openSourceDialog = (inputIndex) => {
    setSelectedInputIndex(inputIndex);
    setIsSourceDialogOpen(true);
  };

  const canStartProduction = () => {
    if (!selectedRecipe) return false;

    // Prüfe Lagerkapazität für Output
    const outputResource = resources[selectedRecipe.output.resourceId];
    if (outputResource.amount + selectedRecipe.output.amount > outputResource.capacity) {
      return false;
    }

    // Prüfe Ressourcen und Credits
    let requiredCredits = 0;
    const hasEnoughResources = selectedRecipe.inputs.every((input, index) => {
      const inputConfig = productionConfig.inputs[index];
      if (!inputConfig) return false;
      
      if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
        return resources[input.resourceId].amount >= input.amount;
      } else {
        requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
        return true;
      }
    });

    // Prüfe Credits für automatische Einkäufe
    if (requiredCredits > 0 && resources.credits < requiredCredits) {
      return false;
    }

    return hasEnoughResources;
  };

  if (!productionLine) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Produktionslinie nicht gefunden
        </Typography>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  const selectedRecipe = PRODUCTION_RECIPES[productionConfig.recipe];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
        >
          Zurück
        </Button>
        <Typography variant="h4">
          {productionLine.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Rezeptauswahl */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                Produktionskonfiguration
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Rezept auswählen</InputLabel>
                <Select
                  value={productionConfig.recipe || ''}
                  onChange={handleRecipeChange}
                  label="Rezept auswählen"
                  disabled={productionStatus.isActive}
                >
                  {Object.values(PRODUCTION_RECIPES).map(recipe => (
                    <MenuItem key={recipe.id} value={recipe.id}>
                      {recipe.name} ({recipe.productionTime} Pings)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Input Konfiguration */}
        {selectedRecipe && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eingänge konfigurieren
                </Typography>
                <List>
                  {selectedRecipe.inputs.map((input, index) => {
                    const inputConfig = productionConfig.inputs[index];
                    const resource = RESOURCES[input.resourceId];
                    const currentAmount = resources[input.resourceId].amount;
                    
                    return (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {inputConfig?.source === INPUT_SOURCES.GLOBAL_STORAGE ? (
                            <Storage />
                          ) : inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE ? (
                            <ShoppingCart />
                          ) : (
                            <Settings />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${resource.name} (${input.amount}x)`}
                          secondary={
                            <>
                              {inputConfig ? (
                                inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE ? 
                                  `Aus globalem Lager (Verfügbar: ${currentAmount})` : 
                                  'Wird eingekauft'
                              ) : 'Quelle nicht konfiguriert'}
                            </>
                          }
                        />
                        <Button
                          variant="outlined"
                          onClick={() => openSourceDialog(index)}
                          disabled={productionStatus.isActive}
                        >
                          Quelle wählen
                        </Button>
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Output und Produktionssteuerung */}
        {selectedRecipe && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Produktion
                  </Typography>
                  <Tooltip title={
                    productionStatus.error ? productionStatus.error :
                    !canStartProduction() ? 
                    "Nicht genügend Ressourcen, Lagerkapazität oder Credits" : 
                    productionStatus.isActive ? 
                    "Produktion stoppen" : 
                    "Produktion starten"
                  }>
                    <span>
                      <Button
                        variant="contained"
                        color={productionStatus.isActive ? "error" : "primary"}
                        startIcon={productionStatus.isActive ? <Stop /> : <PlayArrow />}
                        onClick={handleToggleProduction}
                        disabled={!canStartProduction() && !productionStatus.isActive}
                      >
                        {productionStatus.isActive ? "Stop" : "Start"}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography>
                    {selectedRecipe.inputs.map(input => 
                      `${input.amount}x ${RESOURCES[input.resourceId].name}`
                    ).join(' + ')}
                  </Typography>
                  <ArrowForward />
                  <Typography>
                    {`${selectedRecipe.output.amount}x ${RESOURCES[selectedRecipe.output.resourceId].name}`}
                  </Typography>
                </Box>

                {productionStatus.error && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography color="error">
                      Fehler: {productionStatus.error}
                    </Typography>
                  </Box>
                )}

                {productionStatus.isActive && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={productionStatus.progress} 
                      size={40}
                    />
                    <Typography>
                      {Math.round(productionStatus.progress)}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog für die Auswahl der Input-Quelle */}
      <Dialog 
        open={isSourceDialogOpen} 
        onClose={() => setIsSourceDialogOpen(false)}
      >
        <DialogTitle>Quelle für Input wählen</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={() => handleInputSourceSelect(INPUT_SOURCES.GLOBAL_STORAGE, selectedRecipe?.inputs[selectedInputIndex]?.resourceId)}>
              <ListItemIcon>
                <Storage />
              </ListItemIcon>
              <ListItemText 
                primary="Aus globalem Lager"
                secondary="Nutze Ressourcen aus dem Hauptlager"
              />
            </ListItem>
            <ListItem button onClick={() => handleInputSourceSelect(INPUT_SOURCES.PURCHASE_MODULE, selectedRecipe?.inputs[selectedInputIndex]?.resourceId)}>
              <ListItemIcon>
                <ShoppingCart />
              </ListItemIcon>
              <ListItemText 
                primary="Automatisch einkaufen"
                secondary="Kaufe Ressourcen automatisch ein"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSourceDialogOpen(false)}>
            Abbrechen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionLine; 