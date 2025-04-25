import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Forest green for primary actions
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#795548', // Brown for secondary elements
      light: '#a1887f',
      dark: '#4b2c20',
    },
    background: {
      default: '#f5f5dc', // Light beige background
      paper: '#ffffff',   // White for cards/elements
    },
    text: {
      primary: '#2e7d32', // Green text for primary
      secondary: '#795548', // Brown for secondary text
    },
    success: {
      main: '#2e7d32', // Green for positive indicators
      light: '#4caf50',
    },
    error: {
      main: '#c62828', // Keep red for errors/negative indicators
      light: '#ff5f52',
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
          backgroundColor: '#f5f5dc',
          color: '#2e7d32',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid #2e7d32',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Slightly rounded corners like in the screenshot
          textTransform: 'none',
          border: '1px solid #2e7d32',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#2e7d32',
        },
      },
    },
  },
  shape: {
    borderRadius: 4, // Slightly rounded corners throughout the app
  },
}); 