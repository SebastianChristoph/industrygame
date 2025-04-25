import { Box } from '@mui/material';
import Navbar from './Navbar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', pt: '64px' }}>
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
            ml: { xs: 7, sm: 30 }, // Space for navbar, responsive
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 