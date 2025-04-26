import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF7A00', // Orange
      light: '#FFA94D',
      dark: '#C85000',
      contrastText: '#fff',
    },
    secondary: {
      main: '#3B6FF5', // Blau
      light: '#5A8CFF',
      dark: '#2546B8',
      contrastText: '#fff',
    },
    background: {
      default: '#F7FAFF', // Sehr helles Grau/Weiß
      paper: '#F4F7FB',   // Cards
    },
    text: {
      primary: '#1A2330', // Sehr dunkles Blau/Grau
      secondary: '#3B6FF5', // Blau für Akzente
      disabled: '#A0AEC0',
    },
    divider: '#E3EAF2',
    success: {
      main: '#00C48C',
      contrastText: '#fff',
    },
    error: {
      main: '#FF4D4F',
      contrastText: '#fff',
    },
    warning: {
      main: '#FFB020',
      contrastText: '#fff',
    },
    info: {
      main: '#3B6FF5',
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
      fontFamily: ['Victor Mono', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '3rem',
      fontWeight: 700,
      color: '#1A2330',
    },
    h2: {
      fontFamily: ['Victor Mono', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '2.2rem',
      fontWeight: 600,
      color: '#1A2330',
    },
    h3: {
      fontFamily: ['Victor Mono', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.7rem',
      fontWeight: 600,
      color: '#1A2330',
    },
    h4: {
      fontFamily: ['Victor Mono', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1A2330',
    },
    h5: {
      fontFamily: ['Victor Mono', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.3rem',
      fontWeight: 600,
      color: '#1A2330',
    },
    h6: {
      fontFamily: ['Victor Mono', 'Roboto', 'Arial', 'sans-serif'].join(','),
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#1A2330',
    },
    body1: {
      fontSize: '1rem',
      color: '#1A2330',
    },
    body2: {
      fontSize: '0.95rem',
      color: '#3B6FF5',
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
          backgroundColor: '#F7FAFF',
          color: '#1A2330',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.08)',
          borderRadius: 16,
          border: '1px solid #E3EAF2',
          backgroundColor: '#F4F7FB',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '1rem',
          padding: '8px 24px',
          boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.08)',
        },
        contained: {
          backgroundColor: '#FF7A00',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#FFA94D',
          },
        },
        outlined: {
          border: '2px solid #FF7A00',
          color: '#FF7A00',
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(255, 122, 0, 0.08)',
            borderColor: '#FFA94D',
          },
        },
        text: {
          color: '#3B6FF5',
          '&:hover': {
            backgroundColor: 'rgba(59, 111, 245, 0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#3B6FF5',
          borderRadius: 10,
          '&:hover': {
            backgroundColor: 'rgba(59, 111, 245, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.08)',
          border: '1px solid #E3EAF2',
          backgroundColor: '#F4F7FB',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.08)',
          border: '1px solid #E3EAF2',
        },
      },
    },
  },
  shape: {
    borderRadius: 16, // Mehr abgerundet
  },
}); 