import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Factory as FactoryIcon,
  Timer as TimerIcon,
  ShoppingCart as ShoppingCartIcon,
  Storage as StorageIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const Tutorial = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Tutorial
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" /> Getting Started
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Welcome to the Industry Game! Here's a quick guide to help you get started:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ScienceIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Research Module Selection"
              secondary="Start by selecting a research module in the Research area. This will unlock new production capabilities."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Create Production Lines"
              secondary="Once you have unlocked modules, create production lines to start manufacturing resources."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FactoryIcon color="primary" /> Production Lines
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Production lines are the core of your industrial empire. Here's what you need to know:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ShoppingCartIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Input Sources"
              secondary="You can configure inputs to either automatically purchase resources or use them from your global storage."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Output Targets"
              secondary="Choose whether to store produced resources in your global storage or automatically sell them for credits."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon color="primary" /> Global Ping System
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          The game operates on a ping-based system:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <TimerIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Ping Timer"
              secondary="Watch the ping indicator in the bottom right corner. Each ping represents one production cycle."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Production Timing"
              secondary="Production lines have different ping requirements. Some items take longer to produce than others."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" /> Research System
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Research is key to expanding your industrial capabilities:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ScienceIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Research Points"
              secondary="Earn research points by selling resources. Use these points to unlock new modules and recipes."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Module Unlocking"
              secondary="Unlock new production modules to access more advanced recipes and increase your production capabilities."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Tutorial; 