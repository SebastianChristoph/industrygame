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
  Edit as EditIcon
} from '@mui/icons-material';
import { addProductionLine, removeProductionLine, setProductionRecipe, renameProductionLine } from '../store/gameSlice';
import { PRODUCTION_RECIPES } from '../config/resources';
import { RESOURCES } from '../config/resources';

const ProductionLineCard = ({ line, onRenameClick, onDeleteClick }) => {
  const config = useSelector(state => state.game.productionConfigs[line.id]);
  const status = useSelector(state => state.game.productionStatus[line.id]);
  const recipe = config?.recipe ? PRODUCTION_RECIPES[config.recipe] : null;
  const navigate = useNavigate();

  // Berechne den Fortschritt in Prozent
  const progressPercent = status?.isActive && recipe
    ? (status.currentPings / recipe.productionTime) * 100
    : 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
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
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Status: {status?.isActive ? 'Aktiv' : 'Inaktiv'}
        </Typography>

        {status?.isActive && recipe && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress
              variant="determinate"
              value={progressPercent}
              size={16}
              sx={{
                color: 'primary.main',
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

        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => navigate(`/production/${line.id}`)}
          sx={{ mt: 2 }}
          fullWidth
        >
          KONFIGURIEREN
        </Button>
      </CardContent>
    </Card>
  );
};

const ProductionLines = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productionLines = useSelector(state => state.game.productionLines);
  const productionConfigs = useSelector(state => state.game.productionConfigs);
  
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
            onClick={() => {
              setNewLineName('');
              setSelectedRecipe('');
              setIsCreateDialogOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            ERSTE LINIE ERSTELLEN
          </Button>
        </Box>

        {/* Dialog für neue Produktionslinie */}
        <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
          <DialogTitle>Neue Produktionslinie erstellen</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Name der Produktionslinie"
              fullWidth
              variant="outlined"
              value={newLineName}
              onChange={(e) => setNewLineName(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Rezept auswählen</InputLabel>
              <Select
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
                label="Rezept auswählen"
              >
                {Object.entries(PRODUCTION_RECIPES).map(([id, recipe]) => (
                  <MenuItem key={id} value={id}>
                    {recipe.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                  const purchaseCost = resource.basePrice * input.amount;
                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <Typography variant="body2">
                        • {input.amount}x {resource.name} 
                        {resource.purchasable && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}(Einkaufspreis: {purchaseCost} Credits)
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Produktionslinien
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLine}
        >
          Neue Produktionslinie
        </Button>
      </Box>

      <Grid container spacing={3}>
        {productionLines.map((line) => {
          const recipe = productionConfigs[line.id]?.recipe;
          const recipeName = PRODUCTION_RECIPES[recipe]?.name || 'Kein Rezept ausgewählt';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={line.id}>
              <ProductionLineCard
                line={line}
                onRenameClick={(line) => handleRenameClick(line.id, line.name)}
                onDeleteClick={(line) => handleDeleteClick(line.id)}
              />
            </Grid>
          );
        })}
      </Grid>

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