/**
 * Folder Edit/Create Page - Professional Version
 * Comprehensive form with ArchiveBox selector
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
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
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import folderService from '../services/FolderService';
import archiveBoxService from '../services/ArchiveBoxService';
import { FolderDTO, ArchiveBoxDTO } from '../dto';

const FolderEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();
  const isEditMode = !!folderId;

  // Form state
  const [folder, setFolder] = useState<Partial<FolderDTO>>({
    code: '',
    description: '',
  });

  // Related entities
  const [archiveBoxes, setArchiveBoxes] = useState<ArchiveBoxDTO[]>([]);
  const [selectedArchiveBox, setSelectedArchiveBox] = useState<ArchiveBoxDTO | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRelatedData();
    if (isEditMode) {
      loadFolderData();
    }
  }, [folderId]);

  const loadRelatedData = async () => {
    try {
      const archiveBoxesData = await archiveBoxService.getAll();
      setArchiveBoxes(Array.isArray(archiveBoxesData) ? archiveBoxesData : []);
    } catch (err: any) {
      console.error('Failed to load archive boxes:', err);
      setError(err.message || 'Failed to load archive boxes');
    }
  };

  const loadFolderData = async () => {
    try {
      setLoading(true);
      const folderData = await folderService.getById(Number(folderId));
      setFolder(folderData);
      
      if (folderData.archiveBox) {
        setSelectedArchiveBox(folderData.archiveBox);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Failed to load folder:', err);
      setError(err.message || 'Failed to load folder');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Code validation
    if (!folder.code || folder.code.trim().length < 2) {
      errors.code = 'Code must be at least 2 characters';
    }

    // Archive Box validation
    if (!selectedArchiveBox) {
      errors.archiveBox = 'Archive Box is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof FolderDTO) => (e: any) => {
    const value = e.target.value;
    setFolder({ ...folder, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleArchiveBoxChange = (event: any, newValue: ArchiveBoxDTO | null) => {
    setSelectedArchiveBox(newValue);
    if (validationErrors.archiveBox) {
      setValidationErrors({ ...validationErrors, archiveBox: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const folderData: FolderDTO = {
        code: folder.code!,
        description: folder.description,
        archiveBoxId: selectedArchiveBox!.id,
      };

      if (isEditMode) {
        await folderService.update(Number(folderId), folderData);
      } else {
        await folderService.create(folderData);
      }

      navigate('/environment/folders');
    } catch (err: any) {
      console.error('Failed to save folder:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save folder');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/environment/folders');
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
          {isEditMode ? (t('folder.edit') || 'Edit Folder') : (t('folder.create') || 'Create Folder')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update folder information and location' : 'Create a new folder in an archive box'}
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
                    label={t('folder.code') || 'Code'}
                    value={folder.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || 'Required - Unique folder code'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('folder.description') || 'Description'}
                    value={folder.description || ''}
                    onChange={handleChange('description')}
                    multiline
                    rows={3}
                    helperText="Optional - Folder description"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Location */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    value={selectedArchiveBox}
                    onChange={handleArchiveBoxChange}
                    options={archiveBoxes}
                    getOptionLabel={(option) => `${option.code} - ${option.description || 'N/A'}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('folder.archiveBox') || 'Archive Box'}
                        required
                        error={!!validationErrors.archiveBox}
                        helperText={validationErrors.archiveBox || 'Required - Select the archive box where this folder is located'}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
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

export default FolderEdit;
