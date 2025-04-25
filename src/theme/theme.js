import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c62828', // Deep red for primary actions
      light: '#ff5f52',
      dark: '#8e0000',
    },
    secondary: {
      main: '#37474f', // Blue grey for secondary elements
      light: '#62727b',
      dark: '#102027',
    },
    background: {
      default: '#1c2025', // Dark background like in the game
      paper: '#262b32',   // Slightly lighter for cards/elements
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    success: {
      main: '#4caf50', // Green for positive numbers/growth
      light: '#80e27e',
    },
    error: {
      main: '#f44336', // Red for negative numbers/loss
      light: '#ff7961',
    }
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1c2025',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Sharp edges like in the industrial design
          textTransform: 'none',
        },
      },
    },
  },
  shape: {
    borderRadius: 0, // Sharp edges throughout the app
  },
}); 