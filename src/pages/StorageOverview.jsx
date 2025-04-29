import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Storage as StorageIcon,
  Factory as FactoryIcon,
  Science as ScienceIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StorageOverview = () => {
  const gameState = useSelector(state => state.game);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  // Calculate storage size
  const calculateStorageSize = (data) => {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    const kilobytes = (bytes / 1024).toFixed(2);
    return `${kilobytes} KB`;
  };

  // Format data for display
  const formatData = (data) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const handleClearData = () => {
    // Lösche alle Daten, die von redux-persist gespeichert wurden
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your Browser Data
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontWeight: 700 }}>
          Data Transparency
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          All your game data is stored <b>locally</b> in your browser's storage (localStorage/cookie). No data is sent to any server or third party.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          You can view, inspect, and delete your entire game progress at any time on this page. Data is stored under the key <b>persist:root</b> in your browser's localStorage. You can also clear it here with one click.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Data transparency is very important to me. If you have questions, feel free to contact the developer.
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ fontWeight: 700, fontSize: '1.2rem', py: 2, px: 4, mb: 2 }}
          onClick={() => setClearDialogOpen(true)}
        >
          Clear browser data
        </Button>
        <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
          <DialogTitle>Delete all browser data?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              If you confirm, <b>your entire game progress will be deleted</b> and cannot be restored. Are you sure you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearData} color="error" variant="contained">
              Delete all data
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Grid container spacing={3}>
        {/* Storage Size Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <MemoryIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Storage Usage</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total size: {calculateStorageSize(gameState)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resources */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StorageIcon color="primary" />
              <Typography variant="h6">Resources</Typography>
            </Box>
            <List>
              {Object.entries(gameState.resources).map(([id, resource]) => (
                <ListItem key={id}>
                  <ListItemText
                    primary={id}
                    secondary={`Amount: ${resource.amount} / Capacity: ${resource.capacity}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Production Lines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FactoryIcon color="primary" />
              <Typography variant="h6">Production Lines</Typography>
            </Box>
            <List>
              {gameState.productionLines.map(line => (
                <ListItem key={line.id}>
                  <ListItemText
                    primary={line.name}
                    secondary={`ID: ${line.id}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Research Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ScienceIcon color="primary" />
              <Typography variant="h6">Research Progress</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Unlocked Modules:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {gameState.unlockedModules.map(module => (
                  <Chip key={module} label={module} size="small" />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2">Researched Technologies:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {gameState.researchedTechnologies.map(tech => (
                  <Chip key={tech} label={tech} size="small" />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6">Statistics</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemText
                  primary="Credits"
                  secondary={gameState.credits}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Research Points"
                  secondary={gameState.researchPoints}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Warehouses"
                  secondary={gameState.warehouses}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Raw Data */}
        <Grid item xs={12}>
          <Accordion sx={{ width: '100%' }} defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="raw-data-content"
              id="raw-data-header"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryIcon color="primary" />
                <Typography variant="h6">Raw Data</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                maxHeight: 400,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}>
                <pre>{formatData(gameState)}</pre>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StorageOverview; 