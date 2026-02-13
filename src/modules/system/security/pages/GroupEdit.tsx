/**
 * Group Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing groups
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Fixed TypeScript errors: Handle optional id in DTOs
 * @updated 01-19-2026 - Fixed duplicate key warning by using role.id for Chip keys
 * @updated 01-19-2026 - Aligned with GroupDTO changes: users -> roles
 * @updated 01-19-2026 - Fixed Chip key prop warning in Autocomplete
 * @updated 01-18-2026 - Optimized to use common translation keys
 * @updated 01-08-2026 - Fixed type inference for users
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
import { groupService, roleService } from '../services';
import { GroupDTO, RoleDTO } from '../dto';

interface RoleOption {
  id: number;
  name: string;
  description?: string;
}

const GroupEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const isEditMode = !!groupId;

  // Form state
  const [group, setGroup] = useState<Partial<GroupDTO>>({
    name: '',
    description: '',
    roles: [],
  });

  // Available options
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load roles with explicit type
      const rolesData = await roleService.getAll().catch(() => [] as RoleDTO[]);

      // Map to RoleOption format, filtering out items without id
      const roleOptions: RoleOption[] = rolesData
        .filter((role: RoleDTO) => role.id !== undefined)
        .map((role: RoleDTO) => ({
          id: role.id!,
          name: role.name,
          description: role.description,
        }));

      setAvailableRoles(roleOptions);

      // Load group if editing
      if (isEditMode) {
        const groupData = await groupService.getById(Number(groupId));
        setGroup(groupData);
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
    if (!group.name || group.name.trim().length < 2) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 2 });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof GroupDTO) => (e: any) => {
    const value = e.target.value;
    setGroup({ ...group, [field]: value });
    
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
    setGroup({ ...group, roles: roleDTOs });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const groupData: any = {
        ...group,
        // Convert role objects to IDs if needed
        roleIds: group.roles?.map(r => r.id),
      };

      if (isEditMode) {
        await groupService.update(Number(groupId), groupData);
      } else {
        await groupService.create(groupData);
      }

      navigate('/security/groups');
    } catch (err: any) {
      console.error('Failed to save group:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/security/groups');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Convert group.roles to RoleOption[] for the Autocomplete component
  const selectedRoles: RoleOption[] = (group.roles || [])
    .filter(role => role.id !== undefined)
    .map(role => ({
      id: role.id!,
      name: role.name,
      description: role.description,
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
                  ? t('common.page.editTitle', { entity: t('group.title') })
                  : t('common.page.createTitle', { entity: t('group.title') })
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode 
                  ? t('common.page.editSubtitle', { entity: t('group.title') })
                  : t('common.page.createSubtitle', { entity: t('group.title') })
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
                    value={group.name || ''}
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
                    value={group.description || ''}
                    onChange={handleChange('description')}
                    multiline
                    rows={3}
                    placeholder={t('group.descriptionPlaceholder')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Roles */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('group.roles')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
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
                        label={t('group.roles')}
                        placeholder={t('group.selectRoles')}
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
                    renderOption={(props, option) => (
                      <li {...props} key={`role-option-${option.id}`}>
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

                {selectedRoles && selectedRoles.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false}>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        {t('group.selectedRolesCount', { count: selectedRoles.length })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {selectedRoles.map((role) => (
                          <Chip
                            key={`selected-role-${role.id}`}
                            label={role.name}
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

export default GroupEdit;
