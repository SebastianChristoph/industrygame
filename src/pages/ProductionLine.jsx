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
import { getResourceProductionImage, getResourceIcon, getResourceImageWithFallback } from '../config/resourceImages';
import { Tooltip as MuiTooltip } from '@mui/material';

const styles = `
  @keyframes pulseFast {
    0% { transform: scale(1); }
    50% { transform: scale(1.18); }
    100% { transform: scale(1); }
  }
`;

// Hilfskomponente für Icon mit Fallback-Handling
const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const ResourceIcon = ({ iconUrls, alt, resourceId, ...props }) => {
  // Sonderfall: Research-Icons (Name, ResourceId oder Output-ResourceId enthält 'research')
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

  // Helper: Render resource icons as images, repeated as needed
  const renderResourceIcons = (resourceId, amount) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1 }}>
      {Array.from({ length: amount }).map((_, idx) => (
        <ResourceIcon
          key={idx}
          iconUrls={getResourceImageWithFallback(resourceId, 'icon')}
          alt={RESOURCES[resourceId]?.name + ' icon'}
          resourceId={resourceId}
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
      ))}
    </Box>
  );

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, mb: 8 }}>
            <ResourceIcon
              iconUrls={getResourceImageWithFallback(selectedRecipe.output.resourceId, 'icon')}
              alt={RESOURCES[selectedRecipe.output.resourceId]?.name + ' icon'}
              resourceId={selectedRecipe.output.resourceId}
              style={{ width: 40, height: 40, objectFit: 'contain', marginRight: 8 }}
            />
            <Typography variant="h1" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {productionLine.name}
            </Typography>
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
            {/* Minimalistische Bilanz-Anzeige: Ausgaben + Einnahmen = Bilanz */}
         
          </Box>
        
        </Box>

        {/* Neues Produktions-Layout */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6, mt: 10 }}>
          {/* Input-Bilder und Umschalter */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'flex-end', mt:8 }}>
            {selectedRecipe.inputs.map((input, idx) => {
              const resource = RESOURCES[input.resourceId];
              const inputConfig = productionConfig.inputs[idx];
              const isGlobalStorage = (inputConfig?.source || INPUT_SOURCES.PURCHASE_MODULE) === INPUT_SOURCES.GLOBAL_STORAGE;
              const isAutoBuy = (inputConfig?.source || INPUT_SOURCES.PURCHASE_MODULE) === INPUT_SOURCES.PURCHASE_MODULE;
              const stock = resources[input.resourceId]?.amount ?? 0;
              const singlePrice = resource.basePrice;
              const totalPrice = singlePrice * input.amount;
              return (
                <React.Fragment key={input.resourceId}>
                  {idx > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: 260, mx: 1 }}>
                      <Box sx={{ flex: 1 }} />
                      <Typography variant="h3" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '2.5rem', lineHeight: 1, mb: 9 }}>{'+'}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220, justifyContent: 'flex-end', height: 260 }}>
                    <img
                      src={getResourceProductionImage(input.resourceId)}
                      alt={resource?.name + ' production'}
                      style={{ maxHeight: '220px', maxWidth: '220px', objectFit: 'contain', display: 'block' }}
                      onError={e => { e.target.onerror = null; e.target.src = '/images/production/Placeholder.png'; }}
                    />
                    {renderResourceIcons(input.resourceId, input.amount)}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 48, mt: 2 }}>
                      <ToggleButtonGroup
                        value={inputConfig?.source || INPUT_SOURCES.PURCHASE_MODULE}
                        exclusive
                        onChange={(_, newSource) => {
                          if (newSource) {
                            dispatch(setInputSource({
                              productionLineId,
                              inputIndex: idx,
                              source: newSource,
                              resourceId: input.resourceId
                            }));
                          }
                        }}
                        size="small"
                        sx={{ minHeight: 40 }}
                      >
                        <MuiTooltip title="From stock" arrow>
                          <ToggleButton value={INPUT_SOURCES.GLOBAL_STORAGE} sx={{ flexDirection: 'column', p: 0.5, minWidth: 40, minHeight: 40, borderRadius: 0 }}>
                            <Storage sx={{ fontSize: 22, mb: 0.5 }} />
                          </ToggleButton>
                        </MuiTooltip>
                        {resource.purchasable && (
                          <MuiTooltip title="Auto purchase" arrow>
                            <ToggleButton value={INPUT_SOURCES.PURCHASE_MODULE} sx={{ flexDirection: 'column', p: 0.5, minWidth: 40, minHeight: 40, borderRadius: 0 }}>
                              <ShoppingCart sx={{ fontSize: 22, mb: 0.5, color: 'action.active' }} />
                            </ToggleButton>
                          </MuiTooltip>
                        )}
                      </ToggleButtonGroup>
                    </Box>
                    {/* Info below the active toggle */}
                    {isGlobalStorage && (
                      <Typography variant="subtitle2" sx={{ mt: 1, color: 'text.secondary', fontSize: '1rem' }}>
                        In stock: {stock}
                      </Typography>
                    )}
                    {/* Info-Text, wenn Resource nicht purchaseable ist */}
                    {isGlobalStorage && !resource.purchasable && (
                      <Typography variant="caption" sx={{ mt: 0.5, color: 'warning.main', fontSize: '0.95rem', display: 'block', textAlign: 'center' }}>
                        This resource cannot be purchased and must be supplied from your global stock.
                      </Typography>
                    )}
                    {isAutoBuy && (
                      <Box sx={{ mt: 1, color: 'error.main', fontSize: '1rem', fontWeight: 500, textAlign: 'center' }}>
                        <div style={{ color: 'red', fontWeight: 600, fontSize: '1.1rem' }}>
                          {resource.name}: {singlePrice}$
                        </div>
                        <div style={{ color: 'red', fontWeight: 600, fontSize: '1.1rem' }}>
                          Total: {totalPrice}$
                        </div>
                      </Box>
                    )}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>

          {/* Circular Progress in the center with percent and pings inside */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 4, position: 'relative', minWidth: 220, minHeight: 220, justifyContent: 'center', height: 260 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 220, mt: 0 }}>
              <CircularProgress
                variant="determinate"
                value={displayProgressPercent}
                size={120}
                thickness={5}
                sx={{ color: canStartProduction() ? 'primary.main' : 'error.main' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.5rem', lineHeight: 1 }}>{Math.round(displayProgressPercent)}%</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1.1rem', fontWeight: 500 }}>{selectedRecipe.productionTime} Pings</Typography>
              </Box>
            </Box>
            {/* Arrow below spinner */}
            <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', alignItems: 'flex-end', height: 60 }}>
              <Typography variant="h2" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '3rem', lineHeight: 1, mb: 2 }}>
                &#8594;
              </Typography>
              {/* Bilanz unter dem Pfeil anzeigen */}
              {(() => {
                // Prüfe Inputquellen
                const allInputsFromStock = selectedRecipe.inputs.every((input, idx) => {
                  const inputConfig = productionConfig.inputs[idx];
                  return inputConfig && inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE;
                });
                // Einkaufskosten nur für eingekaufte Inputs
                const purchaseCost = selectedRecipe.inputs.reduce((sum, input, idx) => {
                  const inputConfig = productionConfig.inputs[idx];
                  if (inputConfig && inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE) {
                    return sum + RESOURCES[input.resourceId].basePrice * input.amount;
                  }
                  return sum;
                }, 0);
                // Verkaufserlös
                const sellIncome = RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount;
                const isSelling = productionConfig?.outputTarget === OUTPUT_TARGETS.AUTO_SELL;
                const isStoring = productionConfig?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE;
                let balance = 0;
                if (allInputsFromStock && isStoring) {
                  balance = 0;
                } else if (isSelling) {
                  balance = sellIncome - purchaseCost;
                } else {
                  balance = -purchaseCost;
                }
                const color = balance >= 0 ? 'success.main' : 'error.main';
                const sign = balance > 0 ? '+' : '';
                return (
                  <Typography
                    variant="h3"
                    sx={{
                      color,
                      fontWeight: 800,
                      fontSize: '2.2rem',
                      mt: 1,
                      textAlign: 'center',
                      width: '100%',
                      animation: 'pulseFast 1.2s infinite',
                    }}
                  >
                    {sign}{balance} $
                  </Typography>
                );
              })()}
            </Box>
          </Box>

          {/* Output-Bild und Umschalter */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220, justifyContent: 'flex-end', height: 260, mt:8 }}>
            <img
              src={getResourceProductionImage(selectedRecipe.output.resourceId)}
              alt={RESOURCES[selectedRecipe.output.resourceId]?.name + ' production'}
              style={{ maxHeight: '220px', maxWidth: '220px', objectFit: 'contain', display: 'block' }}
              onError={e => { e.target.onerror = null; e.target.src = '/images/production/Placeholder.png'; }}
            />
            {renderResourceIcons(selectedRecipe.output.resourceId, selectedRecipe.output.amount)}

            

            {selectedRecipe.output.resourceId !== 'research_points' && (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 48, mt: 2 }}>
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
                  sx={{ minHeight: 40 }}
                >
                  <MuiTooltip title="Store in stock" arrow>
                    <ToggleButton value={OUTPUT_TARGETS.GLOBAL_STORAGE} sx={{ flexDirection: 'column', p: 0.5, minWidth: 40, minHeight: 40, borderRadius: 0 }}>
                      <Storage sx={{ fontSize: 22, mb: 0.5 }} />
                    </ToggleButton>
                  </MuiTooltip>
                  <MuiTooltip title="Sell automatically" arrow>
                    <ToggleButton value={OUTPUT_TARGETS.AUTO_SELL} sx={{ flexDirection: 'column', p: 0.5, minWidth: 40, minHeight: 40, borderRadius: 0 }}>
                      <SellIcon sx={{ fontSize: 22, mb: 0.5, color: 'action.active' }} />
                    </ToggleButton>
                  </MuiTooltip>
                </ToggleButtonGroup>
              </Box>
            )}
            {/* Info below the active output toggle */}

            {/* Name und Verkaufspreis unter die Switch-Buttons verschieben */}
            {selectedRecipe.output.resourceId !== 'research_points' && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                {productionConfig?.outputTarget === OUTPUT_TARGETS.AUTO_SELL ? (
                  <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 700, fontSize: '1.1rem' }}>
                    {RESOURCES[selectedRecipe.output.resourceId]?.name}: {RESOURCES[selectedRecipe.output.resourceId]?.basePrice}$
                  </Typography>
                ) : (
                  <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 700, fontSize: '1.1rem' }}>
                    {RESOURCES[selectedRecipe.output.resourceId]?.name}
                  </Typography>
                )}
              </Box>
            )}

            {selectedRecipe.output.resourceId !== 'research_points' && (
              (() => {
                const isStore = (productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.GLOBAL_STORAGE;
                const isSell = (productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.AUTO_SELL;
                const outputStock = resources[selectedRecipe.output.resourceId]?.amount ?? 0;
                const outputMax = resources[selectedRecipe.output.resourceId]?.capacity ?? 0;
                const outputSinglePrice = RESOURCES[selectedRecipe.output.resourceId].basePrice;
                const outputTotalPrice = outputSinglePrice * selectedRecipe.output.amount;
                if (isStore) {
                  return (
                    <Typography variant="subtitle2" sx={{ mt: 1, color: 'text.secondary', fontSize: '1rem' }}>
                      {outputStock}/{outputMax} in stock
                    </Typography>
                  );
                }
                if (isSell) {
                  return (
                    <Typography variant="subtitle2" sx={{ mt: 1, color: 'success.main', fontWeight: 700, fontSize: '1.1rem'}}>
                      Total: {outputTotalPrice}$
                    </Typography>
                  );
                }
                return null;
              })()
            )}
          </Box>
        </Box>

        {/* Steuerungs-Buttons unten rechts */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, gap: 2 }}>
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

        {/* Fehleranzeige wie gehabt */}
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