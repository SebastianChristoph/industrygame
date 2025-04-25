import {
  AccountBalance as BalanceIcon,
  MonetizationOn as MoneyIcon,
  ShoppingCart as ExpensesIcon,
  Factory,
  Menu as MenuIcon,
  Storage as StorageIcon,
  Warehouse,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import {
  INPUT_SOURCES,
  OUTPUT_TARGETS,
  PRODUCTION_RECIPES,
  RESOURCES,
} from "../config/resources";
import { PingIndicator } from "./PingIndicator";
import StorageDrawer from "./StorageDrawer";

const drawerWidth = 240;

const menuItems = [
  { text: "Produktion", icon: <Factory />, path: "/production" },
  { text: "Lager", icon: <StorageIcon />, path: "/storage" },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const credits = useSelector((state) => state.game.credits);
  const productionLines = useSelector((state) => state.game.productionLines);
  const productionConfigs = useSelector(
    (state) => state.game.productionConfigs
  );
  const productionStatus = useSelector((state) => state.game.productionStatus);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Berechne Einnahmen und Ausgaben pro Ping
  const calculateBalance = () => {
    let income = 0;
    let expenses = 0;

    productionLines.forEach((line) => {
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
          expenses +=
            (resource.basePrice * input.amount) / recipe.productionTime;
        }
      });

      // Berechne Einnahmen aus Verkäufen
      if (config.outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
        income +=
          (outputResource.basePrice * recipe.output.amount) /
          recipe.productionTime;
      }
    });

    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100,
    };
  };

  const { income, expenses, balance } = calculateBalance();

  const drawer = (
    <div>
      <Toolbar />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#c62828',
          height: '48px',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important', px: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#fff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Industry Game
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <PingIndicator />
            
            <Tooltip title="Einnahmen pro Ping">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <MoneyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  +{income}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Ausgaben pro Ping">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <ExpensesIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  -{expenses}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Gewinn/Verlust pro Ping">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <BalanceIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  {balance >= 0 ? '+' : ''}{balance}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Aktuelles Guthaben">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)',
                  minWidth: '100px',
                }}
              >
                <MoneyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
                <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
                  ${credits.toLocaleString()}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Lager öffnen">
              <Button
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.3)',
                  }
                }}
                startIcon={<Warehouse />}
                onClick={() => setStorageOpen(true)}
              >
                Storage
              </Button>
            </Tooltip>

          </Box>
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
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
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
          ml: "300px",
          minHeight: "100vh",
          padding: 3,
          width: "80vw"
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
