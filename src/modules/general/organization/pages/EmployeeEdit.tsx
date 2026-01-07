/**
 * Employee Edit/Create Page
 * Form for creating and editing employee records
 * 
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 * @updated 01-01-2026 - Align routes and translation keys
 * @updated 01-01-2026 - Dependent selects (Structure→Job)
 * @updated 01-03-2026 - Removed MilitaryCategory and MilitaryRank (no longer in Employee model)
 * @updated 01-07-2026 - Fixed service imports and field mappings
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import {
  EmployeeService,
  StructureService,
  JobService,
} from '../services';
import { CountryService } from '../../localization/services';
import {
  EmployeeDTO,
  JobDTO,
  StructureDTO,
} from '../dto';
import { CountryDTO } from '../../localization/dto';

type HasDesignation = {
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
};

const EmployeeEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<EmployeeDTO>({
    lastNameAr: '',
    firstNameAr: '',
    lastNameLt: '',
    firstNameLt: '',
    birthDate: '',
    birthPlaceLt: '',
    registrationNumber: '',
    countryId: undefined,
    jobId: undefined,
  });

  // Lookup data
  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<number | undefined>(undefined);

  // Form validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  const getDesignation = (item?: HasDesignation | null): string => {
    if (!item) return '';
    if (lang === 'ar') return item.designationAr || item.designationFr || item.designationEn || '';
    if (lang === 'en') return item.designationEn || item.designationFr || item.designationAr || '';
    return item.designationFr || item.designationEn || item.designationAr || '';
  };

  useEffect(() => {
    loadInitialLookupData();
    if (isEditMode) {
      loadEmployee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // When structure changes, load jobs for that structure
  useEffect(() => {
    if (!selectedStructureId) {
      setJobs([]);
      setFormData((prev) => ({ ...prev, jobId: undefined }));
      return;
    }

    (async () => {
      try {
        const jobsList = await JobService.getByStructureId(selectedStructureId);
        setJobs(jobsList);
      } catch (err) {
        console.error('Error loading jobs by structure:', err);
        setError(t('common.error', 'Error'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStructureId]);

  const loadInitialLookupData = async () => {
    try {
      const [structuresList, countriesList] = await Promise.all([
        StructureService.getAllNoPagination(),
        CountryService.getAllNoPagination(),
      ]);
      
      setStructures(structuresList);
      setCountries(countriesList);
    } catch (err) {
      console.error('Error loading lookup data:', err);
      setError(t('common.error', 'Error'));
    }
  };

  const loadEmployee = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await EmployeeService.getById(Number(id));
      setFormData(data);
      
      // If employee has a job, load the job's structure and jobs for that structure
      if (data.job && data.job.structureId) {
        setSelectedStructureId(data.job.structureId);
      }
    } catch (err) {
      console.error('Error loading employee:', err);
      setError(t('common.error', 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lastNameLt?.trim()) newErrors.lastNameLt = t('common.required', 'Required');
    if (!formData.firstNameLt?.trim()) newErrors.firstNameLt = t('common.required', 'Required');

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
        await EmployeeService.update(Number(id), formData);
      } else {
        await EmployeeService.create(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/administration/employees');
      }, 800);
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setError(err.response?.data?.message || t('common.error', 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EmployeeDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const formatDateForInput = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
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
              {isEditMode ? t('employee.edit', 'Edit Employee') : t('employee.create', 'Create Employee')}
            </Typography>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/administration/employees')}>
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
                  label={t('employee.lastNameAr', 'Arabic Last Name')}
                  value={formData.lastNameAr || ''}
                  onChange={(e) => handleChange('lastNameAr', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.firstNameAr', 'Arabic First Name')}
                  value={formData.firstNameAr || ''}
                  onChange={(e) => handleChange('firstNameAr', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label={t('employee.lastNameLt', 'Latin Last Name')}
                  value={formData.lastNameLt}
                  onChange={(e) => handleChange('lastNameLt', e.target.value)}
                  error={Boolean(fieldErrors.lastNameLt)}
                  helperText={fieldErrors.lastNameLt}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label={t('employee.firstNameLt', 'Latin First Name')}
                  value={formData.firstNameLt}
                  onChange={(e) => handleChange('firstNameLt', e.target.value)}
                  error={Boolean(fieldErrors.firstNameLt)}
                  helperText={fieldErrors.firstNameLt}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('employee.birthDate', 'Birth Date')}
                  value={formatDateForInput(formData.birthDate)}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.birthPlace', 'Birth Place')}
                  value={formData.birthPlaceLt || ''}
                  onChange={(e) => handleChange('birthPlaceLt', e.target.value)}
                />
              </Grid>

              {/* Country (multilingual designation) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('employee.country', 'Country')}</InputLabel>
                  <Select
                    value={formData.countryId || ''}
                    onChange={(e) => handleChange('countryId', e.target.value || undefined)}
                    label={t('employee.country', 'Country')}
                  >
                    <MenuItem value="">
                      <em>{t('common.none', 'None')}</em>
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {getDesignation(country)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.registrationNumber', 'Registration Number')}
                  value={formData.registrationNumber || ''}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                />
              </Grid>

              {/* Structure -> Job (dependent) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('employee.structure', 'Structure')}</InputLabel>
                  <Select
                    value={selectedStructureId || ''}
                    onChange={(e) => {
                      const newStructureId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedStructureId(newStructureId);
                      // reset job when structure changes
                      setFormData((prev) => ({ ...prev, jobId: undefined }));
                    }}
                    label={t('employee.structure', 'Structure')}
                  >
                    <MenuItem value="">
                      <em>{t('common.none', 'None')}</em>
                    </MenuItem>
                    {structures.map((structure) => (
                      <MenuItem key={structure.id} value={structure.id}>
                        {getDesignation(structure)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!selectedStructureId}>
                  <InputLabel>{t('employee.job', 'Job')}</InputLabel>
                  <Select
                    value={formData.jobId || ''}
                    onChange={(e) => handleChange('jobId', e.target.value || undefined)}
                    label={t('employee.job', 'Job')}
                  >
                    <MenuItem value="">
                      <em>{t('common.none', 'None')}</em>
                    </MenuItem>
                    {jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {getDesignation(job)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button variant="outlined" onClick={() => navigate('/administration/employees')} disabled={saving}>
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

export default EmployeeEdit;
