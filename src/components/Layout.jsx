import {
  AccountBalance as BalanceIcon,
  MonetizationOn as MoneyIcon,
  ShoppingCart as ExpensesIcon,
  Factory,
  Menu as MenuIcon,
  Storage as StorageIcon,
  Warehouse,
  Help as HelpIcon,
  GitHub as GitHubIcon,
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
  { text: "Production", icon: <Factory />, path: "/production" },
  { text: "Storage", icon: <StorageIcon />, path: "/storage" },
  {
    text: 'Research',
    icon: <img src="/images/icons/Research.png" alt="Research" style={{ width: 24, height: 24, objectFit: 'contain', verticalAlign: 'middle' }} />,
    path: '/research'
  },
  {
    text: 'Tutorial',
    icon: <HelpIcon />,
    path: '/tutorial'
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

  // Hilfsfunktion für Bilanz wie in ProductionLines
  function calculateLineBalanceLogic(config, status) {
    if (!config?.recipe) return { balance: 0, balancePerPing: 0, totalBalance: 0 };
    const recipe = PRODUCTION_RECIPES[config.recipe];
    if (!recipe) return { balance: 0, balancePerPing: 0, totalBalance: 0 };
    // Prüfe Inputquellen
    const allInputsFromStock = recipe.inputs.every((input, idx) => {
      const inputConfig = config.inputs[idx];
      return inputConfig && inputConfig.source === INPUT_SOURCES.GLOBAL_STORAGE;
    });
    // Einkaufskosten nur für eingekaufte Inputs
    const purchaseCost = recipe.inputs.reduce((sum, input, idx) => {
      const inputConfig = config.inputs[idx];
      if (inputConfig && inputConfig.source === INPUT_SOURCES.PURCHASE_MODULE) {
        return sum + RESOURCES[input.resourceId].basePrice * input.amount;
      }
      return sum;
    }, 0);
    // Verkaufserlös
    const sellIncome = RESOURCES[recipe.output.resourceId].basePrice * recipe.output.amount;
    const isSelling = config?.outputTarget === OUTPUT_TARGETS.AUTO_SELL;
    const isStoring = config?.outputTarget === OUTPUT_TARGETS.GLOBAL_STORAGE;
    let balance = 0;
    if (allInputsFromStock && isStoring) {
      balance = 0;
    } else if (isSelling) {
      balance = sellIncome - purchaseCost;
    } else {
      balance = -purchaseCost;
    }
    // Per Ping
    const balancePerPing = recipe.productionTime > 0 ? Math.round((balance / recipe.productionTime) * 100) / 100 : 0;
    // Total (für die Summen-Box: nimm status?.totalPings, sonst 0)
    const totalBalance = status?.totalPings ? Math.round(balancePerPing * status.totalPings * 100) / 100 : balance;
    return { balance, balancePerPing, totalBalance };
  }

  // Summen für alle Linien berechnen (wie in ProductionLines)
  let totalBalance = 0;
  let totalPerPing = 0;
  productionLines.forEach(line => {
    const config = productionConfigs[line.id];
    const status = productionStatus[line.id];
    if (status?.isActive) {
      const { balancePerPing, balance: lineBalance } = calculateLineBalanceLogic(config, status);
      totalBalance += lineBalance;
      totalPerPing += balancePerPing;
    }
  });

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
            variant="h4"
            sx={{
              flexGrow: 1,
              fontSize: '1.65rem',
              fontWeight: 600,
              color: '#fff',
              ml: 2,
            }}
          >
            Industry Game
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mr: 2 }}>
            <PingIndicator />
            {/* Nur Bilanz pro Ping anzeigen */}
            <Tooltip title="Profit/Loss per Ping">
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
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{totalPerPing >= 0 ? '+' : ''}{totalPerPing.toFixed(2)}</Typography>
              </Box>
            </Tooltip>
            {/* Total Balance anzeigen */}
            <Tooltip title="Total Balance (all lines)">
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
                <BalanceIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{totalBalance >= 0 ? '+' : ''}{totalBalance.toFixed(2)}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Current Balance">
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
            <Tooltip title="Research Points">
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
                <img src="/images/icons/Research.png" alt="Research" style={{ width: 22, height: 22, objectFit: 'contain', verticalAlign: 'middle', filter: 'invert(22%) sepia(98%) saturate(7492%) hue-rotate(202deg) brightness(97%) contrast(101%)' }} />
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{researchPoints.toLocaleString()}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Open Storage">
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
            <Tooltip title="View on GitHub">
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
                startIcon={<GitHubIcon sx={{ color: theme.palette.primary.main }} />}
                onClick={() => window.open('https://github.com/SebastianChristoph/industrygame', '_blank')}
              >
                GitHub
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
