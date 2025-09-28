import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Favorite,
  Search,
  Message,
  Person,
  Notifications,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const profileMenuItems = [
    { label: 'My Profile', action: () => navigate('/profile'), icon: <Person /> },
    { label: 'Messages', action: () => navigate('/messages'), icon: <Message /> },
    { label: 'Search', action: () => navigate('/search'), icon: <Search /> },
    { label: 'Subscription', action: () => navigate('/subscription'), icon: <Favorite /> },
    { label: 'Logout', action: handleLogout, icon: <Logout /> },
  ];

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar>
        {/* Logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            mr: 2 
          }}
          onClick={() => navigate('/')}
        >
          <Favorite sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Matrimony Test
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Navigation */}
        {!isMobile && isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<Search />}
              onClick={() => navigate('/search')}
            >
              Search
            </Button>
            <IconButton color="inherit" onClick={() => navigate('/messages')}>
              <Badge badgeContent={4} color="error">
                <Message />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={2} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Box>
        )}

        {/* User Profile Menu or Login Buttons */}
        {isAuthenticated ? (
          <Box sx={{ ml: 2 }}>
            <IconButton
              onClick={isMobile ? handleMobileMenuOpen : handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar 
                src={user?.photos?.find(p => p.isProfile)?.url} 
                sx={{ width: 32, height: 32 }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ 
                borderColor: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Login
            </Button>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => navigate('/register')}
            >
              Register Free
            </Button>
          </Box>
        )}

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
              },
            },
          }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.membershipType} Member
              </Typography>
            </Box>
          )}
          {profileMenuItems.map((item, index) => (
            <MenuItem key={index} onClick={item.action}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.icon}
                {item.label}
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          onClick={handleMobileMenuClose}
        >
          {isAuthenticated && profileMenuItems.map((item, index) => (
            <MenuItem key={index} onClick={item.action}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.icon}
                {item.label}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;