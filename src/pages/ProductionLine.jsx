import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText
} from '@mui/material';
import {
  ArrowBack,
  Storage,
  ShoppingCart,
  Settings,
  ArrowForward,
  PlayArrow,
  Stop,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sell as SellIcon,
  KeyboardArrowDown as ArrowDownIcon,
  MonetizationOn
} from '@mui/icons-material';
import {
  PRODUCTION_RECIPES,
  RESOURCES,
  INPUT_SOURCES,
  OUTPUT_TARGETS
} from '../config/resources';
import {
  setInputSource,
  toggleProduction,
  removeProductionLine,
  renameProductionLine,
  setOutputTarget
} from '../store/gameSlice';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';

// Definiere die Styles direkt im JSX
const styles = `
  @keyframes popEffect {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    30% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
    70% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
  }

  .production-animation {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    pointer-events: none;
  }

  .production-animation.animate {
    animation: popEffect 1s ease-out forwards;
  }

  .credits-text {
    color: #4caf50;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ProductionLine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productionLineId = parseInt(id);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showProductionAnimation, setShowProductionAnimation] = useState(false);
  const [prevPings, setPrevPings] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const productionLine = useSelector(state =>
    state.game.productionLines.find(line => line.id === productionLineId)
  );

  const productionConfig = useSelector(state =>
    state.game.productionConfigs[productionLineId]
  );

  const productionStatus = useSelector(state =>
    state.game.productionStatus[productionLineId]
  );

  const resources = useSelector(state => state.game.resources);
  const credits = useSelector(state => state.game.credits);
  const selectedRecipe = PRODUCTION_RECIPES[productionConfig?.recipe];

  const productionLines = useSelector(state => state.game.productionLines);

  // Berechne den Fortschritt in Prozent
  const progressPercent = productionStatus?.currentPings 
    ? (productionStatus.currentPings >= selectedRecipe?.productionTime 
        ? 100 
        : (productionStatus.currentPings / selectedRecipe?.productionTime) * 100)
    : 0;

  // Setze automatisch die Einkaufsmodule für die Inputs, wenn noch nicht konfiguriert
  useEffect(() => {
    if (productionConfig?.recipe && (!productionConfig.inputs || productionConfig.inputs.length === 0)) {
      PRODUCTION_RECIPES[productionConfig.recipe].inputs.forEach((input, index) => {
        const resource = RESOURCES[input.resourceId];
        dispatch(setInputSource({
          productionLineId,
          inputIndex: index,
          source: resource.purchasable ? INPUT_SOURCES.PURCHASE_MODULE : INPUT_SOURCES.GLOBAL_STORAGE,
          resourceId: input.resourceId
        }));
      });
    }
  }, [productionConfig?.recipe, dispatch, productionLineId]);

  // Watch for production completion
  useEffect(() => {
    if (!productionStatus?.isActive || !selectedRecipe) return;

    const currentPings = productionStatus.currentPings;
    const wasNearCompletion = prevPings >= (selectedRecipe.productionTime - 1);
    const justCompleted = wasNearCompletion && currentPings === 0;

    setPrevPings(currentPings);

    if (justCompleted) {
      console.log('EFFECT! Animation triggered');
      setAnimationKey(prev => prev + 1);
      setShowProductionAnimation(true);
      
      const timer = setTimeout(() => {
        console.log('Animation ended');
        setShowProductionAnimation(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [productionStatus?.currentPings, productionStatus?.isActive, selectedRecipe, prevPings]);

  const handleToggleProduction = () => {
    dispatch(toggleProduction(productionLineId));
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
    if (requiredCredits > 0 && credits < requiredCredits) {
      return false;
    }

    return hasEnoughResources;
  };

  const checkNameUniqueness = (name) => {
    return !productionLines.some(line => 
      line.id !== productionLineId && 
      line.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleRenameClick = () => {
    setNewName(productionLine.name);
    setNameError('');
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setNameError('Name darf nicht leer sein');
      return;
    }
    
    if (!checkNameUniqueness(trimmedName)) {
      setNameError('Eine Produktionslinie mit diesem Namen existiert bereits');
      return;
    }

    dispatch(renameProductionLine({
      id: productionLineId,
      name: trimmedName
    }));
    setIsRenameDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    navigate('/production');
    dispatch(removeProductionLine(productionLineId));
  };

  const getAnimationContent = () => {
    if (!selectedRecipe) return null;

    const outputTarget = productionConfig?.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE;
    const outputResource = RESOURCES[selectedRecipe.output.resourceId];

    if (outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
      const creditValue = outputResource.basePrice * selectedRecipe.output.amount;
      return (
        <div className="credits-text">
          <MonetizationOn sx={{ fontSize: 'inherit', color: 'inherit' }} />
          +{creditValue}
        </div>
      );
    }

    return outputResource.icon;
  };

  if (!productionLine || !selectedRecipe) {
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

  return (
    <Box sx={{ p: 3 }}>
      <style>{styles}</style>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
        >
          Zurück
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {RESOURCES[selectedRecipe.output.resourceId].icon}
          <Typography variant="h4">
            {productionLine.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Umbenennen">
            <IconButton onClick={handleRenameClick}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Löschen">
            <IconButton color="error" onClick={handleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3} direction="column" alignItems="center">
        <Grid item xs={12} md={6} style={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Eingangskonfiguration
              </Typography>
              <List>
                {selectedRecipe.inputs.map((input, index) => {
                  const resource = RESOURCES[input.resourceId];
                  const inputConfig = productionConfig.inputs[index];
                  const isGlobalStorage = inputConfig?.source === INPUT_SOURCES.GLOBAL_STORAGE;
                  
                  return (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {resource.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${resource.name} (${input.amount}x)`}
                        secondary={
                          isGlobalStorage
                            ? `Aus globalem Lager (${resources[input.resourceId].amount} verfügbar)`
                            : `Wird automatisch eingekauft (${resource.basePrice * input.amount} Credits pro Produktion)`
                        }
                      />
                      <ToggleButtonGroup
                        value={inputConfig?.source || INPUT_SOURCES.PURCHASE_MODULE}
                        exclusive
                        onChange={(_, newSource) => {
                          if (newSource) {
                            dispatch(setInputSource({
                              productionLineId,
                              inputIndex: index,
                              source: newSource,
                              resourceId: input.resourceId
                            }));
                          }
                        }}
                        size="small"
                      >
                        <ToggleButton value={INPUT_SOURCES.GLOBAL_STORAGE}>
                          <Tooltip title="Aus globalem Lager">
                            <Storage />
                          </Tooltip>
                        </ToggleButton>
                        {resource.purchasable && (
                          <ToggleButton value={INPUT_SOURCES.PURCHASE_MODULE}>
                            <Tooltip title="Automatisch einkaufen">
                              <ShoppingCart />
                            </Tooltip>
                          </ToggleButton>
                        )}
                      </ToggleButtonGroup>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} style={{ width: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: 2,
            my: 2,
            position: 'relative',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowDownIcon color="error" sx={{ fontSize: 40 }} />
              <Typography variant="body1" color="error.main" fontWeight="bold">
                {selectedRecipe.productionTime} Pings
              </Typography>
            </Box>
            
            {(productionStatus?.isActive || productionStatus?.currentPings >= selectedRecipe?.productionTime) && (
              <LinearProgress 
                variant="determinate" 
                value={progressPercent}
                sx={{
                  width: '100%',
                  height: 20,
                  borderRadius: 2,
                  backgroundColor: 'action.disabledBackground',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: canStartProduction() ? 'primary.main' : 'error.main',
                    transition: 'transform 0.3s linear'
                  }
                }}
              />
            )}

            {showProductionAnimation && selectedRecipe && (
              <div 
                key={animationKey}
                className={`production-animation animate`}
              >
                {getAnimationContent()}
              </div>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6} style={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ausgangskonfiguration
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {RESOURCES[selectedRecipe.output.resourceId].icon}
                  <Typography variant="body1">
                    {selectedRecipe.output.amount}x {RESOURCES[selectedRecipe.output.resourceId].name}
                  </Typography>
                </Box>
                
                <ToggleButtonGroup
                  value={productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE}
                  exclusive
                  onChange={(_, newTarget) => {
                    if (newTarget) {
                      dispatch(setOutputTarget({
                        productionLineId,
                        target: newTarget
                      }));
                    }
                  }}
                  sx={{ mt: 2 }}
                >
                  <ToggleButton value={OUTPUT_TARGETS.GLOBAL_STORAGE}>
                    <Tooltip title="In globales Lager">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storage />
                        <Typography variant="body2">
                          Lager ({resources[selectedRecipe.output.resourceId].amount}/{resources[selectedRecipe.output.resourceId].capacity})
                        </Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={OUTPUT_TARGETS.AUTO_SELL}>
                    <Tooltip title="Automatisch verkaufen">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SellIcon />
                        <Typography variant="body2">
                          Verkaufen ({RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount} Credits pro Produktion)
                        </Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Tooltip title={
          productionStatus?.error ? productionStatus.error :
          !canStartProduction() ?
          "Nicht genügend Ressourcen, Lagerkapazität oder Credits" :
          productionStatus?.isActive ?
          "Produktion stoppen" :
          "Produktion starten"
        }>
          <span>
            <Button
              variant="contained"
              color={productionStatus?.isActive ? "error" : "primary"}
              startIcon={productionStatus?.isActive ? <Stop /> : <PlayArrow />}
              onClick={handleToggleProduction}
              disabled={!canStartProduction() && !productionStatus?.isActive}
            >
              {productionStatus?.isActive ? "Stop" : "Start"}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {productionStatus?.error && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">
            Fehler: {productionStatus.error}
          </Typography>
        </Box>
      )}

      {/* Dialog für Umbenennen */}
      <Dialog
        open={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
      >
        <DialogTitle>Produktionslinie umbenennen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Neuer Name"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setNameError('');
            }}
            error={!!nameError}
            helperText={nameError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirmRename}
            variant="contained"
            disabled={!newName.trim() || !!nameError}
          >
            Umbenennen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für Löschen bestätigen */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Produktionslinie löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchtest du diese Produktionslinie wirklich löschen? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionLine; 