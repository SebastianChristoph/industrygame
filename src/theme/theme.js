import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9d', // Bright green accent color
      light: '#4affa5',
      dark: '#00cc7d',
    },
    secondary: {
      main: '#424242', // Industrial gray
      light: '#6d6d6d',
      dark: '#1b1b1b',
    },
    background: {
      default: '#1a1a1a', // Very dark background
      paper: '#242424',   // Slightly lighter dark for cards/elements
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#00ff9d', // Green accent for secondary text
    },
    success: {
      main: '#00ff9d', // Green for positive indicators
      light: '#4affa5',
    },
    error: {
      main: '#ff4444', // Bright red for errors
      light: '#ff6b6b',
    }
  },
  typography: {
    fontFamily: [
      'Roboto Mono',
      'monospace'
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      color: '#00ff9d',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      color: '#00ff9d',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#00ff9d',
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
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid #00ff9d',
          backgroundColor: '#242424',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
        },
        contained: {
          backgroundColor: '#00ff9d',
          color: '#1a1a1a',
          '&:hover': {
            backgroundColor: '#4affa5',
          },
          '&.Mui-disabled': {
            backgroundColor: '#424242',
            color: '#666666',
          },
          '&.MuiButton-containedError': {
            backgroundColor: '#ff4444',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#ff6b6b',
            },
          },
        },
        outlined: {
          border: '1px solid #00ff9d',
          color: '#00ff9d',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
            borderColor: '#4affa5',
          },
          '&.Mui-disabled': {
            borderColor: '#424242',
            color: '#666666',
          },
          '&.MuiButton-outlinedError': {
            borderColor: '#ff4444',
            color: '#ff4444',
            '&:hover': {
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              borderColor: '#ff6b6b',
            },
          },
        },
        text: {
          color: '#00ff9d',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
          },
          '&.Mui-disabled': {
            color: '#666666',
          },
          '&.MuiButton-textError': {
            color: '#ff4444',
            '&:hover': {
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#00ff9d',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
          },
          '&.Mui-disabled': {
            color: '#666666',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 2, // Sharp corners for industrial look
  },
}); 