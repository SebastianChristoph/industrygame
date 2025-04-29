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
  MonetizationOn,
  InfoOutlined
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
  setOutputTarget,
  recordProduction,
  recordProfit,
  recordResourceChange,
  recordSale,
  recordPurchase
} from '../store/gameSlice';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { MODULES } from '../config/modules';
import { getResourceProductionImage, getResourceIcon, getResourceImageWithFallback } from '../config/resourceImages';
import { Tooltip as MuiTooltip } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

// Hilfsfunktion für Bilanz pro Zyklus (wie im UI unter dem Pfeil)
function calculateCycleProfit(selectedRecipe, productionConfig, resources, OUTPUT_TARGETS, RESOURCES, INPUT_SOURCES) {
  const inputsArr = Array.isArray(productionConfig?.inputs) ? productionConfig.inputs : [];
  const allInputsFromStock = selectedRecipe.inputs.every((input, idx) => {
    const inputConfig = inputsArr[idx];
    return inputConfig && inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE;
  });
  const purchaseCost = selectedRecipe.inputs.reduce((sum, input, idx) => {
    const inputConfig = inputsArr[idx];
    if (inputConfig && inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE) {
      return sum + RESOURCES[input.resourceId].basePrice * input.amount;
    }
    return sum;
  }, 0);
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
  return balance;
}

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

  // Hole Statistikdaten aus dem Redux-Store
  const statistics = useSelector(state => state.game.statistics);

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

  // Add effect to record statistics
  useEffect(() => {
    if (!productionStatus?.isActive || !selectedRecipe) return;

    // Record production
    if (productionStatus.currentPings === 0 && productionStatus.totalPings > 0) {
      dispatch(recordProduction({
        productionLineId,
        amount: selectedRecipe.output.amount
      }));

      // Nutze die exakte Bilanz-Logik für den Profit
      const profit = calculateCycleProfit(
        selectedRecipe,
        productionConfig,
        resources,
        OUTPUT_TARGETS,
        RESOURCES,
        INPUT_SOURCES
      );
      dispatch(recordProfit({ profit, productionLineId }));

      // Record resource changes
      selectedRecipe.inputs.forEach(input => {
        const inputConfig = productionConfig.inputs.find(c => c.resourceId === input.resourceId);
        if (inputConfig?.source === INPUT_SOURCES.GLOBAL_STORAGE) {
          dispatch(recordResourceChange({
            resourceId: input.resourceId,
            amount: -input.amount
          }));
        } else if (inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE) {
          dispatch(recordPurchase({
            resourceId: input.resourceId,
            amount: input.amount
          }));
        }
      });

      if (productionConfig.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
        dispatch(recordResourceChange({
          resourceId: selectedRecipe.output.resourceId,
          amount: selectedRecipe.output.amount
        }));
      } else if (productionConfig.outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
        dispatch(recordSale({
          resourceId: selectedRecipe.output.resourceId,
          amount: selectedRecipe.output.amount
        }));
      }
    }
  }, [productionStatus?.currentPings, productionStatus?.isActive, selectedRecipe, productionConfig, dispatch, productionLineId, resources]);

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

  // Add new state for chart data (nur noch profit)
  const [chartData, setChartData] = useState([]);

  // Add effect to update chart data (nur noch profit)
  useEffect(() => {
    const currentTime = Date.now();
    const timeWindow = 5 * 60 * 1000;

    const prod = statistics.productionHistory
      .filter(e => e.productionLineId === productionLineId && e.timestamp > currentTime - timeWindow);

    const profits = statistics.profitHistory
      .filter(e => e.productionLineId === productionLineId && e.timestamp > currentTime - timeWindow);

    let cumProfit = 0;
    const chartData = prod.map((entry) => {
      const profitEntry = profits.find(
        p => Math.abs(p.timestamp - entry.timestamp) < 20
      );
      const profit = profitEntry ? profitEntry.profit : 0;
      cumProfit += profit;
      return {
        time: new Date(entry.timestamp).toLocaleTimeString(),
        profit: cumProfit
      };
    });

    setChartData(chartData);
  }, [statistics, productionLineId]);

  // Filtere productionHistory und profitHistory für diese Linie
  const productionHistory = statistics.productionHistory.filter(e => e.productionLineId === productionLineId);
  const profitHistory = statistics.profitHistory;

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
        {/* Back-Button oben links über dem Titel */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
          sx={{ mb: 2, boxShadow: 'none', border: 'none', color: 'primary.main', fontWeight: 600, fontSize: '1.1rem', pl: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
        >
          Back
        </Button>
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
          </Box>
          {/* Play/Stop Button rechts oben als Kreis-Button */}
          <Tooltip title={
            productionStatus?.error ? productionStatus.error :
            !canStartProduction() ?
            "Not enough resources, storage capacity or credits" :
            productionStatus?.isActive ?
            "Stop production" :
            "Start production"
          }>
            <span>
              <IconButton
                onClick={handleToggleProduction}
                disabled={!canStartProduction() && !productionStatus?.isActive}
                sx={{
                  bgcolor: productionStatus?.isActive ? "#f5f5f5" : "#f5f5f5",
                  color: productionStatus?.isActive ? "#b71c1c" : "#222",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  boxShadow: 2,
                  ml: 2,
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                    color: productionStatus?.isActive ? "#b71c1c" : "#111"
                  }
                }}
              >
                {productionStatus?.isActive ? <Stop sx={{ fontSize: 48 }} /> : <PlayArrow sx={{ fontSize: 48 }} />}
              </IconButton>
            </span>
          </Tooltip>
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
                    {/* Anzeige unter den Input-Icons: */}
                    {isGlobalStorage ? (
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, mb: 0.5, fontSize: '0.98rem', fontWeight: 400, textAlign: 'center' }}>
                        In stock: {stock}/{resources[input.resourceId]?.capacity ?? '-'}
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, mb: 0.5, fontSize: '0.98rem', fontWeight: 400, textAlign: 'center' }}>
                        {resource.name}: {singlePrice}$ · Total: {totalPrice}$
                      </Typography>
                    )}
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
                  <Paper
                    elevation={2}
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      mt: 1,
                      mb: 0.5,
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      boxShadow: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <ResourceIcon
                      iconUrls={getResourceImageWithFallback(selectedRecipe.output.resourceId, 'icon')}
                      alt={RESOURCES[selectedRecipe.output.resourceId]?.name + ' icon'}
                      resourceId={selectedRecipe.output.resourceId}
                      style={{ width: 24, height: 24, objectFit: 'contain', marginRight: 6 }}
                    />
                    {RESOURCES[selectedRecipe.output.resourceId]?.name}: {RESOURCES[selectedRecipe.output.resourceId]?.basePrice}$
                  </Paper>
                ) : (
                  <Paper
                    elevation={2}
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      mt: 1,
                      mb: 0.5,
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      boxShadow: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <ResourceIcon
                      iconUrls={getResourceImageWithFallback(selectedRecipe.output.resourceId, 'icon')}
                      alt={RESOURCES[selectedRecipe.output.resourceId]?.name + ' icon'}
                      resourceId={selectedRecipe.output.resourceId}
                      style={{ width: 24, height: 24, objectFit: 'contain', marginRight: 6 }}
                    />
                    {RESOURCES[selectedRecipe.output.resourceId]?.name}
                  </Paper>
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
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        px: 2.5,
                        py: 0.5,
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        boxShadow: 1,
                        mt: 1,
                        mb: 0.5,
                        minWidth: 90,
                        justifyContent: 'center',
                      }}
                    >
                      {outputStock}/{outputMax} in stock
                    </Box>
                  );
                }
                if (isSell) {
                  return (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        px: 2.5,
                        py: 0.5,
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        boxShadow: 1,
                        mt: 1,
                        mb: 0.5,
                        minWidth: 90,
                        justifyContent: 'center',
                      }}
                    >
                      <MonetizationOn sx={{ fontSize: 20, color: 'success.dark', mr: 1 }} />
                      Total: {outputTotalPrice}$
                    </Box>
                  );
                }
                return null;
              })()
            )}
          </Box>
        </Box>

        {/* Steuerungs-Buttons unten rechts */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, gap: 2 }}>
          {/* Play/Stop Button entfernt, nur noch Zurück-Button */}
          {/* Back-Button ist jetzt oben links, daher hier entfernt */}
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

      {/* Add charts section */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Production Statistics</Typography>
        <Grid container spacing={3}>
          {/* Profit Chart */}
          <Grid item xs={12} sx={{ minWidth: 0, flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Cumulative Win/Loss since production line start</Typography>
              {chartData.length === 0 && (
                <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'info.light', color: 'info.dark', p: 2, mb: 2, borderRadius: 2 }}>
                  <InfoOutlined sx={{ color: 'info.main', fontSize: 28 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    The chart will appear after the first production cycle.
                  </Typography>
                </Paper>
              )}
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={chartData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" minTickGap={30} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    strokeDasharray={chartData.some(d => d.profit < 0) ? "" : undefined}
                    dot={false}
                    isAnimationActive={false}
                    stroke={
                      chartData.length > 0 && chartData[chartData.length - 1].profit < 0
                        ? '#e53935' // rot
                        : '#43a047' // grün
                    }
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Debug-Box als dezentes Akkordeon */}
        <Accordion sx={{ mt: 2, bgcolor: '#fafbfc', border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#bbb' }} />} sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>Debug-Info</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ fontSize: '0.92rem', color: '#666', bgcolor: '#fafbfc', p: 2 }}>
            <div><b>productionStatus:</b> {JSON.stringify(productionStatus)}</div>
            <div><b>productionHistory (nur diese Linie):</b> {JSON.stringify(productionHistory)}</div>
            <div><b>profitHistory:</b> {JSON.stringify(profitHistory)}</div>
            <div><b>chartData:</b> {JSON.stringify(chartData)}</div>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ProductionLine; 