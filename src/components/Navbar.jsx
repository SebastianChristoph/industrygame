import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Home, Settings, Info, Warehouse } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const drawerWidth = 200;

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Lager', icon: <Warehouse />, path: '/storage' },
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
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Navbar; 