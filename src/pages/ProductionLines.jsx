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
  Sell as SellIcon,
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

// @import url('https://fonts.googleapis.com/css2?family=Cal+Sans:wght@400;600;700&display=swap');

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
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px' }}
        >
          {status?.isActive ? <Stop fontSize="small" /> : <PlayArrow fontSize="small" />}
        </IconButton>
      </Box>
    </TableCell>
  );
};

// Platzhalter für Modulauswahl mit Bildern
const MODULES_INFO = [
  {
    name: 'Agriculture Module',
    img: '/images/title_agriculture.png',
    info: 'Enables the production of agricultural resources such as crops and food. Unlock this module to start building supply chains for the food industry and basic goods.',
    tabKey: 'agriculture'
  },
  {
    name: 'Technology Module',
    img: '/images/title_technology.png',
    info: "Allows the production of advanced technology resources, including electronics and IT components. Unlock this module to develop high-tech products and boost your industry's efficiency.",
    tabKey: 'technology'
  },
  {
    name: 'Weapons Module',
    img: '/images/title_weapons.png',
    info: 'Unlocks the production of weapons and military equipment. Use this module to manufacture arms for defense contracts or to expand into the security sector.',
    tabKey: 'weapons'
  },
];

const ModuleSelectionPlaceholder = ({ onModuleClick }) => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const handleModuleImageClick = (tabKey) => {
    onModuleClick(tabKey);
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', p: 0, m: 0, alignItems: 'center', justifyContent: 'center' }}>
        {MODULES_INFO.map((mod, idx) => (
          <Box
            key={idx}
            onClick={() => handleModuleImageClick(mod.tabKey)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            sx={{
              flex: 1,
              cursor: 'pointer',
              p: 0,
              m: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              position: 'relative',
            }}
          >
            <Box
              component="img"
              src={mod.img}
              alt={mod.name}
              sx={{
                width: '90%',
                height: '90%',
                borderRadius: 0,
                display: 'block',
                objectFit: 'contain',
                transition: 'filter 0.3s',
                filter: hoveredIdx === idx ? 'brightness(0.5)' : 'none',
              }}
            />
            <Typography
              variant="h2"
              align="center"
              sx={{ mt: 1, fontWeight: 600, color: 'text.primary', textShadow: '0 2px 8px #fff', width: '100%', fontFamily: 'Cal Sans, sans-serif' }}
            >
              {mod.name}
            </Typography>
            {hoveredIdx === idx && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '85%',
                  bgcolor: 'rgba(20,20,20,0.88)',
                  color: 'white',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  pointerEvents: 'none',
                  zIndex: 2,
                  boxShadow: '0 4px 24px 4px rgba(0,0,0,0.7)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 700, textShadow: '0 2px 8px #000' }}>{mod.name}</Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, textShadow: '0 2px 8px #000' }}>{mod.info}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 2, mt: 6 }}>
        <Typography variant="body1" color="text.secondary">
          Before you can create a production line, you need to unlock a production module in the research area.
        </Typography>
      </Box>  
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
    // Prüfe Inputquellen
    const allInputsFromStock = recipe.inputs.every((input, idx) => {
      const inputConfig = config.inputs[idx];
      return inputConfig && inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE;
    });
    // Einkaufskosten nur für eingekaufte Inputs
    const purchaseCost = recipe.inputs.reduce((sum, input, idx) => {
      const inputConfig = config.inputs[idx];
      if (inputConfig && inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE) {
        return sum + RESOURCES[input.resourceId].basePrice * input.amount;
      }
      return sum;
    }, 0);
    // Verkaufserlös
    const sellIncome = RESOURCES[recipe.output.resourceId].basePrice * recipe.output.amount;
    const isSelling = config?.outputTarget === OUTPUT_TARGETS.AUTO_SELL;
    const isStoring = config?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE;
    let balance = 0;
    if (allInputsFromStock && isStoring) {
      balance = 0;
    } else if (isSelling) {
      balance = sellIncome - purchaseCost;
    } else {
      balance = -purchaseCost;
    }
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
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px' }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            {outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE ? (
              <StorageIcon fontSize="small" color="action" />
            ) : (
              <SellIcon fontSize="small" color="success" />
            )}
            <Typography variant="body2">
              {outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE ? 'Storage' : 'Sell'}
            </Typography>
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
          <IconButton size="small" onClick={(event) => { event.stopPropagation(); handleRenameClick(params.row.id, params.row.name); }}>
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

  // If no production lines exist and no modules are unlocked, show module selection
  if (productionLines.length === 0 && unlockedModules.length === 0) {
    return <>
      <ModuleSelectionPlaceholder onModuleClick={handleModuleClick} />
      <StorageInfoDialog 
        open={showStorageInfo} 
        onClose={() => setShowStorageInfo(false)}
        onAccept={handleStorageAccept}
      />
    </>;
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
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ flex: 1 }}>
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
          >
            NEW PRODUCTION LINE ({formatMoney(newLineCost)}$)
          </Button>
          {!canAffordNewLine && (
            <Chip
              color="error"
              variant="filled"
              label={`Not enough credits (need ${formatMoney(newLineCost)}$)`}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        {/* Summen-Box wie in Screenshot 2, zentriert und schwebend */}
        <Box sx={{ width: '100%', ml: "800px", mb: 3 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            bgcolor: 'background.paper',
            borderRadius: 8,
            boxShadow: 2,
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 0,
            width: 'max-content',
            py: 2,
            px: 10,
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
                  <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, minWidth: 120, textAlign: 'center', px: 4 }}>
                    Total Balance:
                    </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: colorTotal, minWidth: 120, textAlign: 'center', px: 4 }}>
                    {totalBalance >= 0 ? '+' : ''}{formatMoney(totalBalance)}$
                    </Typography>
                  </Box>
                  <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, minWidth: 120, textAlign: 'center', px: 4 }}>
                    Balance per Ping:
                    </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: colorPing, minWidth: 120, textAlign: 'center', px: 4 }}>
                    {totalPerPing >= 0 ? '+' : ''}{formatMoney(totalPerPing)}$
                    </Typography>
                    </Box>
                </>
              );
            })()}
          </Box>
        </Box>

        <Paper sx={{ height: 600, width: '100%' }}>
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
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                borderBottom: '2px solid',
                borderColor: 'divider'
              }
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

        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Global Production Statistics (last 60 min)</Typography>
          <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
            {/* Profit/Loss per Ping over Time */}
            <Grid item xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Paper sx={{ p: 2, height: 320, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Profit/Loss per Ping</Typography>
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
            <Grid item xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Paper sx={{ p: 2, height: 320, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Total Balance</Typography>
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
            <Grid item xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Paper sx={{ p: 2, height: 320, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Current Balance (Credits)</Typography>
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

        <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
          <DialogTitle>Create New Production Line</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body1" color="warning.contrastText">
                Cost to create new production line: {formatMoney(newLineCost)}$
              </Typography>
              <Typography variant="body2" color="warning.contrastText">
                Your current balance: {formatMoney(credits)}$
              </Typography>
            </Box>

            {/* Modul-Auswahl vor Rezept-Auswahl */}
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Choose Module</InputLabel>
              <Select
                value={selectedModule}
                onChange={e => {
                  setSelectedModule(e.target.value);
                  setSelectedRecipe('');
                }}
                label="Choose Module"
              >
                {Object.entries(MODULES)
                  .filter(([key, mod]) => unlockedModules.includes(mod.id))
                  .map(([key, mod]) => (
                    <MenuItem value={key} key={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {mod.icon} {mod.name}
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Rezept-Auswahl nur wenn Modul gewählt */}
            {selectedModule && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Recipe</InputLabel>
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
                >
                  {moduleRecipes.map(([id, recipe]) => (
                    <MenuItem key={id} value={id} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      py: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ResourceIcon
                          iconUrls={getResourceImageWithFallback(recipe.output.resourceId, 'icon')}
                          alt={RESOURCES[recipe.output.resourceId].name}
                          resourceId={recipe.output.resourceId}
                          style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }}
                        />
                        <Typography variant="subtitle1">
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
                              fontSize: '0.75rem'
                            }}>
                              <ResourceIcon
                                iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                                alt={resource.name}
                                resourceId={resource.id}
                                style={{ width: 18, height: 18, objectFit: 'contain', marginRight: 2, verticalAlign: 'middle' }}
                              />
                              <Typography variant="caption">
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
            />

            {selectedRecipe && PRODUCTION_RECIPES[selectedRecipe] && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recipe Details:
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Production Time: {PRODUCTION_RECIPES[selectedRecipe].productionTime} Pings
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                  Required Resources:
                </Typography>
                {PRODUCTION_RECIPES[selectedRecipe].inputs.map((input, index) => {
                  const resource = RESOURCES[input.resourceId];
                  const currentAmount = resources[input.resourceId].amount;
                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <Typography variant="body2">
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
                        {resource.purchasable && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}(Purchase Price: {resource.basePrice * input.amount} Credits)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  );
                })}

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                  Production:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                  <Typography variant="body2">
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
          <DialogActions>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLine}
              variant="contained"
              disabled={!selectedRecipe || !newLineName.trim() || !!nameError || !canAffordNewLine}
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