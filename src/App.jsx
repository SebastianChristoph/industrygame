import React from 'react'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { PingProvider } from './context/PingContext'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Storage from './pages/Storage';
import ProductionLines from './pages/ProductionLines';
import ProductionLine from './pages/ProductionLine';
import Research from './pages/Research';
import Tutorial from './pages/Tutorial';
import StorageOverview from './pages/StorageOverview';
import { useState, useEffect } from 'react';
import StorageInfoDialog from './components/StorageInfoDialog';
import { theme } from './theme/theme';

function App() {
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [hasAcceptedStorage, setHasAcceptedStorage] = useState(false);

  // Check if user has already accepted storage info
  useEffect(() => {
    const accepted = localStorage.getItem('storageInfoAccepted');
    if (accepted) {
      setHasAcceptedStorage(true);
    }
  }, []);

  const handleStorageAccept = () => {
    localStorage.setItem('storageInfoAccepted', 'true');
    setHasAcceptedStorage(true);
    setShowStorageInfo(false);
  };

  const handleModuleClick = () => {
    if (!hasAcceptedStorage) {
      setShowStorageInfo(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PingProvider>
        <div className="app">
          <Router>
            <Routes>
              <Route element={<Layout onModuleClick={handleModuleClick} />}>
                <Route path="/" element={<Navigate to="/production" replace />} />
                <Route path="/storage" element={<Storage />} />
                <Route path="/production" element={<ProductionLines />} />
                <Route path="/production/:id" element={<ProductionLine />} />
                <Route path="/research" element={<Research />} />
                <Route path="/tutorial" element={<Tutorial />} />
                <Route path="/storage-overview" element={<StorageOverview />} />
              </Route>
            </Routes>
          </Router>
        </div>
        <StorageInfoDialog 
          open={showStorageInfo} 
          onClose={() => setShowStorageInfo(false)}
          onAccept={handleStorageAccept}
        />
      </PingProvider>
    </ThemeProvider>
  )
}

export default App
