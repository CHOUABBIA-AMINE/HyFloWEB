/**
 * User Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing users
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Fixed TypeScript errors: Handle optional id in DTOs
 * @updated 01-18-2026 - Optimized to use common translation keys
 * @updated 01-06-2026 - Enhanced with professional UI and role/group management
 * @created 12-22-2025
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Stack,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { userService, roleService, groupService } from '../services';
import { UserDTO, RoleDTO, GroupDTO } from '../dto';

interface RoleOption {
  id: number;
  name: string;
  description?: string;
}

interface GroupOption {
  id: number;
  name: string;
  description?: string;
}

const UserEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = !!userId;

  // Form state
  const [user, setUser] = useState<Partial<UserDTO>>({
    username: '',
    email: '',
    password: '',
    enabled: true,
    roles: [],
    groups: [],
  });

  // Available options
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupOption[]>([]);

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
        roleService.getAll().catch(() => [] as RoleDTO[]),
        groupService.getAll().catch(() => [] as GroupDTO[]),
      ]);

      // Map to option formats, filtering out items without id
      const roleOptions: RoleOption[] = rolesData
        .filter((role: RoleDTO) => role.id !== undefined)
        .map((role: RoleDTO) => ({
          id: role.id!,
          name: role.name,
          description: role.description,
        }));

      const groupOptions: GroupOption[] = groupsData
        .filter((group: GroupDTO) => group.id !== undefined)
        .map((group: GroupDTO) => ({
          id: group.id!,
          name: group.name,
          description: group.description,
        }));

      setAvailableRoles(roleOptions);
      setAvailableGroups(groupOptions);

      // Load user if editing
      if (isEditMode) {
        const userData = await userService.getById(Number(userId));
        setUser(userData);
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || t('common.errors.loadingDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!user.username || user.username.trim().length < 3) {
      errors.username = t('common.validation.minLength', { field: t('user.username'), min: 3 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      errors.email = t('common.validation.invalidEmail');
    }

    // Password validation (only for create mode)
    if (!isEditMode && (!user.password || user.password.length < 6)) {
      errors.password = t('common.validation.minLength', { field: t('user.password'), min: 6 });
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

  const handleRolesChange = (_event: any, newValue: RoleOption[]) => {
    // Convert RoleOption[] to RoleDTO[] for the DTO
    const roleDTOs: RoleDTO[] = newValue.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
    }));
    setUser({ ...user, roles: roleDTOs });
  };

  const handleGroupsChange = (_event: any, newValue: GroupOption[]) => {
    // Convert GroupOption[] to GroupDTO[] for the DTO
    const groupDTOs: GroupDTO[] = newValue.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
    }));
    setUser({ ...user, groups: groupDTOs });
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
        roleIds: user.roles?.map(r => r.id),
        groupIds: user.groups?.map(g => g.id),
      };

      if (isEditMode) {
        await userService.update(Number(userId), userData);
      } else {
        await userService.create(userData);
      }

      navigate('/security/users');
    } catch (err: any) {
      console.error('Failed to save user:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
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

  // Convert DTOs to Option types for Autocomplete components
  const selectedRoles: RoleOption[] = (user.roles || [])
    .filter(role => role.id !== undefined)
    .map(role => ({
      id: role.id!,
      name: role.name,
      description: role.description,
    }));

  const selectedGroups: GroupOption[] = (user.groups || [])
    .filter(group => group.id !== undefined)
    .map(group => ({
      id: group.id!,
      name: group.name,
      description: group.description,
    }));

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
          {isEditMode 
            ? t('common.page.editTitle', { entity: t('user.title') })
            : t('common.page.createTitle', { entity: t('user.title') })
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('user.title') })
            : t('common.page.createSubtitle', { entity: t('user.title') })
          }
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
                {t('common.sections.basicInformation')}
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
                    error={!!validationErrors.username}
                    helperText={validationErrors.username}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label={t('user.email')}
                    value={user.email || ''}
                    onChange={handleChange('email')}
                    required
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                  />
                </Grid>

                {!isEditMode && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label={t('user.password')}
                      value={user.password || ''}
                      onChange={handleChange('password')}
                      required
                      error={!!validationErrors.password}
                      helperText={validationErrors.password}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.enabled || false}
                        onChange={handleChange('enabled')}
                      />
                    }
                    label={t('user.enabled')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Roles */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('user.roles')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Autocomplete
                multiple
                options={availableRoles}
                getOptionLabel={(option) => option.name}
                value={selectedRoles}
                onChange={handleRolesChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('user.selectRoles')}
                    placeholder={t('user.selectRolesPlaceholder')}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={`role-chip-${option.id}`}
                        label={option.name}
                        {...tagProps}
                        size="small"
                      />
                    );
                  })
                }
              />
            </Box>
          </Paper>

          {/* Groups */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('user.groups')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Autocomplete
                multiple
                options={availableGroups}
                getOptionLabel={(option) => option.name}
                value={selectedGroups}
                onChange={handleGroupsChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('user.selectGroups')}
                    placeholder={t('user.selectGroupsPlaceholder')}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={`group-chip-${option.id}`}
                        label={option.name}
                        {...tagProps}
                        size="small"
                      />
                    );
                  })
                }
              />
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
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default UserEdit;
