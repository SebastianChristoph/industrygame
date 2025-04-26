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
  CardContent
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
  unlockModule
} from '../store/gameSlice';
import { PRODUCTION_RECIPES, RESOURCES, OUTPUT_TARGETS, INPUT_SOURCES } from '../config/resources';
import { MODULES } from '../config/modules';

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
        missingResources.push({ name: RESOURCES[input.resourceId].name, reason: 'Keine Konfiguration' });
        return;
      }

      if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
        const available = resources[input.resourceId].amount;
        if (available < input.amount) {
          missingResources.push({
            name: RESOURCES[input.resourceId].name,
            reason: `${available}/${input.amount} verfügbar`
          });
        }
      } else {
        requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
      }
    });

    if (requiredCredits > credits) {
      missingResources.push({
        name: 'Credits',
        reason: `${credits}/${requiredCredits} verfügbar`
      });
    }

    // Prüfe Lagerkapazität für Output wenn nicht verkauft wird
    if (outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
      const outputResource = resources[recipe.output.resourceId];
      if (outputResource.amount + recipe.output.amount > outputResource.capacity) {
        missingResources.push({
          name: RESOURCES[recipe.output.resourceId].name,
          reason: 'Lager voll'
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

const ProductionLines = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productionLines = useSelector(state => state.game.productionLines);
  const productionConfigs = useSelector(state => state.game.productionConfigs);
  const resources = useSelector(state => state.game.resources);
  const productionStatus = useSelector(state => state.game.productionStatus);
  const unlockedModules = useSelector(state => state.game.unlockedModules);
  const unlockedRecipes = useSelector(state => state.game.unlockedRecipes);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [newLineName, setNewLineName] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [nameError, setNameError] = useState('');
  const [isModuleSelectionOpen, setIsModuleSelectionOpen] = useState(false);

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

  // Filter recipes based on unlocked modules and unlockedRecipes
  const availableRecipes = Object.entries(PRODUCTION_RECIPES).filter(([id, recipe]) => {
    // Zeige ein Rezept, wenn es entweder durch ein Modul freigeschaltet ist ODER in unlockedRecipes steht
    return (
      unlockedRecipes.includes(id) ||
      Object.values(MODULES).some(module =>
      unlockedModules.includes(module.id) && module.recipes.includes(id)
      )
    );
  });

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
      headerName: 'Fortschritt',
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
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', textShadow: '0 1px 2px #fff8' }}>
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
            {recipe && outputResource && outputResource.icon}
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
      headerName: 'Bilanz gesamt',
      width: 150,
      align: 'right',
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
        if (!recipe) return '';
        const inputCost = recipe.inputs.reduce((sum, input) => sum + RESOURCES[input.resourceId].basePrice * input.amount, 0);
        const sellIncome = RESOURCES[recipe.output.resourceId].basePrice * recipe.output.amount;
        const isSelling = config?.outputTarget === OUTPUT_TARGETS.AUTO_SELL;
        const balance = isSelling ? (sellIncome - inputCost) : -inputCost;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography color={balance >= 0 ? 'success.main' : 'error.main'}>
              {balance >= 0 ? '+' : ''}{balance}$
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'balancePerPing',
      headerName: 'Bilanz pro Ping',
      width: 150,
      align: 'right',
      renderCell: (params) => {
        const config = productionConfigs[params.row.id];
        const status = productionStatus[params.row.id];
        const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
        if (!recipe || !config || !status?.isActive) return '';
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
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography color={balancePerPing >= 0 ? 'success.main' : 'error.main'}>
              {balancePerPing >= 0 ? '+' : ''}{balancePerPing}$
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
              {outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE ? 'Lager' : 'Verkauf'}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Aktionen',
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
        missingResources.push({ name: RESOURCES[input.resourceId].name, reason: 'Keine Konfiguration' });
        return;
      }

      if (inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE) {
        const available = resources[input.resourceId].amount;
        if (available < input.amount) {
          missingResources.push({
            name: RESOURCES[input.resourceId].name,
            reason: `${available}/${input.amount} verfügbar`
          });
        }
      } else {
        requiredCredits += RESOURCES[input.resourceId].basePrice * input.amount;
      }
    });

    if (requiredCredits > resources.credits) {
      missingResources.push({
        name: 'Credits',
        reason: `${resources.credits}/${requiredCredits} verfügbar`
      });
    }

    if (config.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE) {
      const outputResource = resources[recipe.output.resourceId];
      if (outputResource.amount + recipe.output.amount > outputResource.capacity) {
        missingResources.push({
          name: RESOURCES[recipe.output.resourceId].name,
          reason: 'Lager voll'
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

  // If no production lines exist and no modules are unlocked, show module selection
  if (productionLines.length === 0 && unlockedModules.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Produktionslinien
        </Typography>

        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Typography color="text.secondary" gutterBottom>
            Wähle dein erstes Produktionsmodul
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {Object.values(MODULES).map((module) => (
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
                      onClick={() => {
                        dispatch(unlockModule(module.id));
                        setIsModuleSelectionOpen(false);
                      }}
                    >
                      Modul freischalten
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Produktionslinien
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddLine}
        >
          NEUE PRODUKTIONSLINIE
        </Button>
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
          onRowClick={(params) => navigate(`/production/${params.row.id}`)}
        />
      </Paper>

      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Neue Produktionslinie erstellen</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Rezept auswählen</InputLabel>
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
              label="Rezept auswählen"
            >
              {availableRecipes.map(([id, recipe]) => (
                <MenuItem key={id} value={id} sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  py: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {RESOURCES[recipe.output.resourceId].icon}
                    <Typography variant="subtitle1">
                      {recipe.name}
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
                          {resource.icon}
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

          <TextField
            margin="dense"
            name="productionLineName"
            label="Name der Produktionslinie"
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
                Rezeptdetails:
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Produktionszeit: {PRODUCTION_RECIPES[selectedRecipe].productionTime} Pings
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                Benötigte Ressourcen:
              </Typography>
              {PRODUCTION_RECIPES[selectedRecipe].inputs.map((input, index) => {
                const resource = RESOURCES[input.resourceId];
                const currentAmount = resources[input.resourceId].amount;
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <Typography variant="body2">
                      • {input.amount}x {resource.icon} {resource.name}
                      <Typography 
                        component="span" 
                        variant="body2" 
                        color={currentAmount >= input.amount ? "success.main" : "error.main"}
                        sx={{ ml: 1 }}
                      >
                        ({currentAmount}/{input.amount} verfügbar)
                      </Typography>
                      {resource.purchasable && (
                        <Typography component="span" variant="body2" color="text.secondary">
                          {' '}(Einkaufspreis: {resource.basePrice * input.amount} Credits)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                );
              })}

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                Produktion:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <Typography variant="body2">
                  • {PRODUCTION_RECIPES[selectedRecipe].output.amount}x {
                    RESOURCES[PRODUCTION_RECIPES[selectedRecipe].output.resourceId].icon
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
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreateLine}
            variant="contained"
            disabled={!selectedRecipe || !newLineName.trim() || !!nameError}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

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
            value={newLineName}
            onChange={(e) => setNewLineName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirmRename}
            variant="contained"
            disabled={!newLineName.trim()}
          >
            Umbenennen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionLines; 