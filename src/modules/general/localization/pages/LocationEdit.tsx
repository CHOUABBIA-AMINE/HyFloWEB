/**
 * Location Edit/Create Page
 *
 * Based on PipelineSystemEdit.tsx pattern
 * Aligned with LocationDTO schema
 *
 * Note: 
 * - State and district are UI-only fields for filtering localities.
 * - They are not saved to the Location entity - only localityId is saved.
 * - The hierarchy is: Location → Locality → District → State
 *
 * @author CHOUABBIA Amine
 * @created 01-19-2026
 * @updated 01-19-2026
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Place as LocationIcon,
} from '@mui/icons-material';

import { LocationService, LocalityService } from '../services';
import { LocationDTO } from '../dto/LocationDTO';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

const LocationEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { locationId } = useParams<{ locationId: string }>();
  const isEditMode = !!locationId;

  const currentLanguage = i18n.language || 'en';

  // Form state - aligned with LocationDTO
  const [location, setLocation] = useState<Partial<LocationDTO>>({
    designationFr: '',
    designationEn: '',
    designationAr: '',
    latitude: 0,
    longitude: 0,
    elevation: 0,
    localityId: 0,
  });

  // UI-only fields for filtering localities (not saved to backend)
  const [uiState, setUiState] = useState({
    state: '',
    district: '',
  });

  // Dropdown data
  const [localities, setLocalities] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (!uiState.state) {
      setUiState((prev) => ({ ...prev, district: '' }));
      setLocation((prev) => ({ ...prev, localityId: 0 }));
    }
  }, [uiState.state]);

  useEffect(() => {
    if (!uiState.district) {
      setLocation((prev) => ({ ...prev, localityId: 0 }));
    }
  }, [uiState.district]);

  // Filter localities based on state and district
  const filteredLocalities = useMemo(() => {
    let filtered = localities;

    if (uiState.state) {
      filtered = filtered.filter(
        (loc) => loc.district?.state?.designationFr?.toLowerCase().includes(uiState.state.toLowerCase())
      );
    }

    if (uiState.district) {
      filtered = filtered.filter(
        (loc) => loc.district?.designationFr?.toLowerCase().includes(uiState.district.toLowerCase())
      );
    }

    return sortByLocalizedName(filtered, currentLanguage);
  }, [localities, uiState.state, uiState.district, currentLanguage]);

  const loadData = async () => {
    try {
      setLoading(true);

      let locationData: LocationDTO | null = null;
      if (isEditMode) {
        locationData = await LocationService.getById(Number(locationId));
      }

      const [localitiesData] = await Promise.allSettled([
        LocalityService.getAllNoPagination(),
      ]);

      // Localities: getAllNoPagination returns array directly
      if (localitiesData.status === 'fulfilled') {
        setLocalities(Array.isArray(localitiesData.value) ? localitiesData.value : []);
      }

      if (locationData) {
        setLocation(locationData);
        // Pre-populate UI filters if locality is selected
        if (locationData.locality?.district?.state) {
          setUiState({
            state: getLocalizedName(locationData.locality.district.state, currentLanguage),
            district: getLocalizedName(locationData.locality.district, currentLanguage),
          });
        }
      }

      setError('');
    } catch (err: any) {
      setError(err.message || t('common.errors.loadingDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!location.designationFr || location.designationFr.trim().length < 2) {
      errors.designationFr = t('common.validation.minLength', { field: t('common.fields.designationFr'), min: 2 });
    }

    if (location.latitude === undefined || location.latitude === null) {
      errors.latitude = t('common.validation.required', { field: t('common.fields.latitude') });
    } else if (location.latitude < -90 || location.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }

    if (location.longitude === undefined || location.longitude === null) {
      errors.longitude = t('common.validation.required', { field: t('common.fields.longitude') });
    } else if (location.longitude < -180 || location.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof LocationDTO) => (e: any) => {
    const value = e.target.value;
    setLocation((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleUiStateChange = (field: 'state' | 'district') => (e: any) => {
    const value = e.target.value;
    setUiState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const payload: LocationDTO = {
        id: isEditMode ? Number(locationId) : 0,
        designationFr: String(location.designationFr || ''),
        designationEn: String(location.designationEn || ''),
        designationAr: String(location.designationAr || ''),
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        elevation: location.elevation ? Number(location.elevation) : undefined,
        localityId: location.localityId ? Number(location.localityId) : undefined,
      };

      if (isEditMode) {
        await LocationService.update(Number(locationId), payload);
        setSuccess(t('common.messages.updateSuccess'));
      } else {
        const created = await LocationService.create(payload);
        setSuccess(t('common.messages.createSuccess'));
        setTimeout(() => navigate(`/general/localization/locations/${created.id}/edit`), 800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/general/localization/locations');
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {isEditMode
              ? t('common.page.editTitle', { entity: t('location.title') })
              : t('common.page.createTitle', { entity: t('location.title') })}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isEditMode
            ? t('common.page.editSubtitle', { entity: t('location.title') })
            : t('common.page.createSubtitle', { entity: t('location.title') })}
        </Typography>
        <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mt: 2 }}>
          {t('common.back')}
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {t('common.sections.designations')}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={t('common.fields.designationFr')}
                        value={location.designationFr || ''}
                        onChange={handleChange('designationFr')}
                        required
                        error={!!validationErrors.designationFr}
                        helperText={validationErrors.designationFr || t('common.fields.designationFrHelper')}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={t('common.fields.designationEn')}
                        value={location.designationEn || ''}
                        onChange={handleChange('designationEn')}
                        helperText={t('common.fields.designationEnHelper')}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={t('common.fields.designationAr')}
                        value={location.designationAr || ''}
                        onChange={handleChange('designationAr')}
                        helperText={t('common.fields.designationArHelper')}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {t('common.sections.locationInformation')}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* State - UI Filter Only (not saved) */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={`${t('common.fields.state')} (${t('common.filter', 'Filter')})`}
                        value={uiState.state}
                        onChange={handleUiStateChange('state')}
                        helperText={t('common.fields.stateFilterHelper', 'Filter localities by state')}
                      />
                    </Grid>

                    {/* District - UI Filter Only (not saved) */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={`${t('common.fields.district')} (${t('common.filter', 'Filter')})`}
                        value={uiState.district}
                        onChange={handleUiStateChange('district')}
                        disabled={!uiState.state}
                        helperText={
                          !uiState.state
                            ? `${t('common.fields.state')} filter required`
                            : t('common.fields.districtFilterHelper', 'Filter localities by district')
                        }
                      />
                    </Grid>

                    {/* Locality - Saved to Location */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label={t('common.fields.locality')}
                        value={location.localityId || ''}
                        onChange={handleChange('localityId')}
                        disabled={!uiState.district}
                        helperText={
                          !uiState.district
                            ? `${t('common.fields.district')} filter required`
                            : `${filteredLocalities.length} ${t('common.available', 'available')}`
                        }
                      >
                        <MenuItem value="">
                          <em>{t('common.none')}</em>
                        </MenuItem>
                        {filteredLocalities.length > 0 ? (
                          filteredLocalities.map((locality) => (
                            <MenuItem key={locality.id} value={locality.id}>
                              {getLocalizedName(locality, currentLanguage)}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            {uiState.district ? t('common.noResults', 'No results') : t('common.loading')}
                          </MenuItem>
                        )}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label={t('common.fields.latitude')}
                        value={location.latitude || 0}
                        onChange={handleChange('latitude')}
                        required
                        error={!!validationErrors.latitude}
                        helperText={validationErrors.latitude || t('common.fields.latitudeHelper')}
                        inputProps={{ step: 'any' }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label={t('common.fields.longitude')}
                        value={location.longitude || 0}
                        onChange={handleChange('longitude')}
                        required
                        error={!!validationErrors.longitude}
                        helperText={validationErrors.longitude || t('common.fields.longitudeHelper')}
                        inputProps={{ step: 'any' }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label={t('common.fields.elevation')}
                        value={location.elevation || ''}
                        onChange={handleChange('elevation')}
                        helperText={t('common.fields.elevationHelper')}
                        inputProps={{ step: 'any' }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Actions */}
      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={saving}
            sx={{ minWidth: 120 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
            sx={{ minWidth: 120, boxShadow: 2 }}
          >
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LocationEdit;
