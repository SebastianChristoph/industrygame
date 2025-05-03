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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
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
import { useNavigate } from 'react-router-dom';

const StorageOverview = () => {
  const gameState = useSelector(state => state.game);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const navigate = useNavigate();
  
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
    localStorage.clear();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <Box sx={{
      p: { xs: 0, sm: 3 },
      backgroundImage: {
        xs: 'url(/images/background_dark_mobil.png)',
        md: 'url(/images/background.png)'
      },
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
    }}>
       <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 900,
                fontSize: "2.5rem",
                color: "#fff",
                textShadow: "0 2px 8px #000, 0 1px 1px #000",
                //   background: 'rgba(30,30,30,0.7)',
                px: 2,
                py: 1,
                borderRadius: 2,
                width: "fit-content",
              }}
            >
           Your Browser Data
            </Typography>

      <Box sx={{ mb: 3, px: { xs: 2, sm: 0 }, py: { xs: 2, sm: 0 } }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontWeight: 700 }}>
          Data Transparency
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: '#fff' }}>
          All your game data is stored <b>locally</b> in your browser's storage (localStorage/cookie). No data is sent to any server or third party.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: '#fff' }}>
          You can view, inspect, and delete your entire game progress at any time on this page. Data is stored under the key <b>persist:root</b> in your browser's localStorage. You can also clear it here with one click.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#fff' }}>
          Data transparency is very important to me. If you have questions, feel free to contact the developer.
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ fontWeight: 700, fontSize: '1.2rem', py: 2, px: 4, mb: 2, width: { xs: '100%', sm: 'auto' }, maxWidth: '100%' }}
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
      <Stack spacing={3} sx={{ width: '100%' }}>
        {/* Storage Size Card */}
        <Card sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: 2 }, background: 'rgba(30,30,30,0.85)', color: '#fff', boxShadow: 6 }}>
          <CardContent sx={{ color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MemoryIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#fff' }}>Storage Usage</Typography>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  Total size: {calculateStorageSize(gameState)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Resources */}
        <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: 2 }, background: 'rgba(30,30,30,0.85)', color: '#fff', boxShadow: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StorageIcon color="primary" />
            <Typography variant="h6" sx={{ color: '#fff' }}>Resources</Typography>
          </Box>
          <List>
            {Object.entries(gameState.resources).map(([id, resource]) => (
              <ListItem key={id}>
                <ListItemText
                  primary={id}
                  secondary={`Amount: ${resource.amount} / Capacity: ${resource.capacity}`}
                  primaryTypographyProps={{ sx: { color: '#fff' } }}
                  secondaryTypographyProps={{ sx: { color: '#fff', opacity: 0.8 } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Production Lines */}
        <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: 2 }, background: 'rgba(30,30,30,0.85)', color: '#fff', boxShadow: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FactoryIcon color="primary" />
            <Typography variant="h6" sx={{ color: '#fff' }}>Production Lines</Typography>
          </Box>
          <List>
            {gameState.productionLines.map(line => (
              <ListItem key={line.id}>
                <ListItemText
                  primary={line.name}
                  secondary={`ID: ${line.id}`}
                  primaryTypographyProps={{ sx: { color: '#fff' } }}
                  secondaryTypographyProps={{ sx: { color: '#fff', opacity: 0.8 } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Research Progress */}
        <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: 2 }, background: 'rgba(30,30,30,0.85)', color: '#fff', boxShadow: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScienceIcon color="primary" />
            <Typography variant="h6" sx={{ color: '#fff' }}>Research Progress</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#fff' }}>Unlocked Modules:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {gameState.unlockedModules.map(module => (
                <Chip key={module} label={module} size="small" />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#fff' }}>Researched Technologies:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {gameState.researchedTechnologies.map(tech => (
                <Chip key={tech} label={tech} size="small" />
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Statistics */}
        <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: 2 }, background: 'rgba(30,30,30,0.85)', color: '#fff', boxShadow: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6" sx={{ color: '#fff' }}>Statistics</Typography>
          </Box>
          <List>
            <ListItem>
              <ListItemText
                primary="Credits"
                secondary={gameState.credits}
                primaryTypographyProps={{ sx: { color: '#fff' } }}
                secondaryTypographyProps={{ sx: { color: '#fff', opacity: 0.8 } }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Research Points"
                secondary={gameState.researchPoints}
                primaryTypographyProps={{ sx: { color: '#fff' } }}
                secondaryTypographyProps={{ sx: { color: '#fff', opacity: 0.8 } }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Warehouses"
                secondary={gameState.warehouses}
                primaryTypographyProps={{ sx: { color: '#fff' } }}
                secondaryTypographyProps={{ sx: { color: '#fff', opacity: 0.8 } }}
              />
            </ListItem>
          </List>
        </Paper>

        {/* Raw Data */}
        <Accordion sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: 2 }, background: 'rgba(30,30,30,0.85)', color: '#fff', boxShadow: 6 }} defaultExpanded={false}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="raw-data-content"
            id="raw-data-header"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MemoryIcon color="primary" />
              <Typography variant="h6" sx={{ color: '#fff' }}>Raw Data</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ 
              bgcolor: 'grey.900', 
              p: 2, 
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#fff'
            }}>
              <pre>{formatData(gameState)}</pre>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
};

export default StorageOverview; 