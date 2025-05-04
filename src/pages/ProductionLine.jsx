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
  FormHelperText,
  Chip
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
  InfoOutlined,
  LocalShipping as BlackMarketIcon,
  MonetizationOn as BlackMarketSellIcon
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
  recordPurchase,
  addCredits
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
import { RESEARCH_TREE } from '../config/research';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FaWarehouse } from 'react-icons/fa';
import { GiPirateSkull } from 'react-icons/gi';

const styles = `
  @keyframes pulseFast {
    0% { transform: scale(1); }
    50% { transform: scale(1.18); }
    100% { transform: scale(1); }
  }

  @keyframes pulsePlay {
    0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
    70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
    100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
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
  // Always subtract input costs, regardless of source
  const inputCost = selectedRecipe.inputs.reduce(
    (sum, input) => sum + RESOURCES[input.resourceId].basePrice * input.amount,
    0
  );
  const sellIncome = RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount;
  const isBlackMarketSell = productionConfig?.outputTarget === OUTPUT_TARGETS.BLACK_MARKET;
  let balance = isBlackMarketSell ? (sellIncome - inputCost) : -inputCost;
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
  const productionSpeed = useSelector(state => state.game?.passiveBonuses?.productionSpeed ?? 1.0);

  const productionLines = useSelector(state => state.game.productionLines);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hole Statistikdaten aus dem Redux-Store
  const statistics = useSelector(state => state.game.statistics);

  const researchedTechnologies = useSelector(state => state.game.researchedTechnologies);

  // Berechne den Fortschritt in Prozent
  const progressPercent = productionStatus?.currentPings 
    ? (productionStatus.currentPings >= selectedRecipe?.productionTime 
        ? 100 
        : (productionStatus.currentPings / selectedRecipe?.productionTime) * 100)
    : 0;

  // Hilfsfunktion: Summiere alle productionEfficiency-Boni aus erforschten Business-Technologien
  function getTotalProductionBonus() {
    let bonus = 0;
    if (RESEARCH_TREE.business && RESEARCH_TREE.business.technologies) {
      Object.values(RESEARCH_TREE.business.technologies).forEach(tech => {
        if (
          researchedTechnologies.includes(tech.id) &&
          tech.unlocks?.passiveEffects?.productionEfficiency
        ) {
          bonus += tech.unlocks.passiveEffects.productionEfficiency;
        }
      });
    }
    return bonus;
  }
  const totalBonus = getTotalProductionBonus();

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
      // Bilanz auf globale Credits anwenden
      dispatch(addCredits(profit));

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
  const inputCost = selectedRecipe.inputs.reduce((sum, input, idx) => {
    const inputConfig = productionConfig.inputs[idx];
    if (inputConfig && (inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE || inputConfig.source === INPUT_SOURCES.BLACK_MARKET)) {
      return sum + RESOURCES[input.resourceId].basePrice * input.amount;
    }
    return sum;
  }, 0);
  const sellIncome = RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount;
  const isBlackMarketSell = productionConfig?.outputTarget === OUTPUT_TARGETS.BLACK_MARKET;
  const isStoring = productionConfig?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE;
  let balance = 0;
  if (isBlackMarketSell) {
    balance = sellIncome - inputCost;
  } else if (isStoring) {
    balance = -inputCost;
  }
  if (totalBonus > 0) {
    balance = Math.round(balance * (1 + totalBonus));
  }

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
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundImage: {
          xs: 'url(/images/background_dark_mobil.png)',
          md: 'url(/images/background.png)'
        },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{styles}</style>
      <Box sx={{ p: 3, position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Back-Button oben links über dem Titel */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
          sx={{ mb: 2, boxShadow: 'none', border: 'none', color: 'primary.main', fontWeight: 600, fontSize: '1.1rem', pl: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, mb: 0, minWidth: 0 }}>
            <ResourceIcon
              iconUrls={getResourceImageWithFallback(selectedRecipe.output.resourceId, 'icon')}
              alt={RESOURCES[selectedRecipe.output.resourceId]?.name + ' icon'}
              resourceId={selectedRecipe.output.resourceId}
              style={{ width: 40, height: 40, objectFit: 'contain', marginRight: 8 }}
            />
            <Typography
              variant="h1"
              sx={{
                color: '#fff',
                fontWeight: 800,
                letterSpacing: 1,
                minWidth: 0,
                overflow: 'visible',
                textOverflow: 'unset',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                fontSize: { xs: '1.5rem', sm: '2.2rem' },
                lineHeight: 1.2,
                maxWidth: '100%',
                flex: 1
              }}
            >
              {productionLine.name}
            </Typography>
          </Box>
          {/* Edit/Delete-Icons: auf Mobile unter dem Titel, auf Desktop wie gehabt rechts daneben */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            mt: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Tooltip title="Rename">
              <IconButton onClick={handleRenameClick} sx={{ color: '#fff', bgcolor: 'rgba(44,49,54,0.8)', '&:hover': { bgcolor: 'rgba(44,49,54,1)' } }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={handleDeleteClick}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Play/Stop Button oben rechts, dezent und overflow-sicher */}
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
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  boxShadow: 1,
                  ml: 1,
                  mr: { xs: 0, sm: 1 },
                  mt: { xs: 0, sm: 0 },
                  alignSelf: 'flex-start',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                    color: productionStatus?.isActive ? "#b71c1c" : "#111"
                  },
                  ...(productionStatus?.isActive
                    ? {}
                    : { animation: 'pulsePlay 1.2s infinite' }),
                }}
              >
                {productionStatus?.isActive ? <Stop sx={{ fontSize: 32 }} /> : <PlayArrow sx={{ fontSize: 32 }} />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Neues Produktions-Layout */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center', 
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: { xs: 4, md: 2.5 },
          maxWidth: 1100,
          margin: '0 auto',
          mt: { xs: 4, md: 10 },
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Input-Bilder und Umschalter */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 2, md: 4 }, 
            alignItems: 'center',
            width: '100%',
            maxWidth: { xs: '100%', md: 'auto' }
          }}>
            {selectedRecipe.inputs.map((input, idx) => {
              const resource = RESOURCES[input.resourceId];
              const inputConfig = productionConfig.inputs[idx];
              const isGlobalStorage = (inputConfig?.source || INPUT_SOURCES.BLACK_MARKET) === INPUT_SOURCES.GLOBAL_STORAGE;
              const isBlackMarket = (inputConfig?.source || INPUT_SOURCES.BLACK_MARKET) === INPUT_SOURCES.BLACK_MARKET;
              const stock = resources[input.resourceId]?.amount ?? 0;
              const singlePrice = resource.basePrice;
              const totalPrice = singlePrice * input.amount;
              return (
                <React.Fragment key={input.resourceId}>
                  {idx > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', md: 'column' }, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: { xs: '100%', md: 'auto' },
                      height: { xs: 'auto', md: 260 },
                      mx: { xs: 0, md: 1 },
                      mt: { xs: 2, md: 0 },
                    }}>
                      <Typography variant="h3" sx={{ 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: { xs: '2rem', md: '2.5rem' }, 
                        lineHeight: 1,
                        my: { xs: 1, md: 0 }
                      }}>{'+'}</Typography>
                    </Box>
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    minWidth: { xs: '100%', md: 220 },
                    maxWidth: { xs: '100%', md: 220 },
                    justifyContent: 'flex-end',
                    height: { xs: 'auto', md: 260 }
                  }}>
                    <img
                      src={getResourceProductionImage(input.resourceId)}
                      alt={resource?.name + ' production'}
                      style={{
                        maxWidth: '100%',
                        width: '100%',
                        height: 'auto',
                        maxHeight: 160,
                        objectFit: 'contain',
                        display: 'block'
                      }}
                      onError={e => { e.target.onerror = null; e.target.src = '/images/production/Placeholder.png'; }}
                    />
                    {renderResourceIcons(input.resourceId, input.amount)}
                    {isGlobalStorage ? (
                      <>
                        <Chip
                          label={`In stock: ${stock}/${resources[input.resourceId]?.capacity ?? '-'}`}
                          sx={{
                            bgcolor: '#23272b',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.98rem',
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            textAlign: 'center',
                            maxWidth: '100%',
                            mt: 0.5
                          }}
                          size="small"
                        />
                      </>
                    ) : (
                      <Chip
                        label={`${resource.name}: ${singlePrice}$ · Total: ${totalPrice}$`}
                        sx={{
                          mt: 0.5,
                          mb: { xs: 2, md: 0.5 },
                          bgcolor: 'error.main',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.98rem',
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.5,
                          textAlign: 'center',
                          maxWidth: '100%',
                        }}
                        size="small"
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', height: 48, mt: { xs: 2, md: 2.5 }, width: '100%', mb: { xs: 1, md: 0 } }}>
                      <ToggleButtonGroup
                        value={inputConfig?.source || INPUT_SOURCES.BLACK_MARKET}
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
                        sx={{ minHeight: 36, width: '100%', bgcolor: '#23272b', borderRadius: 2, p: 0.5 }}
                      >
                        <MuiTooltip title="From stock" arrow>
                          <ToggleButton 
                            value={INPUT_SOURCES.GLOBAL_STORAGE}
                            sx={{
                              flex: 1,
                              py: { xs: 1.5, md: 0.5 },
                              px: { xs: 2, md: 0.5 },
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: { xs: '1rem', md: '0.92rem' },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1,
                              color: '#fff',
                              bgcolor: (inputConfig?.source || INPUT_SOURCES.BLACK_MARKET) === INPUT_SOURCES.GLOBAL_STORAGE ? '#2c3136' : '#23272b',
                              border: '2px solid',
                              borderColor: (inputConfig?.source || INPUT_SOURCES.BLACK_MARKET) === INPUT_SOURCES.GLOBAL_STORAGE ? '#fff' : '#444',
                              transition: 'all 0.2s',
                              width: { xs: '100%', md: 'auto' },
                              justifyContent: 'center',
                              minHeight: { xs: 40, md: 32 },
                              '&.Mui-selected, &.Mui-selected:hover': {
                                color: '#fff',
                              },
                            }}
                          >
                            <FaWarehouse style={{ fontSize: 20, color: '#fff' }} />
                            <Box sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 700 }}>FROM STOCK</Box>
                          </ToggleButton>
                        </MuiTooltip>
                        {resource.purchasable && (
                          <MuiTooltip title="Get from black market" arrow>
                            <ToggleButton 
                              value={INPUT_SOURCES.BLACK_MARKET}
                              sx={{
                                flex: 1,
                                py: { xs: 1.5, md: 0.5 },
                                px: { xs: 2, md: 0.5 },
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: { xs: '1rem', md: '0.92rem' },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                color: '#fff',
                                bgcolor: (inputConfig?.source || INPUT_SOURCES.BLACK_MARKET) === INPUT_SOURCES.BLACK_MARKET ? '#2c3136' : '#23272b',
                                border: '2px solid',
                                borderColor: (inputConfig?.source || INPUT_SOURCES.BLACK_MARKET) === INPUT_SOURCES.BLACK_MARKET ? '#fff' : '#444',
                                transition: 'all 0.2s',
                                minHeight: { xs: 40, md: 32 },
                                '&.Mui-selected, &.Mui-selected:hover': {
                                  color: '#fff',
                                },
                              }}
                            >
                              <GiPirateSkull style={{ fontSize: 20, color: '#fff' }} />
                              <Box sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 700 }}>BLACK MARKET</Box>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: { xs: 0, md: 2 }, minWidth: { xs: '100%', md: 160 }, maxWidth: { xs: '100%', md: 160 }, minHeight: { xs: 'auto', md: 160 }, justifyContent: 'center', height: { xs: 'auto', md: 260 } }}>
            {/* Kreis mit Prozent und Pings */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
              <CircularProgress
                variant="determinate"
                value={displayProgressPercent}
                size={120}
                thickness={5}
                sx={{ color: canStartProduction() ? 'primary.main' : 'error.main' }}
              />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, fontSize: '2.1rem', mb: 0.2 }}>{Math.round(displayProgressPercent)}%</Typography>
                <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500, fontSize: '1.1rem', lineHeight: 1 }}>{selectedRecipe.productionTime} Pings</Typography>
              </Box>
            </Box>
            {/* Pfeil darunter */}
            <Typography
              variant="h2"
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3rem' },
                lineHeight: 1,
                mt: 2,
                mb: 1,
                textAlign: 'center',
                width: '100%',
                animation: 'pulseFast 1.2s infinite',
              }}
            >
              &#8594;
            </Typography>
            {/* Balance und Debug-Text */}
            {(() => {
              // Einkaufskosten nur für eingekaufte Inputs
              const inputCost = selectedRecipe.inputs.reduce((sum, input, idx) => {
                const inputConfig = productionConfig.inputs[idx];
                if (inputConfig && (inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE || inputConfig.source === INPUT_SOURCES.BLACK_MARKET)) {
                  return sum + RESOURCES[input.resourceId].basePrice * input.amount;
                }
                return sum;
              }, 0);
              const sellIncome = RESOURCES[selectedRecipe.output.resourceId].basePrice * selectedRecipe.output.amount;
              const isBlackMarketSell = productionConfig?.outputTarget === OUTPUT_TARGETS.BLACK_MARKET;
              const isStoring = productionConfig?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE;
              let balance = 0;
              if (isBlackMarketSell) {
                balance = sellIncome - inputCost;
              } else if (isStoring) {
                balance = -inputCost;
              }
              const color = balance >= 0 ? 'success.main' : 'error.main';
              const sign = balance > 0 ? '+' : '';
              return (
                <>
                  <Typography
                    variant="h3"
                    sx={{
                      color,
                      fontWeight: 800,
                      fontSize: { xs: '1.8rem', md: '2.2rem' },
                      mt: 1,
                      mb: 0.5,
                      textAlign: 'center',
                      width: '100%',
                      animation: 'pulseFast 1.2s infinite',
                    }}
                  >
                    {sign}{balance} $
                  </Typography>
                  {/* Debug-Ausgabe */}
                  <Box sx={{ color: '#888', fontSize: '0.95rem', textAlign: 'center', width: '100%' }}>
                    <div>[Debug]</div>
                    {selectedRecipe.inputs.map((input, idx) => {
                      const inputConfig = productionConfig.inputs[idx];
                      const cost = (inputConfig && (inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE || inputConfig.source === INPUT_SOURCES.BLACK_MARKET))
                        ? -RESOURCES[input.resourceId].basePrice * input.amount
                        : 0;
                      return (
                        <div key={input.resourceId}>
                          inputCost {RESOURCES[input.resourceId].name}: {cost}
                        </div>
                      );
                    })}
                    <div>inputCost sum: {inputCost}</div>
                    <div>sellIncome: {sellIncome}</div>
                    <div>balance: {balance}</div>
                  </Box>
                </>
              );
            })()}
          </Box>

          {/* Output-Bild und Umschalter */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            minWidth: { xs: '100%', md: 220 },
            maxWidth: { xs: '100%', md: 220 },
            justifyContent: 'flex-end',
            height: { xs: 'auto', md: 260 },
            mt: { xs: 2, md: 8 }
          }}>
            <img
              src={getResourceProductionImage(selectedRecipe.output.resourceId)}
              alt={RESOURCES[selectedRecipe.output.resourceId]?.name + ' production'}
              style={{
                maxWidth: '100%',
                width: '100%',
                height: 'auto',
                maxHeight: 160,
                objectFit: 'contain',
                display: 'block'
              }}
              onError={e => { e.target.onerror = null; e.target.src = '/images/production/Placeholder.png'; }}
            />
            {renderResourceIcons(selectedRecipe.output.resourceId, selectedRecipe.output.amount)}
            {productionConfig.outputTarget === OUTPUT_TARGETS.BLACK_MARKET && (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 0, mt: 0, p: 0 }}>
                <Chip
                  label={`${RESOURCES[selectedRecipe.output.resourceId]?.name}: ${RESOURCES[selectedRecipe.output.resourceId]?.basePrice}$ · Total: ${RESOURCES[selectedRecipe.output.resourceId]?.basePrice * selectedRecipe.output.amount}$`}
                  sx={{
                    bgcolor: 'success.main',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    textAlign: 'center',
                    maxWidth: '100%',
                    mb: 0,
                    mt: 0,
                  }}
                  size="small"
                />
              </Box>
            )}

            {/* Output handling for research points: only store, no sell */}
            {selectedRecipe.output.resourceId === 'research_points' ? (
              <Box sx={{
                mt: 0,
                mb: 1,
                px: 2,
                py: 2,
                bgcolor: '#23272b',
                color: '#fff',
                borderRadius: 2,
                boxShadow: 1,
                border: '1px solid',
                borderColor: '#444',
                width: '100%',
                maxWidth: { xs: '100%', md: 180 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, letterSpacing: 0.2, color: '#fff' }}>
                  Output handling:
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  width: '100%',
                  justifyContent: 'center',
                  mb: 1
                }}>
                  <Storage sx={{ fontSize: 24, mr: 1 }} />
                  Store in stock
                  {!isMobile && (
                    <MuiTooltip 
                      title={
                        <span style={{ color: '#fff' }}>
                          Research points cannot be sold. They are automatically stored and used for unlocking technologies.
                        </span>
                      } 
                      arrow
                    >
                      <InfoOutlined 
                        sx={{ 
                          fontSize: 20, 
                          ml: 1, 
                          color: 'primary.main', 
                          cursor: 'pointer',
                          bgcolor: '#23272b',
                          borderRadius: '50%',
                          p: 0.5
                        }} 
                      />
                    </MuiTooltip>
                  )}
                </Box>
                {isMobile && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, 
                      textAlign: 'center', 
                      bgcolor: '#23272b', 
                      color: '#fff', 
                      p: 1.5, 
                      borderRadius: 2, 
                      fontWeight: 500
                    }}
                  >
                    Research points cannot be sold. They are automatically stored and used for unlocking technologies.
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{
                mt: 0,
                mb: 1,
                px: 2,
                py: 2,
                bgcolor: '#23272b',
                borderRadius: 2,
                boxShadow: 1,
                border: '1px solid',
                borderColor: '#444',
                width: '100%',
                maxWidth: { xs: '100%', md: 180 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#fff',
              }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, letterSpacing: 0.2 }}>
                  <span style={{ color: '#fff' }}>Output handling:</span>
                </Typography>
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
                  sx={{ minHeight: 48, width: '100%', bgcolor: '#23272b', borderRadius: 2, p: 0.5, boxShadow: 1, border: '2px solid #fff' }}
                >
                  <MuiTooltip title="Store the produced resources in your stock." arrow>
                    <ToggleButton
                      value={OUTPUT_TARGETS.GLOBAL_STORAGE}
                      sx={{
                        flex: 1,
                        py: { xs: 1.5, md: 0.5 },
                        px: { xs: 2, md: 0.5 },
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '0.92rem' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        color: '#fff',
                        bgcolor: (productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.GLOBAL_STORAGE ? '#2c3136' : '#23272b',
                        border: '2px solid',
                        borderColor: (productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.GLOBAL_STORAGE ? '#fff' : '#444',
                        transition: 'all 0.2s',
                        '&.Mui-selected, &.Mui-selected:hover': {
                          color: '#fff',
                        },
                      }}
                    >
                      <FaWarehouse style={{ fontSize: 24, color: '#fff' }} />
                      <Box sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 700 }}>FROM STOCK</Box>
                    </ToggleButton>
                  </MuiTooltip>
                  <MuiTooltip title="Sell the produced resources to the black market for credits." arrow>
                    <ToggleButton
                      value={OUTPUT_TARGETS.BLACK_MARKET}
                      sx={{
                        flex: 1,
                        py: { xs: 1.5, md: 0.5 },
                        px: { xs: 2, md: 0.5 },
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '0.92rem' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        color: '#fff',
                        bgcolor: (productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.BLACK_MARKET ? '#2c3136' : '#23272b',
                        border: '2px solid',
                        borderColor: (productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.BLACK_MARKET ? '#fff' : '#444',
                        transition: 'all 0.2s',
                        '&.Mui-selected, &.Mui-selected:hover': {
                          color: '#fff',
                        },
                      }}
                    >
                      <GiPirateSkull style={{ fontSize: 24, color: '#fff' }} />
                      <Box sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 700 }}>BLACK MARKET</Box>
                    </ToggleButton>
                  </MuiTooltip>
                </ToggleButtonGroup>
                {/* Show stock info if 'Store in stock' is selected */}
                {(productionConfig.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE) === OUTPUT_TARGETS.GLOBAL_STORAGE && (
                  <Box sx={{ mt: 1, width: '100%', textAlign: 'center' }}>
                    <Chip
                      label={`In stock: ${resources[selectedRecipe.output.resourceId]?.amount ?? 0}/${resources[selectedRecipe.output.resourceId]?.capacity ?? '-'}`}
                      sx={{
                        bgcolor: '#23272b',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        textAlign: 'center',
                        maxWidth: '100%',
                        mt: 0.5
                      }}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
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
      <Box sx={{ mt: 4, p: 3, bgcolor: '#23272b', borderRadius: 2, width: '80%', mx: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Production Statistics</Typography>
        <Grid container spacing={3}>
          {/* Profit Chart */}
          <Grid item xs={12} sx={{ minWidth: 0, flex: 1 }}>
            <Paper sx={{ p: 2, bgcolor: '#23272b', color: '#fff', width: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#fff' }}>Cumulative Win/Loss since production line start</Typography>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="time" minTickGap={30} stroke="#bbb" tick={{ fill: '#fff' }} />
                  <YAxis stroke="#bbb" tick={{ fill: '#fff' }} />
                  <RechartsTooltip contentStyle={{ background: '#23272b', color: '#fff', border: '1px solid #444' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
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