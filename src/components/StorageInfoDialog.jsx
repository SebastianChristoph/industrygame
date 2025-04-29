import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Storage as StorageIcon,
  Factory as FactoryIcon,
  Science as ScienceIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const StorageInfoDialog = ({ open, onClose, onAccept }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Local Storage Information</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This game uses your browser's local storage to save your progress. This means:
        </DialogContentText>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            You can easily view and <b>delete all your data</b> at any time via the navigation item <b>"Your Browser Data"</b>!
          </Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemIcon>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Your game data is stored locally in your browser"
              secondary="No data is sent to any server"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="All production lines and their status are saved"
              secondary="Including current progress and configurations"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ScienceIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Research progress is preserved"
              secondary="Including unlocked modules and technologies"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <BalanceIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Resources and credits are saved"
              secondary="Including storage levels and upgrades"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TrendingUpIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Statistics and history are tracked"
              secondary="Including production and profit data"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          Note: Clearing your browser data will delete your game progress. You can view your stored data in the "Your Browser Data" page.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onAccept} variant="contained" color="primary">
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageInfoDialog; 