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
  DialogContentText
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
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  PRODUCTION_RECIPES,
  RESOURCES,
  INPUT_SOURCES
} from '../config/resources';
import {
  setInputSource,
  toggleProduction,
  removeProductionLine,
  renameProductionLine
} from '../store/gameSlice';

const ProductionLine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productionLineId = parseInt(id);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

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

  // Berechne den Fortschritt in Prozent
  const progressPercent = productionStatus?.currentPings 
    ? (productionStatus.currentPings / selectedRecipe?.productionTime) * 100 
    : 0;

  // Setze automatisch die Einkaufsmodule für die Inputs, wenn noch nicht konfiguriert
  useEffect(() => {
    if (productionConfig?.recipe && (!productionConfig.inputs || productionConfig.inputs.length === 0)) {
      PRODUCTION_RECIPES[productionConfig.recipe].inputs.forEach((_, index) => {
        dispatch(setInputSource({
          productionLineId,
          inputIndex: index,
          source: INPUT_SOURCES.PURCHASE_MODULE,
          resourceId: PRODUCTION_RECIPES[productionConfig.recipe].inputs[index].resourceId
        }));
      });
    }
  }, [productionConfig?.recipe, dispatch, productionLineId]);

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

  const handleRenameClick = () => {
    setNewName(productionLine.name);
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = () => {
    if (newName.trim()) {
      dispatch(renameProductionLine({
        id: productionLineId,
        name: newName.trim()
      }));
      setIsRenameDialogOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    navigate('/production');
    dispatch(removeProductionLine(productionLineId));
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/production')}
        >
          Zurück
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          {productionLine.name}
        </Typography>

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

      <Grid container spacing={3}>
        {/* Rezeptanzeige */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                Produktionskonfiguration
              </Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {selectedRecipe.name} ({selectedRecipe.productionTime} Pings)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Input Konfiguration */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Eingangskonfiguration
            </Typography>
            <List>
              {selectedRecipe.inputs.map((input, index) => {
                const inputConfig = productionConfig.inputs[index];
                const resource = RESOURCES[input.resourceId];
                const currentAmount = resources[input.resourceId].amount;
                const purchaseCost = resource.basePrice * input.amount;
                const isGlobalStorage = inputConfig?.source === INPUT_SOURCES.GLOBAL_STORAGE;
                
                return (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={isGlobalStorage ? "Aus globalem Lager" : "Automatisch einkaufen"}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isGlobalStorage}
                                onChange={(e) => dispatch(setInputSource({
                                  productionLineId,
                                  inputIndex: index,
                                  source: e.target.checked ? INPUT_SOURCES.GLOBAL_STORAGE : INPUT_SOURCES.PURCHASE_MODULE,
                                  resourceId: input.resourceId
                                }))}
                                size="small"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {isGlobalStorage ? <Storage fontSize="small" /> : <ShoppingCart fontSize="small" />}
                              </Box>
                            }
                            labelPlacement="start"
                          />
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      {resource.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography>
                          {resource.name} ({input.amount}x)
                        </Typography>
                      }
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            display: 'block',
                            color: isGlobalStorage 
                              ? (currentAmount >= input.amount ? 'success.main' : 'error.main')
                              : 'info.main'
                          }}
                        >
                          {isGlobalStorage
                            ? `Aus globalem Lager (Verfügbar: ${currentAmount}/${input.amount} benötigt)`
                            : `Wird automatisch eingekauft (${purchaseCost} Credits pro Produktion)`
                          }
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Output und Produktionssteuerung */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Produktion
                </Typography>
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

              {productionStatus?.error && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography color="error">
                    Fehler: {productionStatus.error}
                  </Typography>
                </Box>
              )}

              {productionStatus?.isActive && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={progressPercent}
                    size={40}
                  />
                  <Typography>
                    {Math.round(progressPercent)}% ({productionStatus.currentPings}/{selectedRecipe.productionTime} Pings)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirmRename}
            variant="contained"
            disabled={!newName.trim()}
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