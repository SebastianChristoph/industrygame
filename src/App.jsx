import React from 'react'
import './App.css'
import { PingProvider } from './context/PingContext'
import { PingIndicator } from './components/PingIndicator'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Storage from './pages/Storage';

function App() {
  return (
    <PingProvider>
      <div className="app">
        <PingIndicator />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/settings" element={<div>Settings Page</div>} />
              <Route path="/about" element={<div>About Page</div>} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </PingProvider>
  )
}

export default App
