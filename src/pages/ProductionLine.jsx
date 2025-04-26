import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '@mui/material/styles';
import { MODULES } from '../config/modules';

const styles = `
  @keyframes pulseFast {
    0% { transform: scale(1); }
    50% { transform: scale(1.18); }
    100% { transform: scale(1); }
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
  const [showFullProgress, setShowFullProgress] = useState(false);
  const [hasCycledOnce, setHasCycledOnce] = useState(false);
  const prevPingsRef = useRef(0);

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

  const theme = useTheme();

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

  // Effekt für 100%-Balken-Anzeige und Zyklus-Tracking
  useEffect(() => {
    if (!productionStatus?.isActive || !selectedRecipe) return;
    const currentPings = productionStatus.currentPings;
    const prevPings = prevPingsRef.current;
    // Wenn der Zyklus abgeschlossen wurde (z.B. von 7 -> 0 bei 8 Pings)
    if (prevPings === selectedRecipe.productionTime - 1 && currentPings === 0) {
      setShowFullProgress(true);
      setHasCycledOnce(true);
      const timer = setTimeout(() => {
        setShowFullProgress(false);
      }, 400);
      return () => clearTimeout(timer);
    }
    prevPingsRef.current = currentPings;
  }, [productionStatus?.currentPings, productionStatus?.isActive, selectedRecipe]);

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
      setNameError('Name cannot be empty');
      return;
    }
    
    if (!checkNameUniqueness(trimmedName)) {
      setNameError('A production line with this name already exists');
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

  // Hilfsfunktionen für Ausgaben/Einnahmen
  const getAutoPurchaseCost = () => {
    if (!selectedRecipe || !productionConfig?.inputs) return 0;
    let cost = 0;
    selectedRecipe.inputs.forEach((input, index) => {
      const inputConfig = productionConfig.inputs[index];
      if (inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE) {
        cost += RESOURCES[input.resourceId].basePrice * input.amount;
      }
    });
    return cost;
  };
  const getSellIncome = () => {
    if (!selectedRecipe) return 0;
    if ((productionConfig?.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.AUTO_SELL) {
      return RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount;
    }
    return 0;
  };

  // Angepasste Progress-Berechnung
  const displayProgressPercent = showFullProgress ? 100 : (
    productionStatus?.currentPings && selectedRecipe?.productionTime
      ? (productionStatus.currentPings / selectedRecipe.productionTime) * 100
      : 0
  );

  // Bilanzwerte direkt im Render ermitteln, damit sie immer aktuell sind
  const inputCost = selectedRecipe.inputs.reduce((sum, input) => sum + RESOURCES[input.resourceId].basePrice * input.amount, 0);
  const sellIncome = RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount;
  const isSelling = productionConfig?.outputTarget === OUTPUT_TARGETS.AUTO_SELL;
  const balance = isSelling ? (sellIncome - inputCost) : -inputCost;

  const getModuleTypeForRecipe = (recipeId) => {
    if (!recipeId) return null;
    for (const [moduleKey, moduleObj] of Object.entries(MODULES)) {
      if (moduleObj.recipes.includes(recipeId)) {
        return moduleObj.id;
      }
    }
    // fallback: try to guess by output resource (agriculture for wheat, corn, etc.)
    if (selectedRecipe?.output?.resourceId) {
      const agriOutputs = ['wheat', 'corn', 'flour', 'bread', 'biofuel'];
      if (agriOutputs.includes(selectedRecipe.output.resourceId)) return 'agriculture';
    }
    return null;
  };

  const moduleType = getModuleTypeForRecipe(productionConfig?.recipe);
  let backgroundImg = null;
  if (moduleType === 'agriculture') {
    backgroundImg = '/images/pl_fade_agriculture.png';
  }
  if (moduleType === 'technology') {
    backgroundImg = '/images/pl_fade_technology.png';
  }
  if (moduleType === 'weapons') {
    backgroundImg = '/images/pl_fade_weapons.png';
  }

  if (!productionLine || !selectedRecipe) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Production line not found
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
          sx={{ mt: 2 }}
        >
          Back to Overview
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <style>{styles}</style>
      <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {RESOURCES[selectedRecipe.output.resourceId].icon}
            <Typography variant="h4">
              {productionLine.name}
            </Typography>
            {/* Minimalistische Bilanz-Anzeige: Ausgaben + Einnahmen = Bilanz */}
            <Box sx={{ ml: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 500, fontSize: '1rem', ...theme.typography.victorMono }}>
                -{inputCost}$
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 500, fontSize: '1rem', ml: 1, ...theme.typography.victorMono }}>
                +{sellIncome}$
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1rem', mx: 1, ...theme.typography.victorMono }}>
                =
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: balance > 0 ? 'success.main' : balance < 0 ? 'error.main' : 'text.secondary',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                  ...theme.typography.victorMono
                }}
              >
                {balance > 0 ? '+' : ''}{balance}$
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Rename">
              <IconButton onClick={handleRenameClick}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton color="error" onClick={handleDeleteClick}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item xs={12} md={6} style={{ width: '100%' }}>
            <Card sx={{ p: 0, m: 0, boxShadow: 0 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                  Input Configuration
                </Typography>
                <List sx={{ p: 0, m: 0 }}>
                  {selectedRecipe.inputs.map((input, index) => {
                    const resource = RESOURCES[input.resourceId];
                    const inputConfig = productionConfig.inputs[index];
                    const isGlobalStorage = inputConfig?.source === INPUT_SOURCES.GLOBAL_STORAGE;
                    return (
                      <ListItem key={index} sx={{ p: 0.5, minHeight: 32 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {resource.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={<span style={{ fontSize: 15 }}>{`${resource.name} (${input.amount}x, Single Price: ${resource.basePrice} Credits)`}</span>}
                          secondary={
                            !isGlobalStorage ? (
                              <span style={{ fontSize: 13 }}>
                                Automatically purchased (Total: {resource.basePrice * input.amount} Credits per production)
                              </span>
                            ) : (
                              <span style={{ fontSize: 13 }}>
                                From global storage ({resources[input.resourceId].amount} available)
                              </span>
                            )
                          }
                          sx={{ my: 0 }}
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
                          sx={{ height: 28 }}
                        >
                          <ToggleButton value={INPUT_SOURCES.GLOBAL_STORAGE} sx={{ p: 0.5, minWidth: 28, height: 28 }}>
                            <Tooltip title="From global storage">
                              <Storage fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                          {resource.purchasable && (
                            <ToggleButton value={INPUT_SOURCES.PURCHASE_MODULE} sx={{ p: 0.5, minWidth: 28, height: 28 }}>
                              <Tooltip title="Auto purchase">
                                <ShoppingCart fontSize="small" />
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
                <ArrowDownIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body1" color="text.primary" fontWeight="bold" align="center">
                {selectedRecipe.productionTime} Pings
              </Typography>
              {(productionStatus?.isActive || productionStatus?.currentPings >= selectedRecipe?.productionTime) && (
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <LinearProgress 
                    variant="determinate"
                    value={displayProgressPercent}
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
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 6px #000, 0 1px 1px #000' }}>
                      {Math.round(displayProgressPercent)}%
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6} style={{ width: '100%' }}>
            <Card sx={{ p: 0, m: 0, boxShadow: 0 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                  Output Configuration
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {RESOURCES[selectedRecipe.output.resourceId].icon}
                    <Typography variant="body2" sx={{ fontSize: 15 }}>
                      {selectedRecipe.output.amount}x {RESOURCES[selectedRecipe.output.resourceId].name}
                    </Typography>
                  </Box>
                  {selectedRecipe.output.resourceId === 'research_points' ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mt: 2,
                      mb: 1,
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Research Points are automatically added to your global research points
                      </Typography>
                    </Box>
                  ) : (
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
                      sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 2,
                        mb: 1,
                        gap: 2,
                      }}
                    >
                      <ToggleButton
                        value={OUTPUT_TARGETS.GLOBAL_STORAGE}
                        sx={{
                          flex: 1,
                          minWidth: 120,
                          height: 48,
                          fontSize: 16,
                          fontWeight: 600,
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Storage fontSize="medium" />
                        <Typography variant="caption" sx={{ fontSize: 14 }}>
                          Storage ({resources[selectedRecipe.output.resourceId].amount}/{resources[selectedRecipe.output.resourceId].capacity})
                        </Typography>
                      </ToggleButton>
                      <ToggleButton
                        value={OUTPUT_TARGETS.AUTO_SELL}
                        sx={{
                          flex: 1,
                          minWidth: 120,
                          height: 48,
                          fontSize: 16,
                          fontWeight: 600,
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        <SellIcon fontSize="medium" />
                        <Typography variant="caption" sx={{ fontSize: 14 }}>
                          Sell ({RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount} Credits per production)
                        </Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
          <Tooltip title={
            productionStatus?.error ? productionStatus.error :
            !canStartProduction() ?
            "Not enough resources, storage capacity or credits" :
            productionStatus?.isActive ?
            "Stop production" :
            "Start production"
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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/production')}
            variant="outlined"
            sx={{ ml: 2 }}
          >
            Back
          </Button>
        </Box>

        {productionStatus?.error && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'rgba(255, 68, 68, 0.1)', 
            borderRadius: 1,
            border: '1px solid #ff4444',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography color="error.main" sx={{ fontWeight: 500 }}>
              {productionStatus.error}
            </Typography>
          </Box>
        )}

        {/* Dialog for renaming */}
        <Dialog
          open={isRenameDialogOpen}
          onClose={() => setIsRenameDialogOpen(false)}
        >
          <DialogTitle>Rename Production Line</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Name"
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
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRename}
              variant="contained"
              disabled={!newName.trim() || !!nameError}
            >
              Rename
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for delete confirmation */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Production Line</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Do you really want to delete this production line? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ProductionLine; 