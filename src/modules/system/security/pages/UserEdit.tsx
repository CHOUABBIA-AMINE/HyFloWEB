/**
 * User Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing users
 * 
 * @author CHOUABBIA Amine
 * @updated 01-20-2026 - Updated to align with new UserDTO structure (employee relationship)
 * @updated 01-19-2026 - Fixed password field and DTO type alignment
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
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { EmployeeService } from '../../../general/organization/services/EmployeeService';

// Extended UserDTO for form state (includes password for creation)
interface UserFormData extends Partial<UserDTO> {
  password?: string;
}

const UserEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = !!userId;

  // Form state with password field for creation
  const [user, setUser] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    enabled: true,
    accountNonExpired: true,
    accountNonLocked: true,
    credentialsNonExpired: true,
    employeeId: undefined,
    roles: [],
    groups: [],
  });

  // Available options
  const [availableRoles, setAvailableRoles] = useState<RoleDTO[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupDTO[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDTO[]>([]);

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
      
      // Load roles, groups, and employees
      const [rolesData, groupsData, employeesData] = await Promise.all([
        roleService.getAll().catch(() => [] as RoleDTO[]),
        groupService.getAll().catch(() => [] as GroupDTO[]),
        EmployeeService.getAllNoPagination().catch(() => [] as EmployeeDTO[]),
      ]);

      setAvailableRoles(rolesData);
      setAvailableGroups(groupsData);
      setAvailableEmployees(employeesData);

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
      errors.email = t('common.validation.emailInvalid');
    }

    // Password validation (only for create mode)
    if (!isEditMode && (!user.password || user.password.length < 6)) {
      errors.password = t('common.validation.minLength', { field: t('user.password'), min: 6 });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof UserFormData) => (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setUser({ ...user, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleEmployeeChange = (_event: any, newValue: EmployeeDTO | null) => {
    setUser({ 
      ...user, 
      employeeId: newValue?.id,
      employee: newValue || undefined,
    });
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

      const userData: UserDTO = {
        username: user.username!,
        email: user.email!,
        enabled: user.enabled,
        accountNonExpired: user.accountNonExpired,
        accountNonLocked: user.accountNonLocked,
        credentialsNonExpired: user.credentialsNonExpired,
        employeeId: user.employeeId,
        roles: user.roles,
        groups: user.groups,
      };

      if (isEditMode) {
        await userService.update(Number(userId), userData);
      } else {
        // Include password only for creation
        const createData = { ...userData, password: user.password };
        await userService.create(createData);
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

  const getEmployeeLabel = (employee: EmployeeDTO): string => {
    const firstName = employee.firstNameLt || employee.firstNameAr || '';
    const lastName = employee.lastNameLt || employee.lastNameAr || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return employee.registrationNumber 
      ? `${employee.registrationNumber} - ${fullName}` 
      : fullName;
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
                    disabled={isEditMode}
                    error={!!validationErrors.username}
                    helperText={validationErrors.username || (isEditMode ? t('user.usernameCannotChange') : '')}
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

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={availableEmployees}
                    getOptionLabel={getEmployeeLabel}
                    value={user.employee || null}
                    onChange={handleEmployeeChange}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('employee.title')}
                        placeholder={t('user.selectEmployee') || 'Select employee'}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.enabled || false}
                          onChange={handleChange('enabled')}
                        />
                      }
                      label={t('user.enabled')}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                      {user.enabled ? t('user.enabledDescription') : t('user.disabledDescription')}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Roles & Groups */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('user.rolesAndGroups')}
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
                            key={key}
                            label={option.name}
                            {...tagProps}
                            size="small"
                          />
                        );
                      })
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
                            key={key}
                            label={option.name}
                            {...tagProps}
                            size="small"
                          />
                        );
                      })
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
