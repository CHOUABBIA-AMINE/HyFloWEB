/**
 * Group Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing groups
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
import { groupService, userService } from '../services';
import { GroupDTO, UserDTO } from '../dto';

interface UserOption {
  id: number;
  username: string;
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
    users: [],
  });

  // Available options
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);

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
      
      // Load users
      const usersData = await userService.getAll().catch(() => []);

      // Handle different response formats
      const users = Array.isArray(usersData) 
        ? usersData 
        : (usersData?.data || usersData?.content || []);

      // Map to UserOption format
      const userOptions = users.map((user: UserDTO) => ({
        id: user.id,
        username: user.username,
      }));

      setAvailableUsers(userOptions);

      // Load group if editing
      if (isEditMode) {
        const groupData = await groupService.getById(Number(groupId));
        setGroup(groupData);
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
    if (!group.name || group.name.trim().length < 2) {
      errors.name = 'Group name must be at least 2 characters';
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

  const handleUsersChange = (_event: any, newValue: UserOption[]) => {
    setGroup({ ...group, users: newValue });
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
        // Convert user objects to IDs if needed
        userIds: group.users?.map(u => u.id),
      };

      if (isEditMode) {
        await groupService.update(Number(groupId), groupData);
      } else {
        await groupService.create(groupData);
      }

      navigate('/security/groups');
    } catch (err: any) {
      console.error('Failed to save group:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save group');
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
          {isEditMode ? t('group.editGroup') : t('group.createGroup')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update group information and user assignments' : 'Create a new group with user assignments'}
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
                    label={t('group.name')}
                    value={group.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('group.description')}
                    value={group.description || ''}
                    onChange={handleChange('description')}
                    multiline
                    rows={3}
                    placeholder="Describe the group and its purpose"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Users */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Users
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={availableUsers}
                    getOptionLabel={(option) => option.username}
                    value={group.users || []}
                    onChange={handleUsersChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('group.users')}
                        placeholder="Select users"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.username}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                </Grid>

                {group.users && group.users.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false}>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        Selected Users: {group.users.length}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {group.users.map((user) => (
                          <Chip
                            key={user.id}
                            label={user.username}
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

export default GroupEdit;
