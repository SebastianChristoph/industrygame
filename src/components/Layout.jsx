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
  Memory as MemoryIcon,
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
  },
  {
    text: 'Browser Data',
    icon: <MemoryIcon />,
    path: '/storage-overview'
  }
];

const MobileStatsAndGitHub = ({ totalPerPing, totalBalance, researchPoints, theme }) => {
  const [openTooltip, setOpenTooltip] = useState(null);
  // Helper to handle tooltip open/close
  const handleTooltip = (name) => {
    if (openTooltip === name) {
      setOpenTooltip(null);
    } else {
      setOpenTooltip(name);
      setTimeout(() => {
        setOpenTooltip((current) => (current === name ? null : current));
      }, 2200);
    }
  };
  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 10,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        {/* Per Ping */}
        <Tooltip
          title="Profit/Loss per Ping"
          open={openTooltip === 'perPing'}
          onClose={() => setOpenTooltip(null)}
          disableHoverListener
          disableFocusListener
          placement="top"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              borderRadius: '16px',
              border: `1.5px solid ${theme.palette.primary.main}`,
              fontWeight: 600,
              fontSize: '0.95rem',
              minWidth: '70px',
              boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
              cursor: 'pointer',
            }}
            onClick={() => handleTooltip('perPing')}
          >
            <BalanceIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.95rem' }}>{totalPerPing >= 0 ? '+' : ''}{totalPerPing.toFixed(2)}</Typography>
          </Box>
        </Tooltip>
        {/* Total Balance */}
        <Tooltip
          title="Total Balance (all lines)"
          open={openTooltip === 'totalBalance'}
          onClose={() => setOpenTooltip(null)}
          disableHoverListener
          disableFocusListener
          placement="top"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              borderRadius: '16px',
              border: `1.5px solid ${theme.palette.primary.main}`,
              fontWeight: 600,
              fontSize: '0.95rem',
              minWidth: '70px',
              boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
              cursor: 'pointer',
            }}
            onClick={() => handleTooltip('totalBalance')}
          >
            <BalanceIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.95rem' }}>{totalBalance >= 0 ? '+' : ''}{totalBalance.toFixed(2)}</Typography>
          </Box>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        {/* Research Points */}
        <Tooltip
          title="Research Points"
          open={openTooltip === 'researchPoints'}
          onClose={() => setOpenTooltip(null)}
          disableHoverListener
          disableFocusListener
          placement="top"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              borderRadius: '16px',
              border: `1.5px solid ${theme.palette.primary.main}`,
              fontWeight: 600,
              fontSize: '0.95rem',
              minWidth: '70px',
              boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
              cursor: 'pointer',
            }}
            onClick={() => handleTooltip('researchPoints')}
          >
            <img src="/images/icons/Research.png" alt="Research" style={{ width: 22, height: 22, objectFit: 'contain', verticalAlign: 'middle' }} />
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.95rem' }}>{researchPoints.toLocaleString()}</Typography>
          </Box>
        </Tooltip>
      </Box>
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
          width: '100%',
        }}
        startIcon={<GitHubIcon sx={{ color: theme.palette.primary.main }} />}
        onClick={() => window.open('https://github.com/SebastianChristoph/industrygame', '_blank')}
      >
        GitHub
      </Button>
    </Box>
  );
};

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
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => {
                // Drawer nur auf Mobile schließen
                if (window.innerWidth < 600) setMobileOpen(false);
              }}
            >
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
        <Toolbar disableGutters sx={{ minHeight: '64px !important', px: { xs: 1, sm: 4 }, width: '100%' }}>
          {/* Burger-Menü für Mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 1,
              display: { xs: 'inline-flex', sm: 'none' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.2rem', sm: '1.65rem' },
              fontWeight: 600,
              color: '#fff',
              ml: { xs: 1, sm: 2 },
              whiteSpace: 'nowrap',
            }}
          >
            Industile 
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2, md: 2 },
              mr: { xs: 0.5, sm: 2, md: 2 },
              overflowX: { xs: 'auto', md: 'visible' },
              whiteSpace: { xs: 'nowrap', md: 'normal' },
              maxWidth: { xs: 'calc(100vw - 120px)', md: 'none' },
              '& > *': { flexShrink: 0 },
            }}
          >
            {/* Credits-Box immer sichtbar */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Current Balance">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.25, sm: 0.5 },
                    bgcolor: '#fff',
                    color: theme.palette.primary.main,
                    borderRadius: '16px',
                    border: `1.5px solid ${theme.palette.primary.main}`,
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    minWidth: { xs: '70px', sm: '100px' },
                    boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                  }}
                >
                  <MoneyIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                  <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>${credits.toLocaleString()}</Typography>
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              <PingIndicator />
              {/* Bilanz pro Ping und Total Balance nur ab md */}
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
                    border: `1.5px solid ${theme.palette.primary.main}`,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                  }}
                >
                  <BalanceIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                  <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{totalPerPing >= 0 ? '+' : ''}{totalPerPing.toFixed(2)}</Typography>
                </Box>
              </Tooltip>
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
                    border: `1.5px solid ${theme.palette.primary.main}`,
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
                    border: `1.5px solid ${theme.palette.primary.main}`,
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: '100px',
                    boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
                  }}
                >
                  <img src="/images/icons/Research.png" alt="Research" style={{ width: 22, height: 22, objectFit: 'contain', verticalAlign: 'middle' }} />
                  <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '1rem' }}>{researchPoints.toLocaleString()}</Typography>
                </Box>
              </Tooltip>
            </Box>
            {/* Storage & GitHub: nur ab md im Header sichtbar */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
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
              position: 'relative',
              pb: '120px', // Platz für Stats unten
            },
          }}
        >
          {drawer}
          <MobileStatsAndGitHub totalPerPing={totalPerPing} totalBalance={totalBalance} researchPoints={researchPoints} theme={theme} />
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
          ml: { xs: 0, sm: `${drawerWidth}px` },
          minHeight: '100vh',
          padding: { xs: 1, sm: 3 },
          width: { xs: '100vw', sm: `calc(100vw - ${drawerWidth}px)` },
          pt: '80px',
          boxSizing: 'border-box',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
