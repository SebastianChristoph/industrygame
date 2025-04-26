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
  useTheme,
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
import ScienceIcon from '@mui/icons-material/Science';

const drawerWidth = 240;

const menuItems = [
  { text: "Produktion", icon: <Factory />, path: "/production" },
  { text: "Lager", icon: <StorageIcon />, path: "/storage" },
  {
    text: 'Forschung',
    icon: <ScienceIcon />,
    path: '/research'
  }
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const credits = useSelector((state) => state.game.credits);
  const researchPoints = useSelector((state) => state.game.researchPoints);
  const productionLines = useSelector((state) => state.game.productionLines);
  const productionConfigs = useSelector(
    (state) => state.game.productionConfigs
  );
  const productionStatus = useSelector((state) => state.game.productionStatus);
  const theme = useTheme();

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

      // Nur Linien, die aktiv sind UND verkaufen!
      if (!config?.recipe || !status?.isActive || config.outputTarget !== OUTPUT_TARGETS.AUTO_SELL) return;

      const recipe = PRODUCTION_RECIPES[config.recipe];
      const outputResource = RESOURCES[recipe.output.resourceId];

      // Kosten für Inputs
      recipe.inputs.forEach((input, index) => {
        const inputConfig = config.inputs[index];
        if (inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE) {
          const resource = RESOURCES[input.resourceId];
          expenses += (resource.basePrice * input.amount) / recipe.productionTime;
        }
      });

      // Einnahmen aus Verkäufen
      income += (outputResource.basePrice * recipe.output.amount) / recipe.productionTime;
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
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: theme.palette.primary.main,
          height: 64,
          width: '100%',
          mt: 0,
          mx: 0,
          maxWidth: '100%',
          boxShadow: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: '64px !important', px: 4, width: '100%' }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#fff',
              fontFamily: theme.typography.fontFamily,
              ml: 2,
            }}
          >
            Industry Game
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mr: 2 }}>
            <PingIndicator />
            <Tooltip title="Einnahmen pro Ping">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  bgcolor: '#fff',
                  color: theme.palette.primary.main,
                  borderRadius: '16px',
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                }}
              >
                <MoneyIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>+{income}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Ausgaben pro Ping">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  bgcolor: '#fff',
                  color: theme.palette.primary.main,
                  borderRadius: '16px',
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                }}
              >
                <ExpensesIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>-{expenses}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Gewinn/Verlust pro Ping">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  bgcolor: '#fff',
                  color: theme.palette.primary.main,
                  borderRadius: '16px',
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                }}
              >
                <BalanceIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{balance >= 0 ? '+' : ''}{balance}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Aktuelles Guthaben">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  bgcolor: '#fff',
                  color: theme.palette.primary.main,
                  borderRadius: '16px',
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: '100px',
                  boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                }}
              >
                <MoneyIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>${credits.toLocaleString()}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Forschungspunkte">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  bgcolor: '#fff',
                  color: theme.palette.primary.main,
                  borderRadius: '16px',
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: '100px',
                  boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                }}
              >
                <ScienceIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{researchPoints.toLocaleString()}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Lager öffnen">
              <Button
                sx={{
                  color: theme.palette.primary.main,
                  bgcolor: '#fff',
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 3,
                  py: 1,
                  boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                  '&:hover': {
                    bgcolor: '#FFE3C2',
                    borderColor: theme.palette.primary.light,
                  },
                }}
                startIcon={<Warehouse sx={{ color: theme.palette.primary.main }} />}
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
          width: "80vw",
          pt: "80px"
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
