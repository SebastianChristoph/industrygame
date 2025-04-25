import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
  Chip,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Factory,
  Storage as StorageIcon,
  Settings,
  Info,
  Warehouse,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';
import { PingIndicator } from './PingIndicator';
import StorageDrawer from './StorageDrawer';
import { PRODUCTION_RECIPES, RESOURCES, OUTPUT_TARGETS, INPUT_SOURCES } from '../config/resources';

const drawerWidth = 240;

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Produktion', icon: <Factory />, path: '/production' },
  { text: 'Lager', icon: <StorageIcon />, path: '/storage' },
  { text: 'Einstellungen', icon: <Settings />, path: '/settings' },
  { text: 'About', icon: <Info />, path: '/about' },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const credits = useSelector(state => state.game.credits);
  const productionLines = useSelector(state => state.game.productionLines);
  const productionConfigs = useSelector(state => state.game.productionConfigs);
  const productionStatus = useSelector(state => state.game.productionStatus);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Berechne Einnahmen und Ausgaben pro Ping
  const calculateBalance = () => {
    let income = 0;
    let expenses = 0;

    productionLines.forEach(line => {
      const config = productionConfigs[line.id];
      const status = productionStatus[line.id];
      
      if (!config?.recipe || !status?.isActive) return;

      const recipe = PRODUCTION_RECIPES[config.recipe];
      const outputResource = RESOURCES[recipe.output.resourceId];
      
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
    });

    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100
    };
  };

  const { income, expenses, balance } = calculateBalance();

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'primary.main'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Industry Game
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <PingIndicator />
            
            <Tooltip title="Einnahmen pro Ping">
              <Paper elevation={0} sx={{ 
                p: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText'
              }}>
                <IncomeIcon />
                <Typography variant="body2">
                  +{income}/Ping
                </Typography>
              </Paper>
            </Tooltip>

            <Tooltip title="Ausgaben pro Ping">
              <Paper elevation={0} sx={{ 
                p: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'error.main',
                color: 'error.contrastText'
              }}>
                <ExpenseIcon />
                <Typography variant="body2">
                  -{expenses}/Ping
                </Typography>
              </Paper>
            </Tooltip>

            <Tooltip title="Bilanz pro Ping">
              <Paper elevation={0} sx={{ 
                p: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: balance >= 0 ? 'success.main' : 'error.main',
                color: balance >= 0 ? 'success.contrastText' : 'error.contrastText'
              }}>
                <BalanceIcon />
                <Typography variant="body2">
                  {balance >= 0 ? '+' : ''}{balance}/Ping
                </Typography>
              </Paper>
            </Tooltip>

            <Button
              color="inherit"
              startIcon={<Warehouse />}
              onClick={() => setStorageOpen(true)}
            >
              Storage
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <StorageDrawer open={storageOpen} onClose={() => setStorageOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 