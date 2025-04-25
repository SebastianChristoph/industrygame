import React, { createContext, useContext, useState, useEffect } from 'react';

const PingContext = createContext();

export const usePing = () => {
  const context = useContext(PingContext);
  if (!context) {
    throw new Error('usePing must be used within a PingProvider');
  }
  return context;
};

export const PingProvider = ({ children }) => {
  const [pingCount, setPingCount] = useState(0);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPingCount(prev => prev + 1);
      // Notify all subscribers
      subscribers.forEach(callback => callback());
    }, 1000); // 1 second per ping

    return () => clearInterval(interval);
  }, [subscribers]);

  const subscribe = (callback) => {
    setSubscribers(prev => [...prev, callback]);
    return () => {
      setSubscribers(prev => prev.filter(cb => cb !== callback));
    };
  };

  return (
    <PingContext.Provider value={{ pingCount, subscribe }}>
      {children}
    </PingContext.Provider>
  );
}; 