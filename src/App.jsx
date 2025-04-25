import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/about" element={<div>About Page</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
