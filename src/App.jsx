import React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { PingProvider } from './context/PingContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Storage from './pages/Storage';
import ProductionLines from './pages/ProductionLines';
import ProductionLine from './pages/ProductionLine';
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
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="/storage" element={<Storage />} />
                <Route path="/production" element={<ProductionLines />} />
                <Route path="/production/:id" element={<ProductionLine />} />
                <Route path="/settings" element={<div>Settings Page</div>} />
                <Route path="/about" element={<div>About Page</div>} />
              </Route>
            </Routes>
          </Router>
        </div>
      </PingProvider>
    </ThemeProvider>
  )
}

export default App
