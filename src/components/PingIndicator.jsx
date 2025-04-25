import React from 'react';
import { usePing } from '../context/PingContext';
import './PingIndicator.css';

export const PingIndicator = () => {
  const { pingCount } = usePing();

  return (
    <div className="ping-indicator">
      <div className="ping-circle" />
      <span className="ping-count">Ping: {pingCount}</span>
    </div>
  );
}; 