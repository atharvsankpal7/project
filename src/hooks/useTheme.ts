import { useMemo } from 'react';
import { createTheme } from '@mui/material';

export const useTheme = () => {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: '#2563eb', // Blue
          },
          secondary: {
            main: '#4f46e5', // Indigo
          },
          background: {
            default: '#f3f4f6', // Light gray
            paper: '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
              },
            },
          },
        },
      }),
    []
  );

  return { theme };
};