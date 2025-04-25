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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  CardActionArea
} from '@mui/material';
import { Add, Factory } from '@mui/icons-material';
import { addProductionLine } from '../store/gameSlice';

const ProductionLines = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productionLines = useSelector(state => state.game.productionLines);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLineName, setNewLineName] = useState('');

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setNewLineName('');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCreateLine = () => {
    if (newLineName.trim()) {
      const newLine = {
        id: Date.now(),
        name: newLineName.trim()
      };
      dispatch(addProductionLine(newLine));
      setIsDialogOpen(false);
      navigate(`/production/${newLine.id}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h4">
          Produktionslinien
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Neue Produktionslinie
        </Button>
      </Box>

      <Grid container spacing={2}>
        {productionLines.map((line) => (
          <Grid item xs={12} sm={6} md={4} key={line.id}>
            <Card>
              <CardActionArea onClick={() => navigate(`/production/${line.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Factory />
                    <Typography variant="h6">
                      {line.name}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Button für mobile Ansicht */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        bottom: 16,
        right: 16
      }}>
        <Fab color="primary" onClick={handleOpenDialog}>
          <Add />
        </Fab>
      </Box>

      {/* Dialog für neue Produktionslinie */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Neue Produktionslinie erstellen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name der Produktionslinie"
            type="text"
            fullWidth
            variant="outlined"
            value={newLineName}
            onChange={(e) => setNewLineName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newLineName.trim()) {
                handleCreateLine();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button 
            onClick={handleCreateLine} 
            variant="contained"
            disabled={!newLineName.trim()}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionLines; 