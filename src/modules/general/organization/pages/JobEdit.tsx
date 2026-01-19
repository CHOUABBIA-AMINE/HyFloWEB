/**
 * Job Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Fixed translation keys for code and designation fields
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-08-2026 - Fixed structureId type handling
 * @created 01-06-2026
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
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { JobService, StructureService } from '../services';
import { JobDTO, StructureDTO } from '../dto';

const JobEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const isEditMode = !!jobId;
  const currentLanguage = i18n.language || 'en';

  const [job, setJob] = useState<Partial<JobDTO>>({
    code: '',
    designationFr: '',
    designationAr: undefined,
    designationEn: undefined,
    structureId: undefined, // Optional on create, required before save
  });

  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Get localized designation based on current language
   * Falls back to French -> English -> Arabic if current language not available
   */
  const getLocalizedDesignation = (item: StructureDTO): string => {
    if (!item) return '';
    
    if (currentLanguage === 'ar') {
      return item.designationAr || item.designationFr || item.designationEn || '-';
    }
    if (currentLanguage === 'en') {
      return item.designationEn || item.designationFr || item.designationAr || '-';
    }
    // Default to French
    return item.designationFr || item.designationEn || item.designationAr || '-';
  };

  useEffect(() => {
    loadStructures();
    if (isEditMode) {
      loadJob();
    }
  }, [jobId]);

  const loadStructures = async () => {
    try {
      const data = await StructureService.getAllNoPagination();
      setStructures(data);
    } catch (err: any) {
      console.error('Failed to load structures:', err);
      setError(err.message || t('common.errors.loadingDataFailed'));
    }
  };

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await JobService.getById(Number(jobId));
      setJob(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to load job:', err);
      setError(err.message || t('common.errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!job.code || job.code.trim().length === 0) {
      errors.code = t('common.validation.codeRequired');
    }

    if (!job.designationFr || job.designationFr.trim().length === 0) {
      errors.designationFr = t('common.validation.designationFrRequired');
    } else if (job.designationFr.length > 100) {
      errors.designationFr = t('common.validation.maxLength', { field: t('common.fields.designationFr'), max: 100 });
    }

    if (job.designationAr && job.designationAr.length > 100) {
      errors.designationAr = t('common.validation.maxLength', { field: t('common.fields.designationAr'), max: 100 });
    }

    if (job.designationEn && job.designationEn.length > 100) {
      errors.designationEn = t('common.validation.maxLength', { field: t('common.fields.designationEn'), max: 100 });
    }

    if (!job.structureId) {
      errors.structureId = t('common.validation.required', { field: t('job.fields.structure') });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof JobDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJob({ 
      ...job, 
      [field]: field === 'structureId' ? (value ? Number(value) : undefined) : (value || undefined)
    });
    
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

      const jobData: JobDTO = {
        id: job.id,
        code: job.code!,
        designationFr: job.designationFr!,
        designationEn: job.designationEn || undefined,
        designationAr: job.designationAr || undefined,
        structureId: job.structureId!,
      };

      if (isEditMode) {
        await JobService.update(Number(jobId), jobData);
      } else {
        await JobService.create(jobData);
      }

      navigate('/general/organization/jobs');
    } catch (err: any) {
      console.error('Failed to save job:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/general/organization/jobs');
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
          {isEditMode 
            ? t('common.page.editTitle', { entity: t('job.title') })
            : t('common.page.createTitle', { entity: t('job.title') })
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('job.title') })
            : t('common.page.createSubtitle', { entity: t('job.title') })
          }
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
                {t('common.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('common.fields.code')}
                    value={job.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('common.fields.codeHelper')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label={t('job.fields.structure')}
                    value={job.structureId || ''}
                    onChange={handleChange('structureId')}
                    required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId || t('job.fields.structureHelper')}
                  >
                    {structures.map((structure) => (
                      <MenuItem key={structure.id} value={structure.id}>
                        {structure.code} - {getLocalizedDesignation(structure)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.designations')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationFr')}
                    value={job.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr || t('common.fields.designationFrHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationEn')}
                    value={job.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    error={!!validationErrors.designationEn}
                    helperText={validationErrors.designationEn || t('common.fields.designationEnHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationAr')}
                    value={job.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    error={!!validationErrors.designationAr}
                    helperText={validationErrors.designationAr || t('common.fields.designationArHelper')}
                    inputProps={{ dir: 'rtl' }}
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
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default JobEdit;