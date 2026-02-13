/**
 * Role Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing roles
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Fixed TypeScript errors: Handle optional id in DTOs
 * @updated 01-18-2026 - Optimized to use common translation keys
 * @updated 01-06-2026 - Enhanced with professional UI and autocomplete for permissions
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 * @created 12-23-2025
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Stack,
  Chip,
  Autocomplete,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { roleService, permissionService } from '../services';
import { RoleDTO, PermissionDTO } from '../dto';

interface PermissionOption {
  id: number;
  name: string;
  description?: string;
}

const RoleEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const isEditMode = !!roleId;

  // Form state
  const [role, setRole] = useState<Partial<RoleDTO>>({
    name: '',
    description: '',
    permissions: [],
  });

  // Available options
  const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load permissions
      const permissionsData = await permissionService.getAll().catch(() => [] as PermissionDTO[]);
      
      // Map to PermissionOption format, filtering out items without id
      const permissionOptions: PermissionOption[] = permissionsData
        .filter((perm: PermissionDTO) => perm.id !== undefined)
        .map((perm: PermissionDTO) => ({
          id: perm.id!,
          name: perm.name,
          description: perm.description,
        }));
      
      setAvailablePermissions(permissionOptions);

      // Load role if editing
      if (isEditMode) {
        const roleData = await roleService.getById(Number(roleId));
        setRole(roleData);
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

    // Name validation
    if (!role.name || role.name.trim().length < 2) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 2 });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof RoleDTO) => (e: any) => {
    const value = e.target.value;
    setRole({ ...role, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handlePermissionsChange = (_event: any, newValue: PermissionOption[]) => {
    // Convert PermissionOption[] to PermissionDTO[] for the DTO
    const permissionDTOs: PermissionDTO[] = newValue.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
    }));
    setRole({ ...role, permissions: permissionDTOs });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const roleData: any = {
        ...role,
        // Convert permission objects to IDs if needed
        permissionIds: role.permissions?.map(p => p.id),
      };

      if (isEditMode) {
        await roleService.update(Number(roleId), roleData);
      } else {
        await roleService.create(roleData);
      }

      navigate('/security/roles');
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/security/roles');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Convert role.permissions to PermissionOption[] for the Autocomplete component
  const selectedPermissions: PermissionOption[] = (role.permissions || [])
    .filter(perm => perm.id !== undefined)
    .map(perm => ({
      id: perm.id!,
      name: perm.name,
      description: perm.description,
    }));

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {isEditMode 
                  ? t('common.page.editTitle', { entity: t('role.title') })
                  : t('common.page.createTitle', { entity: t('role.title') })
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode 
                  ? t('common.page.editSubtitle', { entity: t('role.title') })
                  : t('common.page.createSubtitle', { entity: t('role.title') })
                }
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('common.cancel')}>
                <IconButton 
                  onClick={handleCancel} 
                  disabled={saving}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.save')}>
                <IconButton 
                  onClick={() => handleSubmit()} 
                  disabled={saving}
                  size="medium"
                  color="primary"
                >
                  {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

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
                    label={t('common.fields.name')}
                    value={role.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('common.fields.nameHelper')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('common.fields.description')}
                    value={role.description || ''}
                    onChange={handleChange('description')}
                    multiline
                    rows={3}
                    placeholder={t('role.descriptionPlaceholder')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Permissions */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('role.permissions')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={availablePermissions}
                    getOptionLabel={(option) => option.name}
                    value={selectedPermissions}
                    onChange={handlePermissionsChange}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('role.permissions')}
                        placeholder={t('role.selectPermissions')}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={`permission-chip-${option.id}`}
                            label={option.name}
                            {...tagProps}
                            size="small"
                          />
                        );
                      })
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={`permission-option-${option.id}`}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {option.name}
                          </Typography>
                          {option.description && (
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    )}
                  />
                </Grid>

                {selectedPermissions && selectedPermissions.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false}>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        {t('role.selectedPermissionsCount', { count: selectedPermissions.length })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {selectedPermissions.map((permission) => (
                          <Chip
                            key={`selected-permission-${permission.id}`}
                            label={permission.name}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default RoleEdit;
