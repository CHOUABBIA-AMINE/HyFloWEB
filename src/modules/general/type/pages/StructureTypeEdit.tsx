/**
 * StructureType Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-02-2026
 * @updated 01-08-2026 - Fixed service import
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
import { StructureTypeService } from '../services';
import { StructureTypeDTO } from '../dto';

const StructureTypeEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { structureTypeId } = useParams<{ structureTypeId: string }>();
  const isEditMode = !!structureTypeId;

  const [structureType, setStructureType] = useState<Partial<StructureTypeDTO>>({
    code: '',
    designationFr: '',
    designationAr: undefined,
    designationEn: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadStructureType();
    }
  }, [structureTypeId]);

  const loadStructureType = async () => {
    try {
      setLoading(true);
      const data = await StructureTypeService.getById(Number(structureTypeId));
      setStructureType(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to load structure type:', err);
      setError(err.message || 'Failed to load structure type');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!structureType.code || structureType.code.trim().length === 0) {
      errors.code = 'Code is required';
    } else if (structureType.code.length > 10) {
      errors.code = 'Code must not exceed 10 characters';
    }

    if (!structureType.designationFr || structureType.designationFr.trim().length === 0) {
      errors.designationFr = 'French designation is required';
    } else if (structureType.designationFr.length > 100) {
      errors.designationFr = 'French designation must not exceed 100 characters';
    }

    if (structureType.designationAr && structureType.designationAr.length > 100) {
      errors.designationAr = 'Arabic designation must not exceed 100 characters';
    }

    if (structureType.designationEn && structureType.designationEn.length > 100) {
      errors.designationEn = 'English designation must not exceed 100 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof StructureTypeDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStructureType({ ...structureType, [field]: value || undefined });
    
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

      const structureTypeData: StructureTypeDTO = {
        id: structureType.id,
        code: structureType.code!,
        designationFr: structureType.designationFr!,
        designationEn: structureType.designationEn || undefined,
        designationAr: structureType.designationAr || undefined,
      };

      if (isEditMode) {
        await StructureTypeService.update(Number(structureTypeId), structureTypeData);
      } else {
        await StructureTypeService.create(structureTypeData);
      }

      navigate('/general/type/structure-types');
    } catch (err: any) {
      console.error('Failed to save structure type:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save structure type');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/general/type/structure-types');
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
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isEditMode ? 'Edit Structure Type' : 'Create Structure Type'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update structure type information' : 'Create a new structure type'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Code"
                    value={structureType.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || 'Required unique code (max 10 characters)'}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Multilingual Designations
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Designation (French)"
                    value={structureType.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr || 'Required French designation'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation (Arabic)"
                    value={structureType.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    error={!!validationErrors.designationAr}
                    helperText={validationErrors.designationAr || 'Optional Arabic designation'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation (English)"
                    value={structureType.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    error={!!validationErrors.designationEn}
                    helperText={validationErrors.designationEn || 'Optional English designation'}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

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

export default StructureTypeEdit;
