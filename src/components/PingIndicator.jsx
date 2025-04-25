import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Tooltip } from '@mui/material';
import { handlePing } from '../store/gameSlice';

const PING_DURATION = 1000; // 1 Sekunde pro Ping
const UPDATE_INTERVAL = 50; // 50ms für smoothe Animation
const PROGRESS_INCREMENT = (UPDATE_INTERVAL / PING_DURATION) * 100;

export const PingIndicator = () => {
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const lastPingTime = useRef(0);
  const shouldPingRef = useRef(false);

  useEffect(() => {
    if (shouldPingRef.current) {
      const now = Date.now();
      if (now - lastPingTime.current >= 500) {
        dispatch(handlePing());
        lastPingTime.current = now;
      }
      shouldPingRef.current = false;
    }
  }, [progress, dispatch]);

  const updateProgress = useCallback(() => {
    setProgress(prevProgress => {
      const newProgress = prevProgress + PROGRESS_INCREMENT;
      
      if (newProgress >= 100) {
        shouldPingRef.current = true;
        return 0;
      }
      return newProgress;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateProgress, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [updateProgress]);

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16,
      bgcolor: 'background.paper',
      p: 1,
      borderRadius: '50%',
      boxShadow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'rotate(-90deg)' // Startet bei 12 Uhr
    }}>
      <Tooltip title="Zeit bis zum nächsten Ping" placement="left">
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={24}
            sx={{
              color: '#fff',
              opacity: 0.2
            }}
          />
          <CircularProgress
            variant="determinate"
            value={progress}
            size={24}
            sx={{
              color: 'primary.main',
              position: 'absolute',
              left: 0,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                transition: 'stroke-dashoffset 50ms linear', // Macht die Animation smooth
              },
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}; 