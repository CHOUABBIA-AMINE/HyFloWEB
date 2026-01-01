/**
 * Role Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing roles
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
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
      const permissionsData = await permissionService.getAll().catch(() => []);

      // Handle different response formats
      const permissions = Array.isArray(permissionsData) 
        ? permissionsData 
        : (permissionsData?.data || permissionsData?.content || []);

      setAvailablePermissions(permissions);

      // Load role if editing
      if (isEditMode) {
        const roleData = await roleService.getById(Number(roleId));
        setRole(roleData);
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

    // Name validation
    if (!role.name || role.name.trim().length < 2) {
      errors.name = 'Role name must be at least 2 characters';
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
    setRole({ ...role, permissions: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      setError(err.response?.data?.message || err.message || 'Failed to save role');
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
          {isEditMode ? t('role.editRole') : t('role.createRole')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update role information and permissions' : 'Create a new role with permissions'}
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
                    label={t('role.name')}
                    value={role.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('role.description')}
                    value={role.description || ''}
                    onChange={handleChange('description')}
                    multiline
                    rows={3}
                    placeholder="Describe the role and its purpose"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Permissions */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Permissions
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={availablePermissions}
                    getOptionLabel={(option) => option.name}
                    value={role.permissions || []}
                    onChange={handlePermissionsChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('role.permissions')}
                        placeholder="Select permissions"
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
                    renderOption={(props, option) => (
                      <li {...props}>
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

                {role.permissions && role.permissions.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false}>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        Selected Permissions: {role.permissions.length}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {role.permissions.map((permission) => (
                          <Chip
                            key={permission.id}
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

export default RoleEdit;
