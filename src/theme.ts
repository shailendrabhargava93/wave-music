import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#00BCD4', // Teal/Cyan color from image
        light: '#4DD0E1',
        dark: '#0097A7',
      },
      secondary: {
        main: isDark ? '#ffffff' : '#37474F',
      },
      background: {
        default: isDark ? '#0A1929' : '#FFFFFF',
        paper: isDark ? '#1A2332' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#ffffff' : '#1A2027',
        secondary: isDark ? '#B2BAC2' : '#5F6368',
      },
    },
    typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  });
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
