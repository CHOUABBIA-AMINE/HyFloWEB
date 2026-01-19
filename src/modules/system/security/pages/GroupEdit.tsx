/**
 * Group Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing groups
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Aligned with GroupDTO changes: users -> roles
 * @updated 01-19-2026 - Fixed Chip key prop warning in Autocomplete
 * @updated 01-18-2026 - Optimized to use common translation keys
 * @updated 01-08-2026 - Fixed type inference for users
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

      // Map to RoleOption format
      const roleOptions = rolesData.map((role: RoleDTO) => ({
        id: role.id,
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
    setGroup({ ...group, roles: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
            ? t('common.page.editTitle', { entity: t('group.title') })
            : t('common.page.createTitle', { entity: t('group.title') })
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('group.title') })
            : t('common.page.createSubtitle', { entity: t('group.title') })
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
                    value={group.roles || []}
                    onChange={handleRolesChange}
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
                            key={key}
                            label={option.name}
                            {...tagProps}
                            size="small"
                          />
                        );
                      })
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

                {group.roles && group.roles.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false}>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        {t('group.selectedRolesCount', { count: group.roles.length })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {group.roles.map((role) => (
                          <Chip
                            key={role.id}
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

export default GroupEdit;