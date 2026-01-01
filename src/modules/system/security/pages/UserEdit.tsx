/**
 * User Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing users
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-23-2025
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
  Stack,
  Chip,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { userService, roleService, groupService } from '../services';
import { UserDTO, RoleDTO, GroupDTO } from '../dto';

const UserEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = !!userId;

  // Form state
  const [user, setUser] = useState<Partial<UserDTO>>({
    username: '',
    email: '',
    enabled: true,
    roles: [],
    groups: [],
  });

  // Password state (only for create mode)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Available options
  const [availableRoles, setAvailableRoles] = useState<RoleDTO[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupDTO[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load roles and groups
      const [rolesData, groupsData] = await Promise.all([
        roleService.getAll().catch(() => []),
        groupService.getAll().catch(() => []),
      ]);

      // Handle different response formats
      const roles = Array.isArray(rolesData) ? rolesData : (rolesData?.data || rolesData?.content || []);
      const groups = Array.isArray(groupsData) ? groupsData : (groupsData?.data || groupsData?.content || []);

      setAvailableRoles(roles);
      setAvailableGroups(groups);

      // Load user if editing
      if (isEditMode) {
        const userData = await userService.getById(Number(userId));
        setUser(userData);
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!user.username || user.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      errors.email = 'Valid email is required';
    }

    // Password validation (only for create mode)
    if (!isEditMode) {
      if (!password || password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof UserDTO) => (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setUser({ ...user, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleRolesChange = (_event: any, newValue: RoleDTO[]) => {
    setUser({ ...user, roles: newValue });
  };

  const handleGroupsChange = (_event: any, newValue: GroupDTO[]) => {
    setUser({ ...user, groups: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const userData: any = {
        ...user,
        // Convert role/group objects to IDs if needed
        roleIds: user.roles?.map(r => r.id),
        groupIds: user.groups?.map(g => g.id),
      };

      // Add password for create mode
      if (!isEditMode) {
        userData.password = password;
      }

      if (isEditMode) {
        await userService.update(Number(userId), userData);
      } else {
        await userService.create(userData);
      }

      navigate('/security/users');
    } catch (err: any) {
      console.error('Failed to save user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/security/users');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isEditMode ? t('user.editUser') : t('user.createUser')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update user information and permissions' : 'Create a new user account'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('user.username')}
                    value={user.username || ''}
                    onChange={handleChange('username')}
                    required
                    disabled={isEditMode}
                    error={!!validationErrors.username}
                    helperText={validationErrors.username || (isEditMode ? 'Username cannot be changed' : '')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('user.email')}
                    type="email"
                    value={user.email || ''}
                    onChange={handleChange('email')}
                    required
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.enabled || false}
                        onChange={handleChange('enabled')}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {t('user.enabled')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.enabled ? 'User can login and access the system' : 'User account is disabled'}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Password (Create Mode Only) */}
          {!isEditMode && (
            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Password
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('auth.password')}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors({ ...validationErrors, password: '' });
                        }
                      }}
                      required
                      error={!!validationErrors.password}
                      helperText={validationErrors.password || 'Minimum 8 characters'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (validationErrors.confirmPassword) {
                          setValidationErrors({ ...validationErrors, confirmPassword: '' });
                        }
                      }}
                      required
                      error={!!validationErrors.confirmPassword}
                      helperText={validationErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}

          {/* Roles & Groups */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Roles & Groups
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={availableRoles}
                    getOptionLabel={(option) => option.name}
                    value={user.roles || []}
                    onChange={handleRolesChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('user.roles')}
                        placeholder="Select roles"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={availableGroups}
                    getOptionLabel={(option) => option.name}
                    value={user.groups || []}
                    onChange={handleGroupsChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('user.groups')}
                        placeholder="Select groups"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          size="small"
                          variant="outlined"
                        />
                      ))
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Actions */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
                size="large"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                size="large"
                sx={{ minWidth: 150 }}
              >
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default UserEdit;
