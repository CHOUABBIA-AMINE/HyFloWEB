/**
 * Structure Type Edit/Create Page
 * Form for creating and editing structure type records
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { structureTypeService } from '../services';
import { StructureTypeDTO } from '../dto';

const StructureTypeEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<StructureTypeDTO>>({
    code: '',
    designationAr: '',
    designationFr: '',
    designationEn: '',
    shortName: '',
    description: '',
    displayOrder: undefined,
    active: true,
  });

  // Form validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  useEffect(() => {
    if (isEditMode) {
      loadStructureType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStructureType = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await structureTypeService.getById(Number(id));
      setFormData(data);
    } catch (err: any) {
      console.error('Error loading structure type:', err);
      setError(err.message || 'Failed to load structure type');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) newErrors.code = t('common.required', 'Required');
    if (!formData.designationFr?.trim()) newErrors.designationFr = t('common.required', 'Required');

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditMode && id) {
        await structureTypeService.update(Number(id), formData);
      } else {
        await structureTypeService.create(formData as Omit<StructureTypeDTO, 'id'>);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/administration/structure-types');
      }, 800);
    } catch (err: any) {
      console.error('Error saving structure type:', err);
      setError(err.message || 'Failed to save structure type');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof StructureTypeDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              {isEditMode ? 'Edit Structure Type' : 'Create Structure Type'}
            </Typography>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/administration/structure-types')}>
              {t('common.back', 'Back')}
            </Button>
          </Stack>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('common.success', 'Success')}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Code"
                  value={formData.code || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  error={Boolean(fieldErrors.code)}
                  helperText={fieldErrors.code}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Short Name"
                  value={formData.shortName || ''}
                  onChange={(e) => handleChange('shortName', e.target.value)}
                />
              </Grid>

              {/* Designations */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Designations
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Designation (French)"
                  value={formData.designationFr || ''}
                  onChange={(e) => handleChange('designationFr', e.target.value)}
                  error={Boolean(fieldErrors.designationFr)}
                  helperText={fieldErrors.designationFr}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Designation (English)"
                  value={formData.designationEn || ''}
                  onChange={(e) => handleChange('designationEn', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Designation (Arabic)"
                  value={formData.designationAr || ''}
                  onChange={(e) => handleChange('designationAr', e.target.value)}
                  dir="rtl"
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Display Order"
                  value={formData.displayOrder || ''}
                  onChange={(e) => handleChange('displayOrder', e.target.value ? Number(e.target.value) : undefined)}
                  helperText="Order in which this type appears in lists"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active ?? true}
                      onChange={(e) => handleChange('active', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button variant="outlined" onClick={() => navigate('/administration/structure-types')} disabled={saving}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StructureTypeEdit;
