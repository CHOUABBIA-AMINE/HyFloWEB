/**
 * Navbar Component
 * Top navigation bar with logo, app name, user actions, and language switcher
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 02-01-2026 - Added NotificationBadge for VALIDATOR users
 * @updated 01-26-2026 - Removed fixed username text, kept tooltip on avatar hover only
 * @updated 01-26-2026 - Added tooltip to display username/employee name on avatar hover
 * @updated 01-20-2026 - Display employee name (language-aware) and picture if available, fallback to username
 * @updated 12-27-2025
 */

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationBadge from './NotificationBadge';
import { EmployeeService } from '../../../modules/general/organization/services/EmployeeService';
import { FileService } from '../../../modules/system/utility/services';
import { EmployeeDTO } from '../../../modules/general/organization/dto/EmployeeDTO';

interface NavbarProps {
  onMenuClick: () => void;
  isAuthenticated?: boolean;
}

const Navbar = ({ onMenuClick, isAuthenticated = false }: NavbarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [employee, setEmployee] = useState<EmployeeDTO | null>(null);
  const [employeePicture, setEmployeePicture] = useState<string | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  // Check if user has VALIDATOR role
  const isValidator = useMemo(() => {
    const roles = user?.roles || [];
    return roles.includes('ROLE_VALIDATOR') || roles.includes('VALIDATOR');
  }, [user?.roles]);

  // Load employee data if user has employeeId
  useEffect(() => {
    const loadEmployee = async () => {
      if (!user?.employeeId) {
        setEmployee(null);
        setEmployeePicture(null);
        return;
      }

      try {
        setLoadingEmployee(true);
        const employeeData = await EmployeeService.getById(user.employeeId);
        setEmployee(employeeData);

        // Load employee picture if available
        if (employeeData.picture?.id) {
          try {
            const blobUrl = await FileService.getFileBlob(employeeData.picture.id);
            setEmployeePicture(blobUrl);
          } catch (err) {
            console.error('Failed to load employee picture:', err);
            setEmployeePicture(null);
          }
        } else {
          setEmployeePicture(null);
        }
      } catch (error) {
        console.error('Failed to load employee data:', error);
        setEmployee(null);
        setEmployeePicture(null);
      } finally {
        setLoadingEmployee(false);
      }
    };

    loadEmployee();
  }, [user?.employeeId]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (employeePicture && employeePicture.startsWith('blob:')) {
        URL.revokeObjectURL(employeePicture);
      }
    };
  }, [employeePicture]);

  // Get display name based on language and employee data
  const getDisplayName = (): string => {
    if (employee) {
      if (lang === 'ar') {
        const firstName = employee.firstNameAr || employee.firstNameLt || '';
        const lastName = employee.lastNameAr || employee.lastNameLt || '';
        return `${firstName} ${lastName}`.trim() || user?.username || 'User';
      } else {
        // For 'en' and 'fr', use Latin names
        const firstName = employee.firstNameLt || employee.firstNameAr || '';
        const lastName = employee.lastNameLt || employee.lastNameAr || '';
        return `${firstName} ${lastName}`.trim() || user?.username || 'User';
      }
    }
    // Fallback to username
    return user?.username || 'User';
  };

  // Get initials for avatar
  const getInitials = (): string => {
    const displayName = getDisplayName();
    const parts = displayName.split(' ').filter(Boolean);
    
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

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

        {/* Notification Badge - Only for VALIDATOR users */}
        {isAuthenticated && isValidator && <NotificationBadge />}

        {/* User Actions */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Tooltip title={getDisplayName()} arrow placement="bottom">
              <IconButton 
                color="inherit" 
                size="small" 
                onClick={handleMenuOpen}
                disabled={isLoggingOut || loadingEmployee}
              >
                {employeePicture ? (
                  <Avatar 
                    src={employeePicture} 
                    sx={{ width: 32, height: 32 }}
                    alt={getDisplayName()}
                  />
                ) : loadingEmployee ? (
                  <CircularProgress size={32} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                    {getInitials()}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
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
