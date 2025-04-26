import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C3E50', // Dunkles Blau
      light: '#3E5871',
      dark: '#1B2631',
      contrastText: '#fff',
    },
    secondary: {
      main: '#6C7A89', // Graublau
      light: '#95A5A6',
      dark: '#434A54',
      contrastText: '#fff',
    },
    background: {
      default: '#F4F6F8', // Helles Grau
      paper: '#FFFFFF',   // Cards
    },
    text: {
      primary: '#2C3E50', // Dunkles Blau
      secondary: '#6C7A89', // Graublau
      disabled: '#A0AEC0',
    },
    divider: '#E3EAF2',
    success: {
      main: '#27AE60',
      contrastText: '#fff',
    },
    error: {
      main: '#E74C3C',
      contrastText: '#fff',
    },
    warning: {
      main: '#F39C12', // Gedecktes Orange
      contrastText: '#fff',
    },
    info: {
      main: '#6C7A89',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '2.4rem',
      fontWeight: 700,
      color: '#2C3E50',
    },
    h2: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.8rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    h3: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.4rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    h4: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.2rem',
      fontWeight: 700,
      color: '#2C3E50',
    },
    h5: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    h6: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    body1: {
      fontSize: '1rem',
      color: '#2C3E50',
    },
    body2: {
      fontSize: '0.95rem',
      color: '#6C7A89',
    },
    button: {
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6F8',
          color: '#2C3E50',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)',
          borderRadius: 10,
          border: '1px solid #E3EAF2',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '1rem',
          padding: '8px 24px',
          boxShadow: 'none',
        },
        contained: {
          backgroundColor: '#2C3E50',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#F39C12',
            color: '#fff',
          },
        },
        outlined: {
          border: '2px solid #2C3E50',
          color: '#2C3E50',
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(44, 62, 80, 0.08)',
            borderColor: '#F39C12',
            color: '#2C3E50',
          },
        },
        text: {
          color: '#2C3E50',
          '&:hover': {
            backgroundColor: 'rgba(44, 62, 80, 0.08)',
            color: '#F39C12',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#6C7A89',
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(44, 62, 80, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)',
          border: '1px solid #E3EAF2',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)',
          border: '1px solid #E3EAF2',
        },
      },
    },
  },
  shape: {
    borderRadius: 10, // Dezenter abgerundet
  },
}); 