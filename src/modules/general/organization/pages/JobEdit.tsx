/**
 * Job Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed structureId type handling
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const isEditMode = !!jobId;

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
      setError(err.message || 'Failed to load structures');
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
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!job.code || job.code.trim().length === 0) {
      errors.code = 'Code is required';
    }

    if (!job.designationFr || job.designationFr.trim().length === 0) {
      errors.designationFr = 'French designation is required';
    } else if (job.designationFr.length > 100) {
      errors.designationFr = 'French designation must not exceed 100 characters';
    }

    if (job.designationAr && job.designationAr.length > 100) {
      errors.designationAr = 'Arabic designation must not exceed 100 characters';
    }

    if (job.designationEn && job.designationEn.length > 100) {
      errors.designationEn = 'English designation must not exceed 100 characters';
    }

    if (!job.structureId) {
      errors.structureId = 'Structure is required';
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
      setError(err.response?.data?.message || err.message || 'Failed to save job');
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
          {isEditMode ? 'Edit Job' : 'Create Job'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update job information' : 'Create a new job'}
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
                    value={job.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || 'Required unique code'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Structure"
                    value={job.structureId || ''}
                    onChange={handleChange('structureId')}
                    required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId || 'Required structure'}
                  >
                    {structures.map((structure) => (
                      <MenuItem key={structure.id} value={structure.id}>
                        {structure.designationFr}
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
                Multilingual Designations
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Designation (French)"
                    value={job.designationFr || ''}
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
                    value={job.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    error={!!validationErrors.designationAr}
                    helperText={validationErrors.designationAr || 'Optional Arabic designation'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation (English)"
                    value={job.designationEn || ''}
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

export default JobEdit;
