import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Toolbar } from '@mui/material';
import { Award, FileCheck, BarChart2, Settings, Users, FileText, Home } from 'lucide-react';
import { RootState } from '../../store';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'issuer':
        return [
          { text: 'Dashboard', icon: <Home size={20} />, path: '/issuer' },
          { text: 'Issue Certificate', icon: <Award size={20} />, path: '/issuer/issue' },
          { text: 'Templates', icon: <FileText size={20} />, path: '/issuer/templates' },
          { text: 'Analytics', icon: <BarChart2 size={20} />, path: '/issuer/analytics' }
        ];
      case 'candidate':
        return [
          { text: 'Dashboard', icon: <Home size={20} />, path: '/candidate' },
          { text: 'My Certificates', icon: <Award size={20} />, path: '/candidate/certificates' },
          { text: 'Access Control', icon: <Users size={20} />, path: '/candidate/access' }
        ];
      case 'organization':
        return [
          { text: 'Dashboard', icon: <Home size={20} />, path: '/organization' },
          { text: 'Verify Certificate', icon: <FileCheck size={20} />, path: '/organization/verify' },
          { text: 'Analytics', icon: <BarChart2 size={20} />, path: '/organization/analytics' }
        ];
      default:
        return [];
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {getMenuItems().map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <List sx={{ mt: 'auto', position: 'absolute', bottom: 0, width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate(`/${user?.role}/settings`)}>
              <ListItemIcon>
                <Settings size={20} />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;