import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Tooltip, Typography } from '@mui/material';
import { handlePing } from '../store/gameSlice';

const BASE_PING_DURATION = 1000; // 1 Sekunde pro Ping
const UPDATE_INTERVAL = 50; // 50ms für smoothe Animation

export const PingIndicator = () => {
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const lastPingTime = useRef(0);
  const shouldPingRef = useRef(false);
  const productionSpeed = useSelector(state => state.game?.passiveBonuses?.productionSpeed ?? 1.0);

  // Berechne die aktuelle Ping-Dauer basierend auf dem Speed-Bonus
  const currentPingDuration = BASE_PING_DURATION / productionSpeed;
  const progressIncrement = (UPDATE_INTERVAL / currentPingDuration) * 100;

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
      const newProgress = prevProgress + progressIncrement;
      
      if (newProgress >= 100) {
        shouldPingRef.current = true;
        return 0;
      }
      return newProgress;
    });
  }, [progressIncrement]);

  useEffect(() => {
    const interval = setInterval(updateProgress, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [updateProgress]);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Tooltip title={`Production Speed: ${(productionSpeed * 100).toFixed(0)}%`}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={32}
          thickness={4}
          sx={{ color: '#2196f3' }}
        />
      </Tooltip>
    </Box>
  );
}; 