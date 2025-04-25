import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, useTheme } from '@mui/material';
import { Home, Settings, Info, Warehouse, Factory } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const drawerWidth = 200;
  const theme = useTheme();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Lager', icon: <Warehouse />, path: '/storage' },
    { text: 'Produktion', icon: <Factory />, path: '/production' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'About', icon: <Info />, path: '/about' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: theme.palette.text.primary,
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Navbar; 