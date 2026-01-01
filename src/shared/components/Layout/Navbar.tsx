/**
 * Navbar Component
 * Top navigation bar with logo, app name, user actions, and language switcher
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-27-2025
 */

import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

interface NavbarProps {
  onMenuClick: () => void;
  isAuthenticated?: boolean;
}

const Navbar = ({ onMenuClick, isAuthenticated = false }: NavbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    // TODO: Navigate to settings page
    console.log('Navigate to settings');
  };

  const handleLogout = async () => {
    handleMenuClose();
    setIsLoggingOut(true);
    
    try {
      await logout();
      // Navigate to login after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout request fails
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
            disabled={isLoggingOut}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {!logoError ? (
            <Box
              component="img"
              src="/logo.svg"
              alt="IAAS Logo"
              sx={{
                height: 40,
                width: 'auto',
                maxWidth: 150,
                display: 'block',
                objectFit: 'contain',
              }}
              onError={(e: any) => {
                // Try PNG fallback
                if (e.target.src.endsWith('.svg')) {
                  e.target.src = '/logo.png';
                } else {
                  // Both failed, show icon fallback
                  setLogoError(true);
                }
              }}
            />
          ) : (
            // Fallback icon if no logo image is available
            <BusinessIcon 
              sx={{ 
                fontSize: 32, 
                color: 'primary.main' 
              }} 
            />
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              letterSpacing: '-0.01em',
            }}
          >
            {t('app.name')}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Actions */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              {user?.firstName || user?.username || 'User'}
            </Typography>
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={handleMenuOpen}
              disabled={isLoggingOut}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircleIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile} disabled={isLoggingOut}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('nav.profile')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleSettings} disabled={isLoggingOut}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('nav.settings')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <ListItemIcon>
                  {isLoggingOut ? (
                    <CircularProgress size={20} />
                  ) : (
                    <LogoutIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {isLoggingOut ? 'Logging out...' : t('auth.logout')}
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            startIcon={<AccountCircleIcon />}
            sx={{ ml: 2 }}
          >
            {t('auth.login')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
