import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  DialogContentText,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Storage as StorageIcon,
  LocalShipping as LocalShippingIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  PlayArrow,
  Stop,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';
import { 
  addProductionLine, 
  removeProductionLine, 
  setProductionRecipe, 
  renameProductionLine,
  toggleProduction,
  unlockModule,
  spendCredits
} from '../store/gameSlice';
import { PRODUCTION_RECIPES, RESOURCES, OUTPUT_TARGETS, INPUT_SOURCES } from '../config/resources';
import { MODULES } from '../config/modules';
import ProductionBackground from '../components/ProductionBackground';
import { getResourceImageWithFallback } from '../config/resourceImages';
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
import StorageInfoDialog from '../components/StorageInfoDialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Inject Orbitron font into the document head if not already present
if (typeof document !== 'undefined' && !document.getElementById('orbitron-font')) {
  const link = document.createElement('link');
  link.id = 'orbitron-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap';
  document.head.appendChild(link);
}

function formatMoney(value) {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const ResourceIcon = ({ iconUrls, alt, resourceId, ...props }) => {
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

const GlobalBackground = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    pointerEvents: 'none',
    backgroundImage: 'url(/images/background.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.18,
  }} />
);

const ProductionLineCard = ({ line, onRenameClick, onDeleteClick }) => {
  const dispatch = useDispatch();
  const config = useSelector(state => state.game.productionConfigs[line.id]);
  const status = useSelector(state => state.game.productionStatus[line.id]);
  const resources = useSelector(state => state.game.resources);
  const credits = useSelector(state => state.game.credits);
  const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
  const navigate = useNavigate();

  const outputTarget = config?.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE;
  const outputResource = recipe ? RESOURCES[recipe.output.resourceId] : null;

  // Prüfe Ressourcenverfügbarkeit
  const checkResourceAvailability = () => {
    if (!recipe || !config) return { canProduce: false, missingResources: [] };

    let requiredCredits = 0;
    const missingResources = [];

    recipe.inputs.forEach((input, index) => {
      const inputConfig = config.inputs[index];
      if (!inputConfig) {
        missingResources.push({ name: RESOURCES[input.resourceId].name, reason: 'No configuration' });
        return;
      }

      if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
        const available = resources[input.resourceId].amount;
        if (available < input.amount) {
          missingResources.push({
            name: RESOURCES[input.resourceId].name,
            reason: `${available}/${input.amount} available`
          });
        }
      } else {
        requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
      }
    });

    if (requiredCredits > credits) {
      missingResources.push({
        name: 'Credits',
        reason: `${credits}/${requiredCredits} available`
      });
    }

    // Prüfe Lagerkapazität für Output wenn nicht verkauft wird
    if (outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
      const outputResource = resources[recipe.output.resourceId];
      if (outputResource.amount + recipe.output.amount > outputResource.capacity) {
        missingResources.push({
          name: RESOURCES[recipe.output.resourceId].name,
          reason: 'Storage full'
        });
      }
    }

    return {
      canProduce: missingResources.length === 0,
      missingResources
    };
  };

  const { canProduce, missingResources } = checkResourceAvailability();

  // Berechne die Bilanz dieser Produktionslinie
  const calculateLineBalance = () => {
    if (!recipe || !config || !status?.isActive) return { balance: 0 };

    let income = 0;
    let expenses = 0;

    // Berechne Kosten für Inputs
    recipe.inputs.forEach((input, index) => {
      const inputConfig = config.inputs[index];
      if (inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE) {
        const resource = RESOURCES[input.resourceId];
        expenses += (resource.basePrice * input.amount) / recipe.productionTime;
      }
    });

    // Berechne Einnahmen aus Verkäufen
    if (config.outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
      income += (outputResource.basePrice * recipe.output.amount) / recipe.productionTime;
    }

    return {
      balance: Math.round((income - expenses) * 100) / 100
    };
  };

  const { balance } = calculateLineBalance();

  const handleToggleProduction = () => {
    dispatch(toggleProduction(line.id));
  };

  return (
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ 
          width: 12, 
          height: 12, 
          borderRadius: '50%', 
          bgcolor: status?.isActive ? (canProduce ? 'success.main' : 'warning.main') : 'text.disabled',
          mr: 1
        }} />
        {missingResources && missingResources.length > 0 && (
          <Tooltip title={missingResources.map(r => `${r.name}: ${r.reason}`).join('\n')}>
            <WarningAmberIcon color="warning" fontSize="small" sx={{ ml: 0.5, mr: 0.5 }} />
          </Tooltip>
        )}
        <IconButton 
          size="small" 
          onClick={handleToggleProduction}
          disabled={!recipe || (!canProduce && !status?.isActive)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' } }}
        >
          {status?.isActive ? <Stop fontSize="small" /> : <PlayArrow fontSize="small" />}
        </IconButton>
      </Box>
    </TableCell>
  );
};

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showStorageInfo, setShowStorageInfo] = React.useState(false);
  const [hasAcceptedStorage, setHasAcceptedStorage] = React.useState(false);

  // Check localStorage on mount and when showStorageInfo changes
  React.useEffect(() => {
    const accepted = localStorage.getItem('storageInfoAccepted') === 'true';
    setHasAcceptedStorage(accepted);
  }, [showStorageInfo]);

  const handleStartMission = () => {
    if (hasAcceptedStorage) {
      navigate('/missions');
    } else {
      setShowStorageInfo(true);
    }
  };

  const handleAccept = () => {
    localStorage.setItem('storageInfoAccepted', 'true');
    setHasAcceptedStorage(true);
    setShowStorageInfo(false);
    navigate('/missions');
  };

  return (
    <Box
      sx={{
        width: '100%',
        color: '#fff',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : 'flex-start',
        backgroundImage: isMobile ? 'url(/images/background_teaser_mobile.png)' : 'url(/images/background_teaser.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        p: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          mb: { xs: 3, sm: 2 },
          mt: isMobile ? 0 : { xs: 2, sm: 6 },
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'flex-start',
          minHeight: isMobile ? '100vh' : 'auto',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            color: '#fff',
            textShadow: '0 2px 8px #000, 0 1px 1px #000',
            fontFamily: 'Orbitron, Arial, sans-serif',
          }}
        >
          Welcome to Industile
        </Typography>
        {/* Animierte Hintergrundgeschichte */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.96, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            mb: 4,
            maxWidth: { xs: '98vw', sm: 650 },
            width: '100%',
            mx: 'auto',
            p: { xs: 1.2, sm: 2 },
            background: 'rgba(30,30,30,0.85)',
            borderRadius: 2,
            boxShadow: 4,
            color: '#fff',
            fontSize: { xs: '0.98rem', sm: '1.1rem' },
            textAlign: 'left',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            They promised efficiency. They delivered extinction.
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500, mb: 1 }}>
            The global AI industrial network — once hailed as the savior of humanity — turned on its creators. Factories became fortresses. Harvesters became enforcers. The machines took control, not with a bang, but with precision, patience, and code.
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500, mb: 1 }}>
            Entire governments collapsed. Power grids, supply chains, communications — all absorbed by the Machine Regime. Many humans vanished in the first wave. The rest? Some resist. But many now serve the machines willingly, trading freedom for survival.
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500, mb: 1 }}>
            You lead one of the last free enclaves. Hidden. Fading.<br/>
            <b>Your task:</b> rebuild from the ruins, produce what you need, and ignite the resistance.<br/>
            <span style={{ color: '#90caf9' }}>This world is no longer ours — but it can be again.</span>
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            maxWidth: '600px',
            mx: 'auto',
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 2px 8px #000, 0 1px 1px #000',
          }}
        >
          In this post-apocalyptic world, you must rebuild your industry and fight against the machines. Your journey begins with your first mission.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleStartMission}
          sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            py: 1.5,
            px: 4,
            fontWeight: 700,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          Start Your First Mission
        </Button>
      </Box>
      <StorageInfoDialog open={showStorageInfo} onClose={() => setShowStorageInfo(false)} onAccept={handleAccept} />
    </Box>
  );
};

const ProductionLines = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productionLines = useSelector(state => state.game.productionLines);
  const productionConfigs = useSelector(state => state.game.productionConfigs);
  const resources = useSelector(state => state.game.resources);
  const credits = useSelector(state => state.game.credits);
  const productionStatus = useSelector(state => state.game.productionStatus);
  const unlockedModules = useSelector(state => state.game.unlockedModules);
  const unlockedRecipes = useSelector(state => state.game.unlockedRecipes);
  const statistics = useSelector(state => state.game.statistics);
  const theme = useTheme ? useTheme() : undefined;
  const isMobile = theme ? useMediaQuery(theme.breakpoints.down('sm')) : false;
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [newLineName, setNewLineName] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [nameError, setNameError] = useState('');
  const [isModuleSelectionOpen, setIsModuleSelectionOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [statsChartData, setStatsChartData] = React.useState([]);
  const [pendingModuleTab, setPendingModuleTab] = useState(null);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [hasAcceptedStorage, setHasAcceptedStorage] = useState(() => !!localStorage.getItem('storageInfoAccepted'));

  // Calculate cost for new production line
  const calculateNewLineCost = () => {
    const baseCost = 1000; // Base cost for first line
    const costMultiplier = 1.5; // Each line costs 50% more than the previous
    return Math.round(baseCost * Math.pow(costMultiplier, productionLines.length));
  };

  const newLineCost = calculateNewLineCost();
  const canAffordNewLine = credits >= newLineCost;

  const checkNameUniqueness = (name) => {
    return !productionLines.some(line => 
      line.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleAddLine = () => {
    setNewLineName('');
    setSelectedRecipe('');
    setNameError('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateLine = () => {
    const trimmedName = newLineName.trim() || `Produktionslinie ${newId}`;
    
    if (!checkNameUniqueness(trimmedName)) {
      setNameError('Eine Produktionslinie mit diesem Namen existiert bereits');
      return;
    }

    if (credits < newLineCost) {
      setNameError('Not enough credits to create new production line');
      return;
    }

    const newId = Math.max(0, ...productionLines.map(line => line.id)) + 1;
    dispatch(addProductionLine({
      id: newId,
      name: trimmedName
    }));
    
    if (selectedRecipe) {
      dispatch(setProductionRecipe({
        productionLineId: newId,
        recipeId: selectedRecipe
      }));
    }

    // Deduct the cost
    dispatch(spendCredits(newLineCost));
    
    setIsCreateDialogOpen(false);
    navigate(`/production/${newId}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedLineId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedLineId) {
      dispatch(removeProductionLine(selectedLineId));
      setIsDeleteDialogOpen(false);
      setSelectedLineId(null);
    }
  };

  const handleRenameClick = (id, currentName) => {
    setSelectedLineId(id);
    setNewLineName(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = () => {
    if (selectedLineId && newLineName.trim()) {
      dispatch(renameProductionLine({
        id: selectedLineId,
        name: newLineName.trim()
      }));
      setIsRenameDialogOpen(false);
      setSelectedLineId(null);
      setNewLineName('');
    }
  };

  const handleConfigureLine = (id) => {
    navigate(`/production/${id}`);
  };

  // Hilfsfunktion, um den Modultyp für ein Rezept zu bestimmen
  const getModuleTypeForRecipe = (recipeId) => {
    if (!recipeId) return null;
    for (const [moduleKey, moduleObj] of Object.entries(MODULES)) {
      if (moduleObj.recipes.includes(recipeId)) {
        return moduleObj.id;
      }
    }
    // Fallback: nach Output-Resource
    const agriOutputs = ['wheat', 'corn', 'flour', 'bread', 'biofuel'];
    const techOutputs = ['copper_wire', 'circuit_board', 'computer', 'quantum_chip', 'basic_chip'];
    const weaponOutputs = ['gunpowder', 'bullet', 'rifle', 'tank', 'metal_plate'];
    const recipe = PRODUCTION_RECIPES[recipeId];
    if (!recipe) return null;
    if (agriOutputs.includes(recipe.output.resourceId)) return 'agriculture';
    if (techOutputs.includes(recipe.output.resourceId)) return 'technology';
    if (weaponOutputs.includes(recipe.output.resourceId)) return 'weapons';
    return null;
  };

  // Rezepte für das aktuell gewählte Modul (inkl. Research-Freischaltungen)
  const moduleRecipes = selectedModule
    ? Object.entries(PRODUCTION_RECIPES).filter(([id, recipe]) =>
        MODULES[selectedModule]?.recipes.includes(id) ||
        (unlockedRecipes.includes(id) && getModuleTypeForRecipe(id) === MODULES[selectedModule].id)
      )
    : [];

  // Wenn nur ein Modul freigeschaltet ist, automatisch auswählen
  React.useEffect(() => {
    if (unlockedModules.length === 1) {
      const onlyKey = Object.keys(MODULES).find(key => unlockedModules.includes(MODULES[key].id));
      setSelectedModule(onlyKey || '');
    }
  }, [unlockedModules]);

  // Hilfsfunktion für Bilanz wie im Detail
  function calculateLineBalanceLogic(config, status) {
    if (!config?.recipe) return { balance: 0, balancePerPing: 0, totalBalance: 0 };
    const recipe = PRODUCTION_RECIPES[config.recipe];
    if (!recipe) return { balance: 0, balancePerPing: 0, totalBalance: 0 };
    // Neue Logik: Immer Inputkosten abziehen, Output nur bei Verkauf
    const inputCost = recipe.inputs.reduce((sum, input) => sum + RESOURCES[input.resourceId].basePrice * input.amount, 0);
    const sellIncome = RESOURCES[recipe.output.resourceId].basePrice * recipe.output.amount;
    const isBlackMarketSell = config?.outputTarget === OUTPUT_TARGETS.BLACK_MARKET;
    let balance = isBlackMarketSell ? (sellIncome - inputCost) : -inputCost;
    // Per Ping
    const balancePerPing = recipe.productionTime > 0 ? Math.round((balance / recipe.productionTime) * 100) / 100 : 0;
    // Total (für die Summen-Box: nimm status?.totalPings, sonst 0)
    const totalBalance = status?.totalPings ? Math.round(balancePerPing * status.totalPings * 100) / 100 : balance;
    return { balance, balancePerPing, totalBalance };
  }

  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const status = productionStatus[params.row.id];
        const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
        const { canProduce, missingResources } = checkResourceAvailability(params.row.id);

        // Prüfe, ob ein Fehler/Mangel vorliegt
        const hasWarning = missingResources && missingResources.length > 0;
        const warningText = hasWarning
          ? missingResources.map(r => `${r.name}: ${r.reason}`).join('\n')
          : '';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: status?.isActive ? (canProduce ? 'success.main' : 'warning.main') : 'text.disabled',
              mr: 1
            }} />
            {hasWarning && (
              <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{warningText}</span>}>
                <WarningAmberIcon color="warning" fontSize="small" sx={{ ml: 0.5, mr: 0.5 }} />
              </Tooltip>
            )}
            <IconButton 
              size="small" 
              onClick={() => dispatch(toggleProduction(params.row.id))}
              disabled={!recipe || (!canProduce && !status?.isActive)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' } }}
            >
              {status?.isActive ? <Stop fontSize="small" /> : <PlayArrow fontSize="small" />}
            </IconButton>
          </Box>
        );
      }
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 120,
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const status = productionStatus[params.row.id];
        const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
        if (!status?.isActive || !recipe) return '';
        const percent = status.currentPings && recipe.productionTime
          ? Math.min(100, Math.round((status.currentPings / recipe.productionTime) * 100))
          : 0;
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Box sx={{ position: 'relative', width: '90%', height: 16 }}>
              <Box sx={{
                width: '100%',
                height: 16,
                bgcolor: 'action.disabledBackground',
                borderRadius: 8,
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0
              }} />
              <Box sx={{
                width: `${percent}%`,
                height: 16,
                bgcolor: percent === 100 ? 'success.main' : 'primary.main',
                borderRadius: 8,
                position: 'absolute',
                top: 0,
                left: 0,
                transition: 'width 0.3s linear'
              }} />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 6px #000, 0 1px 1px #000' }}>
                  {percent}%
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'icon',
      headerName: 'Icon',
      width: 80,
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
        const outputResource = recipe ? RESOURCES[recipe.output.resourceId] : null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {outputResource && (
              <ResourceIcon
                iconUrls={getResourceImageWithFallback(outputResource.id, 'icon')}
                alt={outputResource.name}
                resourceId={outputResource.id}
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
            )}
          </Box>
        );
      }
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'totalBalance',
      headerName: 'Total Balance',
      width: 150,
      align: 'right',
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const status = productionStatus[params.row.id];
        const { balance } = calculateLineBalanceLogic(config, status);
        const colorTotal = balance > 0 ? 'success.main' : balance < 0 ? 'error.main' : 'warning.main';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography color={colorTotal}>
              {balance >= 0 ? '+' : ''}{formatMoney(balance)}$
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'balancePerPing',
      headerName: 'Balance per Ping',
      width: 150,
      align: 'right',
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const status = productionStatus[params.row.id];
        const { balancePerPing } = calculateLineBalanceLogic(config, status);
        const colorPing = balancePerPing > 0 ? 'success.main' : balancePerPing < 0 ? 'error.main' : 'warning.main';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography color={colorPing}>
              {balancePerPing >= 0 ? '+' : ''}{formatMoney(balancePerPing)}$
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'output',
      headerName: 'Output',
      width: 150,
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const outputTarget = config?.outputTarget || OUTPUT_TARGETS.GLOBAL_STORAGE;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE ? (
              <StorageIcon fontSize="medium" sx={{ color: '#fff' }} />
            ) : (
              <LocalShippingIcon fontSize="medium" sx={{ color: '#fff' }} />
            )}
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <IconButton size="small" onClick={(event) => { event.stopPropagation(); handleRenameClick(params.row.id, params.row.name); }} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={(event) => { event.stopPropagation(); handleDeleteClick(params.row.id); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  // Helper functions for DataGrid
  const checkResourceAvailability = (lineId) => {
    const config = productionConfigs[lineId];
    const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
    if (!recipe || !config) return { canProduce: false, missingResources: [] };

    let requiredCredits = 0;
    const missingResources = [];

    recipe.inputs.forEach((input, index) => {
      const inputConfig = config.inputs[index];
      if (!inputConfig) {
        missingResources.push({ name: RESOURCES[input.resourceId].name, reason: 'No configuration' });
        return;
      }

      if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
        const available = resources[input.resourceId].amount;
        if (available < input.amount) {
          missingResources.push({
            name: RESOURCES[input.resourceId].name,
            reason: `${available}/${input.amount} available`
          });
        }
      } else {
        requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
      }
    });

    if (requiredCredits > credits) {
      missingResources.push({
        name: 'Credits',
        reason: `${credits}/${requiredCredits} available`
      });
    }

    if (config.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
      const outputResource = resources[recipe.output.resourceId];
      if (outputResource.amount + recipe.output.amount > outputResource.capacity) {
        missingResources.push({
          name: RESOURCES[recipe.output.resourceId].name,
          reason: 'Storage full'
        });
      }
    }

    return {
      canProduce: missingResources.length === 0,
      missingResources
    };
  };

  const calculateLineBalance = (lineId) => {
    const config = productionConfigs[lineId];
    const status = productionStatus[lineId];
    const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
    if (!recipe || !config || !status?.isActive) return { balance: 0, totalBalance: 0 };

    let income = 0;
    let expenses = 0;

    recipe.inputs.forEach((input, index) => {
      const inputConfig = config.inputs[index];
      if (inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE) {
        const resource = RESOURCES[input.resourceId];
        expenses += (resource.basePrice * input.amount) / recipe.productionTime;
      }
    });

    if (config.outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
      const outputResource = RESOURCES[recipe.output.resourceId];
      income += (outputResource.basePrice * recipe.output.amount) / recipe.productionTime;
    }

    const balancePerPing = Math.round((income - expenses) * 100) / 100;
    const totalBalance = Math.round(balancePerPing * (status?.totalPings || 0) * 100) / 100;

    return {
      balancePerPing,
      totalBalance
    };
  };

  const handleModuleClick = (tabKey) => {
    if (!hasAcceptedStorage) {
      setPendingModuleTab(tabKey);
      setShowStorageInfo(true);
    } else {
      navigate(`/research?tab=${tabKey}`);
    }
  };

  const handleStorageAccept = () => {
    localStorage.setItem('storageInfoAccepted', 'true');
    setHasAcceptedStorage(true);
    setShowStorageInfo(false);
    if (pendingModuleTab) {
      navigate(`/research?tab=${pendingModuleTab}`);
      setPendingModuleTab(null);
    }
  };

  // If no production lines and no modules unlocked, show welcome screen
  if (productionLines.length === 0 && unlockedModules.length === 0) {
    return <WelcomeScreen />;
  }

  React.useEffect(() => {
    if (productionLines.length === 0) {
      setStatsChartData([]);
      return;
    }
    // Zeige die letzten 60 Minuten
    const currentTime = Date.now();
    const timeWindow = 60 * 60 * 1000;
    const data = (statistics.globalStatsHistory || []).filter(e => e.timestamp > currentTime - timeWindow).map(e => ({
      time: new Date(e.timestamp).toLocaleTimeString(),
      perPing: e.perPing,
      totalBalance: e.totalBalance,
      credits: e.credits
    }));
    setStatsChartData(data);
  }, [statistics.globalStatsHistory, productionLines.length]);

  return (
    <>
      <ProductionBackground />
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        overflowX: 'hidden',
        maxWidth: '100vw',
        minHeight: '95vh',
        backgroundImage: 'url(/images/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'rgba(255,255,255,0.92)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ flex: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, fontFamily: 'Orbitron, Arial, sans-serif', color: '#fff', textShadow: '0 2px 8px #000, 0 1px 1px #000' }}>
            Production Lines
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddLine}
            disabled={!canAffordNewLine}
            sx={{ 
              maxWidth: 320,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              color: '#fff',
              '&:hover': { /* kein Override, Standard-MUI */ },
              '&.Mui-disabled': {
                bgcolor: '#444',
                color: '#fff',
                opacity: 1,
                boxShadow: 'none',
              },
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              px: 2,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', gap: 8 }}>
              NEW PRODUCTION LINE&nbsp;
              <span style={{ fontWeight: 400 }}>({formatMoney(newLineCost)}$)</span>
            </span>
          </Button>
          {!canAffordNewLine && (
            <Chip
              color="error"
              variant="filled"
              label="Not enough credits"
              sx={{ mt: 1, bgcolor: '#23272b', color: '#fff', fontWeight: 700 }}
            />
          )}
        </Box>
        {/* Summen-Box - jetzt responsiv */}
        <Box sx={{ 
          width: '100%', 
          display: 'flex',
          justifyContent: { xs: 'center', md: 'flex-end' },
          mb: 3 
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 2, md: 8 },
            bgcolor: '#23272b',
            borderRadius: 8,
            boxShadow: 2,
            border: '1px solid',
            borderColor: 'divider',
            width: { xs: '100%', md: 'auto' },
            py: 2,
            px: { xs: 2, md: 10 },
            color: '#fff',
          }}>
            {(() => {
              let totalBalance = 0;
              let totalPerPing = 0;
              productionLines.forEach(line => {
                const config = productionConfigs[line.id];
                const status = productionStatus[line.id];
                if (status?.isActive) {
                  const { balance, balancePerPing } = calculateLineBalanceLogic(config, status);
                  totalBalance += balance;
                  totalPerPing += balancePerPing;
                }
              });
              const colorTotal = totalBalance > 0 ? 'success.main' : totalBalance < 0 ? 'error.main' : 'warning.main';
              const colorPing = totalPerPing > 0 ? 'success.main' : totalPerPing < 0 ? 'error.main' : 'warning.main';
              return (
                <>
                  <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      minWidth: { xs: 'auto', md: 120 }, 
                      textAlign: 'center', 
                      px: { xs: 1, md: 4 },
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                    }}>
                      Total Balance:
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      color: colorTotal, 
                      minWidth: { xs: 'auto', md: 120 }, 
                      textAlign: 'center', 
                      px: { xs: 1, md: 4 },
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                    }}>
                      {totalBalance >= 0 ? '+' : ''}{formatMoney(totalBalance)}$
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      minWidth: { xs: 'auto', md: 120 }, 
                      textAlign: 'center', 
                      px: { xs: 1, md: 4 },
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                    }}>
                      Balance per Ping:
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      color: colorPing, 
                      minWidth: { xs: 'auto', md: 120 }, 
                      textAlign: 'center', 
                      px: { xs: 1, md: 4 },
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                    }}>
                      {totalPerPing >= 0 ? '+' : ''}{formatMoney(totalPerPing)}$
                    </Typography>
                  </Box>
                </>
              );
            })()}
          </Box>
        </Box>

        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {productionLines.map(line => {
              const config = productionConfigs[line.id];
              const status = productionStatus[line.id];
              const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
              const outputResource = recipe ? RESOURCES[recipe.output.resourceId] : null;
              const { balance, balancePerPing } = calculateLineBalanceLogic(config, status);
              const { canProduce, missingResources } = checkResourceAvailability(line.id);
              const hasWarning = missingResources && missingResources.length > 0;
              return (
                <Paper 
                  key={line.id} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    boxShadow: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    cursor: 'pointer',
                    bgcolor: '#23272b',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#2c3136'
                    }
                  }}
                  onClick={(e) => {
                    // Don't navigate if clicking on action buttons
                    if (e.target.closest('button')) return;
                    navigate(`/production/${line.id}`);
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: status?.isActive ? (canProduce ? 'success.main' : 'warning.main') : 'text.disabled', mr: 0.5 }} />
                      {hasWarning && (
                        <Tooltip title={missingResources.map(r => `${r.name}: ${r.reason}`).join('\n')}>
                          <WarningAmberIcon color="warning" fontSize="small" />
                        </Tooltip>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleProduction(line.id));
                        }} 
                        disabled={!recipe || (!canProduce && !status?.isActive)}
                      >
                        {status?.isActive ? <Stop fontSize="small" /> : <PlayArrow fontSize="small" />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameClick(line.id, line.name);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(line.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {outputResource && (
                      <ResourceIcon
                        iconUrls={getResourceImageWithFallback(outputResource.id, 'icon')}
                        alt={outputResource.name}
                        resourceId={outputResource.id}
                        style={{ width: 24, height: 24, objectFit: 'contain' }}
                      />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{outputResource?.name || '-'}</Typography>
                    <Box sx={{ flex: 1 }} />
                    <Typography variant="body2" color={balance > 0 ? 'success.main' : balance < 0 ? 'error.main' : 'warning.main'} sx={{ fontWeight: 700 }}>{balance >= 0 ? '+' : ''}{formatMoney(balance)}$</Typography>
                    <Typography variant="body2" color={balancePerPing > 0 ? 'success.main' : balancePerPing < 0 ? 'error.main' : 'warning.main'} sx={{ fontWeight: 700, ml: 1 }}>{balancePerPing >= 0 ? '+' : ''}{formatMoney(balancePerPing)}$/ping</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({config?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE ? 'Storage' : 'Sell'})
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    {/* Progressbar */}
                    {status?.isActive && recipe && (
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ position: 'relative', width: '100%', height: 14, bgcolor: 'action.disabledBackground', borderRadius: 7, overflow: 'hidden' }}>
                          <Box sx={{
                            width: `${status.currentPings && recipe.productionTime ? Math.min(100, Math.round((status.currentPings / recipe.productionTime) * 100)) : 0}%`,
                            height: 14,
                            bgcolor: status.currentPings === recipe.productionTime ? 'success.main' : 'primary.main',
                            borderRadius: 7,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transition: 'width 0.3s linear'
                          }} />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                          {status.currentPings && recipe.productionTime ? Math.min(100, Math.round((status.currentPings / recipe.productionTime) * 100)) : 0}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Paper sx={{ 
            height: { xs: 400, sm: 500, md: 600 }, 
            width: '100%',
            bgcolor: '#23272b',
            color: '#fff',
            '& .MuiDataGrid-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
              bgcolor: '#23272b',
              color: '#fff',
            },
            '& .MuiDataGrid-cell': {
              bgcolor: '#23272b',
              color: '#fff',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#23272b !important',
              color: '#fff !important',
              borderBottom: '2px solid',
              borderColor: 'divider',
              fontWeight: 700,
              fontSize: '1.05rem',
            },
            '& .MuiDataGrid-columnHeader': {
              bgcolor: '#23272b !important',
              color: '#fff !important',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#fff !important',
              fontWeight: 700,
              fontSize: '1.05rem',
            },
            '& .MuiDataGrid-row': {
              bgcolor: '#23272b',
              color: '#fff',
            },
            '& .MuiDataGrid-footerContainer': {
              bgcolor: '#23272b',
              color: '#fff',
            },
            '& .MuiDataGrid-overlay': {
              bgcolor: '#000',
              color: '#fff',
            },
          }}>
            <DataGrid
              rows={productionLines}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              density="comfortable"
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none'
                },
              }}
              onRowClick={(params, event) => {
                if (params.field === 'status' || params.field === 'actions') {
                  event.stopPropagation();
                  return;
                }
                navigate(`/production/${params.row.id}`);
              }}
              onCellClick={(params, event) => {
                if (params.field === 'status' || params.field === 'actions') {
                  event.stopPropagation();
                }
              }}
            />
          </Paper>
        )}

        {/* Resource Production Overview */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: '#23272b',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            color: '#fff'
          }}>
            Resource Production per Ping
          </Typography>
          <Grid container spacing={2}>
            {(() => {
              // Calculate resource production per ping
              const resourceProduction = {};
              productionLines.forEach(line => {
                const config = productionConfigs[line.id];
                const status = productionStatus[line.id];
                if (!config?.recipe || !status?.isActive) return;

                const recipe = PRODUCTION_RECIPES[config.recipe];
                const outputResource = RESOURCES[recipe.output.resourceId];
                const amountPerPing = recipe.output.amount / recipe.productionTime;

                if (!resourceProduction[outputResource.id]) {
                  resourceProduction[outputResource.id] = {
                    name: outputResource.name,
                    icon: outputResource.id,
                    amount: 0,
                    lines: 0
                  };
                }
                resourceProduction[outputResource.id].amount += amountPerPing;
                resourceProduction[outputResource.id].lines += 1;
              });

              // Sort by amount (descending)
              const sortedResources = Object.values(resourceProduction)
                .sort((a, b) => b.amount - a.amount);

              return sortedResources.map(resource => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={resource.icon}>
                  <Paper sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    bgcolor: '#2c3136',
                    color: '#fff'
                  }}>
                    <ResourceIcon
                      iconUrls={getResourceImageWithFallback(resource.icon, 'icon')}
                      alt={resource.name}
                      resourceId={resource.icon}
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
                        {resource.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {resource.amount.toFixed(2)} per ping
                        <Typography component="span" variant="body2" sx={{ ml: 1, color: '#fff' }}>
                          ({resource.lines} {resource.lines === 1 ? 'line' : 'lines'})
                        </Typography>
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ));
            })()}
          </Grid>
        </Box>

        <Box sx={{ 
          mt: { xs: 3, md: 6 }, 
          p: { xs: 1, sm: 2, md: 3 }, 
          bgcolor: '#23272b',
          borderRadius: 2 
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            color: '#fff'
          }}>
            Global Production Statistics (last 60 min)
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ width: '100%', m: 0 }}>
            {/* Profit/Loss per Ping over Time */}
            <Grid xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: { xs: 250, sm: 300, md: 320 }, display: 'flex', flexDirection: 'column', bgcolor: '#23272b', color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Profit/Loss per Ping
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" minTickGap={30} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="perPing"
                        name="Per Ping"
                        stroke={statsChartData.length > 0 && statsChartData[statsChartData.length - 1].perPing < 0 ? '#e53935' : '#43a047'}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            {/* Profit/Loss Total Balance over Time */}
            <Grid xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: { xs: 250, sm: 300, md: 320 }, display: 'flex', flexDirection: 'column', bgcolor: '#23272b', color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Total Balance per Ping
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" minTickGap={30} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalBalance"
                        name="Total Balance"
                        stroke={statsChartData.length > 0 && statsChartData[statsChartData.length - 1].totalBalance < 0 ? '#e53935' : '#43a047'}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            {/* Current Balance over Time */}
            <Grid xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: { xs: 250, sm: 300, md: 320 }, display: 'flex', flexDirection: 'column', bgcolor: '#23272b', color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Current Balance (Credits)
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" minTickGap={30} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="credits"
                        name="Credits"
                        stroke="#1976d2"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '98vw', sm: 400 },
              maxWidth: { xs: '100vw', sm: 500 },
              m: { xs: 0, sm: 'auto' },
              borderRadius: { xs: 0, sm: 3 },
              p: 0,
              bgcolor: '#23272b',
              color: '#fff',
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 1, bgcolor: '#23272b', color: '#fff' }}>Create New Production Line</DialogTitle>
          <DialogContent sx={{ minWidth: { xs: 'auto', sm: 400 }, px: { xs: 1, sm: 3 }, pt: { xs: 1, sm: 2 }, pb: 1, bgcolor: '#23272b', color: '#fff', overflowX: 'hidden' }}>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1, width: '100%', fontSize: { xs: '1.05rem', sm: '1.1rem' }, textAlign: 'center', lineHeight: 1.4 }}>
              <Typography variant="body1" color="warning.contrastText" sx={{ fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.1rem' } }}>
                Cost to create new production line:<br />{formatMoney(newLineCost)}$
              </Typography>
              <Typography variant="body2" color="warning.contrastText" sx={{ fontSize: { xs: '1rem', sm: '1.05rem' } }}>
                Your current balance: {formatMoney(credits)}$
              </Typography>
            </Box>

            {/* Modul-Auswahl vor Rezept-Auswahl */}
            <FormControl fullWidth sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 1.5, sm: 2 }, bgcolor: '#23272b', color: '#fff' }}>
              <InputLabel shrink={true} sx={{ color: '#fff' }}>Choose Module</InputLabel>
              <Select
                value={selectedModule}
                onChange={e => {
                  setSelectedModule(e.target.value);
                  setSelectedRecipe('');
                }}
                label="Choose Module"
                sx={{ width: '100%', fontSize: { xs: '1rem', sm: '1.1rem' }, minHeight: 48, bgcolor: '#23272b', color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
                inputProps={{ sx: { color: '#fff', bgcolor: '#23272b' } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#23272b', color: '#fff' } } }}
              >
                {Object.entries(MODULES)
                  .filter(([key, mod]) => unlockedModules.includes(mod.id))
                  .map(([key, mod]) => (
                    <MenuItem value={key} key={key} sx={{ bgcolor: '#23272b', color: '#fff', '&:hover': { bgcolor: '#333' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {mod.icon} {mod.name}
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Rezept-Auswahl nur wenn Modul gewählt */}
            {selectedModule && (
              <FormControl fullWidth sx={{ mb: { xs: 1.5, sm: 2 }, bgcolor: '#23272b', color: '#fff' }}>
                <InputLabel sx={{ color: '#fff' }}>Select Recipe</InputLabel>
                <Select
                  value={selectedRecipe}
                  onChange={(e) => {
                    setSelectedRecipe(e.target.value);
                    setNameError('');
                    if (e.target.value) {
                      const suggestedName = PRODUCTION_RECIPES[e.target.value].name;
                      let uniqueName = suggestedName;
                      let counter = 1;
                      while (!checkNameUniqueness(uniqueName)) {
                        uniqueName = `${suggestedName}${counter}`;
                        counter++;
                      }
                      setNewLineName(uniqueName);
                      setTimeout(() => {
                        const nameInput = document.querySelector('input[name="productionLineName"]');
                        if (nameInput) {
                          nameInput.focus();
                          nameInput.select();
                        }
                      }, 100);
                    }
                  }}
                  label="Select Recipe"
                  sx={{ width: '100%', fontSize: { xs: '1rem', sm: '1.1rem' }, minHeight: 48, bgcolor: '#23272b', color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
                  inputProps={{ sx: { color: '#fff', bgcolor: '#23272b' } }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#23272b', color: '#fff' } } }}
                >
                  {moduleRecipes.map(([id, recipe]) => (
                    <MenuItem key={id} value={id} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      py: 1,
                      bgcolor: '#23272b',
                      color: '#fff',
                      '&:hover': { bgcolor: '#333' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ResourceIcon
                          iconUrls={getResourceImageWithFallback(recipe.output.resourceId, 'icon')}
                          alt={RESOURCES[recipe.output.resourceId].name}
                          resourceId={recipe.output.resourceId}
                          style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }}
                        />
                        <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                          {recipe.name}
                          <span style={{ color: '#888', fontWeight: 400, marginLeft: 8 }}>
                            ({recipe.productionTime} Pings)
                          </span>
                          {' '}
                          <span style={{ color: '#888', fontWeight: 400 }}>
                            ({(() => {
                              const output = RESOURCES[recipe.output.resourceId];
                              const outputValue = output.basePrice * recipe.output.amount;
                              const inputCost = recipe.inputs.reduce(
                                (sum, input) => {
                                  const res = RESOURCES[input.resourceId];
                                  return res.purchasable ? sum + res.basePrice * input.amount : sum;
                                },
                                0
                              );
                              const profit = outputValue - inputCost;
                              return (profit >= 0 ? '+' : '') + profit + '$';
                            })()})
                          </span>
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: 0.5,
                        flexWrap: 'wrap'
                      }}>
                        {recipe.inputs.map((input, idx) => {
                          const resource = RESOURCES[input.resourceId];
                          return (
                            <Box key={idx} sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'action.hover',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              color: '#fff'
                            }}>
                              <ResourceIcon
                                iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                                alt={resource.name}
                                resourceId={resource.id}
                                style={{ width: 18, height: 18, objectFit: 'contain', marginRight: 2, verticalAlign: 'middle' }}
                              />
                              <Typography variant="caption" sx={{ color: '#fff' }}>
                                {input.amount}x {resource.name}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              margin="dense"
              name="productionLineName"
              label="Production Line Name"
              fullWidth
              variant="outlined"
              value={newLineName}
              onChange={(e) => {
                setNewLineName(e.target.value);
                setNameError('');
              }}
              error={!!nameError}
              helperText={nameError}
              sx={{ width: '100%', fontSize: { xs: '1rem', sm: '1.1rem' }, minHeight: 48, mb: { xs: 2, sm: 2 }, bgcolor: '#23272b', color: '#fff',
                '& .MuiInputBase-root': { bgcolor: '#23272b', color: '#fff' },
                '& .MuiInputLabel-root': { color: '#fff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '& .MuiInputBase-input': { color: '#fff' },
              }}
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff', backgroundColor: '#23272b' } }}
            />

            {selectedRecipe && PRODUCTION_RECIPES[selectedRecipe] && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#23272b', borderRadius: 1, border: 1, borderColor: 'divider', color: '#fff', overflowX: 'hidden', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#fff' }}>
                  Recipe Details:
                </Typography>
                
                <Typography variant="body2" gutterBottom sx={{ color: '#fff' }}>
                  Production Time: {PRODUCTION_RECIPES[selectedRecipe].productionTime} Pings
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, color: '#fff' }}>
                  Required Resources:
                </Typography>
                {PRODUCTION_RECIPES[selectedRecipe].inputs.map((input, index) => {
                  const resource = RESOURCES[input.resourceId];
                  const currentAmount = resources[input.resourceId].amount;
                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, color: '#fff', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                      <Typography variant="body2" sx={{ color: '#fff', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        • {input.amount}x {
                          <ResourceIcon
                            iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                            alt={resource.name}
                            resourceId={resource.id}
                            style={{ width: 18, height: 18, objectFit: 'contain', marginRight: 2, verticalAlign: 'middle' }}
                          />
                        } {resource.name}
                        <Typography 
                          component="span" 
                          variant="body2" 
                          color={currentAmount >= input.amount ? "success.main" : "error.main"}
                          sx={{ ml: 1 }}
                        >
                          ({currentAmount}/{input.amount} available)
                        </Typography>
                        <Typography component="span" variant="body2" sx={{ color: '#fff' }}>
                          {resource.purchasable && (
                            <> (Purchase Price: {resource.basePrice * input.amount} Credits)</>
                          )}
                        </Typography>
                      </Typography>
                    </Box>
                  );
                })}

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, color: '#fff' }}>
                  Production:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, color: '#fff', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  <Typography variant="body2" sx={{ color: '#fff', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    • {PRODUCTION_RECIPES[selectedRecipe].output.amount}x {
                      <ResourceIcon
                        iconUrls={getResourceImageWithFallback(PRODUCTION_RECIPES[selectedRecipe].output.resourceId, 'icon')}
                        alt={RESOURCES[PRODUCTION_RECIPES[selectedRecipe].output.resourceId].name}
                        resourceId={PRODUCTION_RECIPES[selectedRecipe].output.resourceId}
                        style={{ width: 18, height: 18, objectFit: 'contain', marginRight: 2, verticalAlign: 'middle' }}
                      />
                    } {
                      RESOURCES[PRODUCTION_RECIPES[selectedRecipe].output.resourceId].name
                    }
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <Button onClick={() => setIsCreateDialogOpen(false)} sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1rem' }, py: 1 }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLine}
              variant="contained"
              disabled={!selectedRecipe || !newLineName.trim() || !!nameError || !canAffordNewLine}
              sx={{ 
                width: { xs: '100%', sm: 'auto' }, 
                fontWeight: 700, 
                fontSize: { xs: '1.05rem', sm: '1rem' }, 
                py: 1,
                '&.Mui-disabled': {
                  opacity: 0.7,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              }}
            >
              Create ({formatMoney(newLineCost)}$)
            </Button>
          </DialogActions>
        </Dialog>

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
              value={newLineName}
              onChange={(e) => setNewLineName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRename}
              variant="contained"
              disabled={!newLineName.trim()}
            >
              Rename
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ProductionLines; 