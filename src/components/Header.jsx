import React from 'react';
import { AppBar, Box, Typography, Chip } from '@mui/material';
import { PingIndicator } from './PingIndicator';
import { useSelector } from 'react-redux';
import { AttachMoney } from '@mui/icons-material';

const Header = () => {
  const credits = useSelector(state => state.game.credits);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 3,
        py: 1,
        height: '64px'
      }}>
        <Typography variant="h6" color="text.primary">
          Industry Game
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PingIndicator />
          <Chip
            icon={<AttachMoney />}
            label={`${credits} Credits`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
    </AppBar>
  );
};

export default Header; 