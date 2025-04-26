import React from 'react'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { PingProvider } from './context/PingContext'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Storage from './pages/Storage';
import ProductionLines from './pages/ProductionLines';
import ProductionLine from './pages/ProductionLine';
import Research from './pages/Research';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PingProvider>
        <div className="app">
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/production" replace />} />
                <Route path="/storage" element={<Storage />} />
                <Route path="/production" element={<ProductionLines />} />
                <Route path="/production/:id" element={<ProductionLine />} />
                <Route path="/research" element={<Research />} />
              </Route>
            </Routes>
          </Router>
        </div>
      </PingProvider>
    </ThemeProvider>
  )
}

export default App
