/**
 * Region Edit/Create Page
 */

import { useEffect, useMemo, useState } from 'react';
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
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as BackIcon } from '@mui/icons-material';

import { regionService } from '../services/regionService';
import { RegionDTO } from '../dto/RegionDTO';
import { zoneService } from '../services/zoneService';
import { activityService } from '../services/activityService';

const RegionEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { regionId } = useParams<{ regionId: string }>();

  const isEditMode = !!regionId;
  const currentLanguage = i18n.language || 'en';

  const [region, setRegion] = useState<Partial<RegionDTO>>({
    code: '',
    designationFr: '',
    designationEn: '',
    designationAr: '',
    descriptionFr: '',
    descriptionEn: '',
    descriptionAr: '',
    zoneId: 0,
    activityId: 0,
  });

  const [zones, setZones] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getLocalizedName = (obj: any): string => {
    if (!obj) return '';
    if (currentLanguage === 'ar') return obj.designationAr || obj.designationFr || obj.designationEn || obj.name || '';
    if (currentLanguage === 'en') return obj.designationEn || obj.designationFr || obj.designationAr || obj.name || '';
    return obj.designationFr || obj.designationEn || obj.designationAr || obj.name || '';
  };

  const sortedZones = useMemo(() => {
    const copy = [...zones];
    return copy.sort((a, b) => getLocalizedName(a).localeCompare(getLocalizedName(b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, currentLanguage]);

  const sortedActivities = useMemo(() => {
    const copy = [...activities];
    return copy.sort((a, b) => getLocalizedName(a).localeCompare(getLocalizedName(b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, currentLanguage]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      let regionData: RegionDTO | null = null;
      if (isEditMode) {
        regionData = await regionService.getById(Number(regionId));
      }

      const [zonesData, activitiesData] = await Promise.allSettled([zoneService.getAll(), activityService.getAll()]);

      if (zonesData.status === 'fulfilled') setZones(Array.isArray(zonesData.value) ? zonesData.value : (zonesData.value as any)?.data || []);
      if (activitiesData.status === 'fulfilled') setActivities(Array.isArray(activitiesData.value) ? activitiesData.value : (activitiesData.value as any)?.data || []);

      if (regionData) setRegion(regionData);

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!region.code || region.code.trim().length < 2) errors.code = 'Code is required';
    if (!region.designationFr || region.designationFr.trim().length < 2) errors.designationFr = 'French designation is required';
    if (!region.descriptionFr || region.descriptionFr.trim().length < 2) errors.descriptionFr = 'French description is required';
    if (!region.zoneId) errors.zoneId = 'Zone is required';
    if (!region.activityId) errors.activityId = 'Activity is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof RegionDTO) => (e: any) => {
    const value = e.target.value;
    setRegion((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setError('');

      const payload: RegionDTO = {
        id: isEditMode ? Number(regionId) : 0,
        code: String(region.code || ''),
        designationFr: String(region.designationFr || ''),
        designationEn: region.designationEn || null,
        designationAr: region.designationAr || null,
        descriptionFr: String(region.descriptionFr || ''),
        descriptionEn: region.descriptionEn || null,
        descriptionAr: region.descriptionAr || null,
        zoneId: Number(region.zoneId || 0),
        activityId: Number(region.activityId || 0),
      };

      if (isEditMode) {
        await regionService.update(Number(regionId), payload);
      } else {
        await regionService.create(payload);
      }

      navigate('/network/common/regions');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save region');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/network/common/regions');

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
        <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>

        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isEditMode ? 'Edit Region' : 'Create Region'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update region information' : 'Create a new region'}
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Code"
                    value={region.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="French designation"
                    value={region.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="English designation"
                    value={region.designationEn || ''}
                    onChange={handleChange('designationEn')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Arabic designation"
                    value={region.designationAr || ''}
                    onChange={handleChange('designationAr')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="French description"
                    value={region.descriptionFr || ''}
                    onChange={handleChange('descriptionFr')}
                    required
                    error={!!validationErrors.descriptionFr}
                    helperText={validationErrors.descriptionFr}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="English description"
                    value={region.descriptionEn || ''}
                    onChange={handleChange('descriptionEn')}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Arabic description"
                    value={region.descriptionAr || ''}
                    onChange={handleChange('descriptionAr')}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Zone"
                    value={region.zoneId || ''}
                    onChange={handleChange('zoneId')}
                    required
                    error={!!validationErrors.zoneId}
                    helperText={validationErrors.zoneId}
                  >
                    {sortedZones.map((z) => (
                      <MenuItem key={z.id} value={z.id}>
                        {getLocalizedName(z)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Activity"
                    value={region.activityId || ''}
                    onChange={handleChange('activityId')}
                    required
                    error={!!validationErrors.activityId}
                    helperText={validationErrors.activityId}
                  >
                    {sortedActivities.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {getLocalizedName(a)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving} size="large">
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

export default RegionEdit;
