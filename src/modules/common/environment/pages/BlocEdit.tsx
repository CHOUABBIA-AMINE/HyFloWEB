/**
 * Bloc Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing blocs
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-28-2025
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import blocService from '../services/BlocService';
import { BlocDTO } from '../dto/BlocDTO';

const BlocEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { blocId } = useParams<{ blocId: string }>();
  const isEditMode = !!blocId;

  // Form state
  const [bloc, setBloc] = useState<Partial<BlocDTO>>({
    designationFr: '',
    designationEn: '',
    designationAr: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadData();
    }
  }, [blocId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const blocData = await blocService.getById(Number(blocId));
      setBloc(blocData);
      setError('');
    } catch (err: any) {
      console.error('Failed to load bloc:', err);
      setError(err.message || 'Failed to load bloc');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // French designation validation (required)
    if (!bloc.designationFr || bloc.designationFr.trim().length < 2) {
      errors.designationFr = 'French designation must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof BlocDTO) => (e: any) => {
    const value = e.target.value;
    setBloc({ ...bloc, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
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

      const blocData: BlocDTO = {
        designationFr: bloc.designationFr!,
        designationEn: bloc.designationEn,
        designationAr: bloc.designationAr,
      };

      if (isEditMode) {
        await blocService.update(Number(blocId), blocData);
      } else {
        await blocService.create(blocData);
      }

      navigate('/environment/blocs');
    } catch (err: any) {
      console.error('Failed to save bloc:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save bloc');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/environment/blocs');
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
          {isEditMode ? (t('bloc.edit') || 'Edit Bloc') : (t('bloc.create') || 'Create Bloc')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update bloc information and designations' : 'Create a new building bloc'}
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
          {/* Multilingual Designations */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Designations
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('bloc.designationFr') || 'French Designation'}
                    value={bloc.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr || 'Required'}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('bloc.designationEn') || 'English Designation'}
                    value={bloc.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    helperText="Optional"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('bloc.designationAr') || 'Arabic Designation'}
                    value={bloc.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    helperText="Optional"
                    inputProps={{
                      dir: 'rtl',
                      style: { textAlign: 'right' }
                    }}
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

export default BlocEdit;
