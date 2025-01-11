import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../hooks/useTheme';

const DashboardLayout: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Header />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            minHeight: '100vh',
            backgroundColor: 'background.default',
            marginTop: '64px', // Add top margin to account for fixed header
          }}
        >
          <Outlet />
        </Box>
        <Toaster position="top-right" />
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;