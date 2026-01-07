/**
 * Job Edit/Create Page
 * Form for creating and editing job records
 * 
 * @author CHOUABBIA Amine
 * @created 01-07-2026
 * @updated 01-07-2026 - Created from dialog component, fixed service imports
 */

import { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { JobService, StructureService } from '../services';
import { JobDTO, StructureDTO } from '../dto';

const JobEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<JobDTO>({
    code: '',
    designationFr: '',
    designationEn: '',
    designationAr: '',
    structureId: undefined,
  });

  // Lookup data
  const [structures, setStructures] = useState<StructureDTO[]>([]);

  // Form validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStructures();
    if (isEditMode) {
      loadJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStructures = async () => {
    try {
      const structuresList = await StructureService.getAllNoPagination();
      setStructures(structuresList);
    } catch (err) {
      console.error('Error loading structures:', err);
      setError(t('common.error', 'Error'));
    }
  };

  const loadJob = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await JobService.getById(Number(id));
      setFormData(data);
    } catch (err) {
      console.error('Error loading job:', err);
      setError(t('common.error', 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) newErrors.code = t('common.required', 'Required');
    if (!formData.designationFr?.trim()) newErrors.designationFr = t('common.required', 'Required');
    if (!formData.structureId) newErrors.structureId = t('common.required', 'Required');

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError(t('common.validationError', 'Please fix validation errors'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditMode && id) {
        await JobService.update(Number(id), formData);
      } else {
        await JobService.create(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/administration/jobs');
      }, 800);
    } catch (err: any) {
      console.error('Error saving job:', err);
      setError(err.response?.data?.message || t('common.error', 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof JobDTO, value: any) => {
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
              {isEditMode ? t('job.edit', 'Edit Job') : t('job.create', 'Create Job')}
            </Typography>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/administration/jobs')}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label={t('job.code', 'Code')}
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  error={Boolean(fieldErrors.code)}
                  helperText={fieldErrors.code}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={Boolean(fieldErrors.structureId)}>
                  <InputLabel>{t('job.structure', 'Structure')}</InputLabel>
                  <Select
                    value={formData.structureId || ''}
                    onChange={(e) => handleChange('structureId', e.target.value || undefined)}
                    label={t('job.structure', 'Structure')}
                  >
                    <MenuItem value="">
                      <em>{t('common.none', 'None')}</em>
                    </MenuItem>
                    {structures.map((structure) => (
                      <MenuItem key={structure.id} value={structure.id}>
                        {structure.code} - {structure.designationFr}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.structureId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.structureId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label={t('job.designationFr', 'Designation (French)')}
                  value={formData.designationFr}
                  onChange={(e) => handleChange('designationFr', e.target.value)}
                  error={Boolean(fieldErrors.designationFr)}
                  helperText={fieldErrors.designationFr}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('job.designationEn', 'Designation (English)')}
                  value={formData.designationEn || ''}
                  onChange={(e) => handleChange('designationEn', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('job.designationAr', 'Designation (Arabic)')}
                  value={formData.designationAr || ''}
                  onChange={(e) => handleChange('designationAr', e.target.value)}
                  dir="rtl"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button variant="outlined" onClick={() => navigate('/administration/jobs')} disabled={saving}>
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

export default JobEdit;
