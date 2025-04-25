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
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Factory,
  Storage as StorageIcon,
  Settings,
  Info,
  Warehouse,
  AttachMoney
} from '@mui/icons-material';
import { PingIndicator } from './PingIndicator';
import StorageDrawer from './StorageDrawer';

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
            <Chip
              icon={<AttachMoney />}
              label={credits}
              color="secondary"
              sx={{ 
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '& .MuiChip-icon': { 
                  color: 'secondary.contrastText' 
                }
              }}
            />
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