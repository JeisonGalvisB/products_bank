/**
 * Sidebar Component
 * Side navigation drawer with menu items
 */

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectDrawer } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import { ROLES } from '../../constants';

const Sidebar = ({ drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useSelector(selectDrawer);
  const user = useSelector(selectUser);

  // Check if user is admin
  const isAdmin = user?.rolId === ROLES.ADMIN.ID;

  // Menu items
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      show: true
    },
    {
      text: 'Ventas',
      icon: <ShoppingCartIcon />,
      path: '/sales',
      show: true
    },
    {
      text: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/users',
      show: isAdmin // Only show for admin
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box'
        }
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      {/* Logo/Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 64
        }}
      >
        <Typography variant="h6" color="primary" fontWeight="bold">
          Products Bank
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List>
        {menuItems
          .filter((item) => item.show)
          .map((item) => {
            const isSelected = location.pathname === item.path;

            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main'
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? 'inherit' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Usuario:
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {user?.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.rolNombre}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;