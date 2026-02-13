/**
 * Location Edit/Create Page
 *
 * Based on PipelineSystemEdit.tsx pattern
 * Aligned with LocationDTO schema
 *
 * Features:
 * - Cascading dropdowns: State → District → Locality
 * - State dropdown: all states
 * - District dropdown: filtered by selected state
 * - Locality dropdown: filtered by selected district
 * - Only localityId is saved to Location entity
 *
 * @author CHOUABBIA Amine
 * @created 01-19-2026
 * @updated 01-19-2026
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { LocationService, LocalityService, StateService, DistrictService } from '../services';
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

  // Cascading filter state (not saved to backend)
  const [selectedStateId, setSelectedStateId] = useState<number | ''>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | ''>();

  // Dropdown data
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
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

  // Reset dependent fields when state changes
  useEffect(() => {
    if (selectedStateId) {
      loadDistrictsByState(selectedStateId);
    } else {
      setDistricts([]);
      setSelectedDistrictId('');
      setLocalities([]);
      setLocation((prev) => ({ ...prev, localityId: 0 }));
    }
  }, [selectedStateId]);

  // Reset locality when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      loadLocalitiesByDistrict(selectedDistrictId);
    } else {
      setLocalities([]);
      setLocation((prev) => ({ ...prev, localityId: 0 }));
    }
  }, [selectedDistrictId]);

  const loadData = async () => {
    try {
      setLoading(true);

      let locationData: LocationDTO | null = null;
      if (isEditMode) {
        locationData = await LocationService.getById(Number(locationId));
      }

      // Load all states
      const [statesData] = await Promise.allSettled([
        StateService.getAllNoPagination(),
      ]);

      if (statesData.status === 'fulfilled') {
        setStates(Array.isArray(statesData.value) ? statesData.value : []);
      }

      if (locationData) {
        setLocation(locationData);
        
        // Pre-populate cascading filters if locality is selected
        if (locationData.locality?.district?.state) {
          const stateId = locationData.locality.district.state.id;
          const districtId = locationData.locality.district.id;
          
          setSelectedStateId(stateId);
          setSelectedDistrictId(districtId);
          
          // Load districts and localities for the selected state/district
          if (stateId) {
            const districtsData = await DistrictService.findByState(stateId);
            setDistricts(districtsData);
            
            if (districtId) {
              const localitiesData = await LocalityService.getAllNoPagination();
              const filtered = localitiesData.filter((loc: any) => loc.districtId === districtId);
              setLocalities(filtered);
            }
          }
        }
      }

      setError('');
    } catch (err: any) {
      setError(err.message || t('common.errors.loadingDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictsByState = async (stateId: number) => {
    try {
      const districtsData = await DistrictService.findByState(stateId);
      setDistricts(districtsData);
    } catch (err: any) {
      console.error('Failed to load districts:', err);
      setDistricts([]);
    }
  };

  const loadLocalitiesByDistrict = async (districtId: number) => {
    try {
      const localitiesData = await LocalityService.getAllNoPagination();
      const filtered = localitiesData.filter((loc: any) => loc.districtId === districtId);
      setLocalities(filtered);
    } catch (err: any) {
      console.error('Failed to load localities:', err);
      setLocalities([]);
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

  const handleStateChange = (e: any) => {
    const value = e.target.value;
    setSelectedStateId(value);
    setSelectedDistrictId('');
  };

  const handleDistrictChange = (e: any) => {
    const value = e.target.value;
    setSelectedDistrictId(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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

  // Sorted dropdown options
  const sortedStates = useMemo(
    () => sortByLocalizedName(states, currentLanguage),
    [states, currentLanguage]
  );

  const sortedDistricts = useMemo(
    () => sortByLocalizedName(districts, currentLanguage),
    [districts, currentLanguage]
  );

  const sortedLocalities = useMemo(
    () => sortByLocalizedName(localities, currentLanguage),
    [localities, currentLanguage]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {isEditMode
                  ? t('common.page.editTitle', { entity: t('location.title') })
                  : t('common.page.createTitle', { entity: t('location.title') })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode
                  ? t('common.page.editSubtitle', { entity: t('location.title') })
                  : t('common.page.createSubtitle', { entity: t('location.title') })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('common.cancel')}>
                <IconButton 
                  onClick={handleCancel} 
                  disabled={saving}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.save')}>
                <IconButton 
                  onClick={() => handleSubmit()} 
                  disabled={saving}
                  size="medium"
                  color="primary"
                >
                  {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

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
                    {/* State Dropdown - Always Enabled */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label={t('common.fields.state')}
                        value={selectedStateId || ''}
                        onChange={handleStateChange}
                        helperText={t('common.fields.stateHelper', 'Select a state to filter districts')}
                      >
                        <MenuItem value="">
                          <em>{t('common.none')}</em>
                        </MenuItem>
                        {sortedStates.map((state) => (
                          <MenuItem key={state.id} value={state.id}>
                            {getLocalizedName(state, currentLanguage)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* District Dropdown - Enabled when State is selected */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label={t('common.fields.district')}
                        value={selectedDistrictId || ''}
                        onChange={handleDistrictChange}
                        disabled={!selectedStateId}
                        helperText={
                          !selectedStateId
                            ? t('common.selectParent', 'Select state first')
                            : `${sortedDistricts.length} ${t('common.available', 'available')}`
                        }
                      >
                        <MenuItem value="">
                          <em>{t('common.none')}</em>
                        </MenuItem>
                        {sortedDistricts.map((district) => (
                          <MenuItem key={district.id} value={district.id}>
                            {getLocalizedName(district, currentLanguage)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Locality Dropdown - Enabled when District is selected */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label={t('common.fields.locality')}
                        value={location.localityId || ''}
                        onChange={handleChange('localityId')}
                        disabled={!selectedDistrictId}
                        helperText={
                          !selectedDistrictId
                            ? t('common.selectParent', 'Select district first')
                            : `${sortedLocalities.length} ${t('common.available', 'available')}`
                        }
                      >
                        <MenuItem value="">
                          <em>{t('common.none')}</em>
                        </MenuItem>
                        {sortedLocalities.map((locality) => (
                          <MenuItem key={locality.id} value={locality.id}>
                            {getLocalizedName(locality, currentLanguage)}
                          </MenuItem>
                        ))}
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
    </Box>
  );
};

export default LocationEdit;
