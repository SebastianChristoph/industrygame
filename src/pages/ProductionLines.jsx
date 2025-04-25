import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  CircularProgress
} from '@mui/material';
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
  Stop
} from '@mui/icons-material';
import { 
  addProductionLine, 
  removeProductionLine, 
  setProductionRecipe, 
  renameProductionLine,
  toggleProduction 
} from '../store/gameSlice';
import { PRODUCTION_RECIPES, RESOURCES, OUTPUT_TARGETS, INPUT_SOURCES } from '../config/resources';

const ProductionLineCard = ({ line, onRenameClick, onDeleteClick }) => {
  const dispatch = useDispatch();
  const config = useSelector(state => state.game.productionConfigs[line.id]);
  const status = useSelector(state => state.game.productionStatus[line.id]);
  const resources = useSelector(state => state.game.resources);
  const credits = useSelector(state => state.game.credits);
  const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
  const navigate = useNavigate();

  // Berechne den Fortschritt in Prozent
  const progressPercent = status?.isActive && recipe
    ? (status.currentPings / recipe.productionTime) * 100
    : 0;

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
    if (!recipe || !config || !status?.isActive) return { income: 0, expenses: 0, balance: 0 };

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
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100
    };
  };

  const { income, expenses, balance } = calculateLineBalance();

  const handleToggleProduction = () => {
    dispatch(toggleProduction(line.id));
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', bgcolor: 'background.paper' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          {recipe && outputResource && outputResource.icon}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {line.name}
          </Typography>
          <IconButton size="small" onClick={() => onRenameClick(line)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDeleteClick(line)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Rezept: {recipe ? recipe.name : 'Kein Rezept ausgewählt'}
        </Typography>
        
        <Typography 
          variant="body2" 
          color={status?.isActive ? (canProduce ? "success.main" : "error.main") : "text.secondary"} 
          gutterBottom
        >
          Status: {status?.isActive ? (canProduce ? 'Aktiv' : 'Gestoppt') : 'Inaktiv'}
          {status?.isActive && !canProduce && (
            <Tooltip title={missingResources.map(r => `${r.name}: ${r.reason}`).join(', ')}>
              <Box component="span" sx={{ ml: 1, cursor: 'help' }}>⚠️</Box>
            </Tooltip>
          )}
        </Typography>

        {recipe && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Output: {recipe.output.amount}x {outputResource.icon} {outputResource.name}
              </Typography>
              <Tooltip title={
                outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE 
                  ? `In globales Lager (${resources[recipe.output.resourceId].amount}/${resources[recipe.output.resourceId].capacity})` 
                  : `Automatischer Verkauf (${outputResource.basePrice * recipe.output.amount} Credits pro Produktion)`
              }>
                {outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE ? (
                  <StorageIcon fontSize="small" color="action" />
                ) : (
                  <SellIcon fontSize="small" color="success" />
                )}
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              {income > 0 && (
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IncomeIcon fontSize="small" />
                  +{income}/Ping
                </Typography>
              )}
              {expenses > 0 && (
                <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ExpenseIcon fontSize="small" />
                  -{expenses}/Ping
                </Typography>
              )}
              {(income > 0 || expenses > 0) && (
                <Typography 
                  variant="body2" 
                  color={balance >= 0 ? "success.main" : "error.main"}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <BalanceIcon fontSize="small" />
                  {balance >= 0 ? '+' : ''}{balance}/Ping
                </Typography>
              )}
            </Box>
          </>
        )}

        {status?.isActive && recipe && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress
              variant="determinate"
              value={progressPercent}
              size={16}
              sx={{
                color: canProduce ? 'primary.main' : 'error.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progressPercent)}% ({status.currentPings}/{recipe.productionTime} Pings)
            </Typography>
          </Box>
        )}

        {status?.error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {status.error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Tooltip title={
            !recipe ? "Kein Rezept ausgewählt" :
            !canProduce && status?.isActive ? missingResources.map(r => `${r.name}: ${r.reason}`).join(', ') :
            status?.isActive ? "Produktion stoppen" : "Produktion starten"
          }>
            <span>
              <Button
                variant="contained"
                color={status?.isActive ? "error" : "primary"}
                startIcon={status?.isActive ? <Stop /> : <PlayArrow />}
                onClick={handleToggleProduction}
                disabled={!recipe || (!canProduce && !status?.isActive)}
                size="small"
              >
                {status?.isActive ? "Stop" : "Start"}
              </Button>
            </span>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate(`/production/${line.id}`)}
            size="small"
          >
            KONFIGURIEREN
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProductionLines = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productionLines = useSelector(state => state.game.productionLines);
  const productionConfigs = useSelector(state => state.game.productionConfigs);
  const resources = useSelector(state => state.game.resources);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [newLineName, setNewLineName] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');

  const handleAddLine = () => {
    setNewLineName('');
    setSelectedRecipe('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateLine = () => {
    const newId = Math.max(0, ...productionLines.map(line => line.id)) + 1;
    dispatch(addProductionLine({
      id: newId,
      name: newLineName || `Produktionslinie ${newId}`
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

  // Wenn keine Produktionslinien vorhanden sind, zeige die leere Ansicht
  if (productionLines.length === 0) {
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
            Keine Produktionslinien vorhanden
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddLine}
            sx={{ mt: 1 }}
          >
            NEUE PRODUKTIONSLINIE
          </Button>
        </Box>

        <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
          <DialogTitle>Neue Produktionslinie erstellen</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rezept auswählen</InputLabel>
              <Select
                value={selectedRecipe}
                onChange={(e) => {
                  setSelectedRecipe(e.target.value);
                  if (e.target.value) {
                    setNewLineName(PRODUCTION_RECIPES[e.target.value].name);
                    // Kurze Verzögerung um sicherzustellen, dass das Textfeld existiert
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
                {Object.entries(PRODUCTION_RECIPES).map(([id, recipe]) => (
                  <MenuItem key={id} value={id} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    py: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {RESOURCES[recipe.output.resourceId].icon}
                      <Typography variant="subtitle1">{recipe.name}</Typography>
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
              onChange={(e) => setNewLineName(e.target.value)}
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
              disabled={!selectedRecipe}
            >
              Erstellen
            </Button>
          </DialogActions>
        </Dialog>
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

      <Grid container spacing={3}>
        {productionLines.map((line) => (
          <Grid item xs={12} sm={6} md={4} key={line.id}>
            <ProductionLineCard
              line={line}
              onRenameClick={(line) => handleRenameClick(line.id, line.name)}
              onDeleteClick={(line) => handleDeleteClick(line.id)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Dialog für neue Produktionslinie */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Neue Produktionslinie erstellen</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Rezept auswählen</InputLabel>
            <Select
              value={selectedRecipe}
              onChange={(e) => {
                setSelectedRecipe(e.target.value);
                if (e.target.value) {
                  setNewLineName(PRODUCTION_RECIPES[e.target.value].name);
                  // Kurze Verzögerung um sicherzustellen, dass das Textfeld existiert
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
              {Object.entries(PRODUCTION_RECIPES).map(([id, recipe]) => (
                <MenuItem key={id} value={id} sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  py: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {RESOURCES[recipe.output.resourceId].icon}
                    <Typography variant="subtitle1">{recipe.name}</Typography>
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
            onChange={(e) => setNewLineName(e.target.value)}
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
            disabled={!selectedRecipe}
          >
            Erstellen
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