/**
 * Station Edit/Create Page - Updated for U-006 Schema
 * Refactored to use locationId instead of inline coordinates
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-08-2026 - Refactored for U-006 schema (locationId)
 * @updated 01-10-2026 - Applied i18n translations
 * @updated 01-16-2026 - Applied compact location details template (single row layout)
 * @updated 01-16-2026 - Moved Structure field before Location section
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-19-2026 - Fixed i18n for location references and converted to Autocomplete
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, CircularProgress, Alert,
  Grid, Paper, Divider, Stack, MenuItem, Chip, Autocomplete,
  IconButton, Tooltip
} from '@mui/material';
import {
  Save as SaveIcon, Close as CloseIcon,
  LocationOn as LocationIcon, AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { StationService, PipelineSystemService } from '../services';
import { VendorService, OperationalStatusService } from '../../common/services';
import { StationTypeService } from '../../type/services';
import { LocationService } from '../../../general/localization/services';
import { StructureService } from '../../../general/organization/services';
import { LocationDTO } from '../../../general/localization/dto';
import { StationDTO } from '../dto';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

const StationEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stationId } = useParams<{ stationId: string }>();
  const isEditMode = !!stationId;

  const currentLanguage = i18n.language || 'en';

  const getLocalizedDesignation = (entity: any): string => {
    if (!entity) return '';
    
    const designationKey = currentLanguage === 'ar' ? 'designationAr' 
      : currentLanguage === 'fr' ? 'designationFr' 
      : 'designationEn';
    
    return entity[designationKey] || entity.designationFr || entity.code || '';
  };

  const [station, setStation] = useState<Partial<StationDTO>>({
    name: '',
    code: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    operationalStatusId: 0,
    structureId: 0,
    vendorId: 0,
    locationId: 0,
    stationTypeId: 0,
    pipelineSystemId: undefined,
    pipelineIds: [],
  });

  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [stationTypes, setStationTypes] = useState<any[]>([]);
  const [pipelineSystems, setPipelineSystems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [stationId]);

  const sortedStationTypes = useMemo(() => sortByLocalizedName(stationTypes, currentLanguage), [stationTypes, currentLanguage]);
  const sortedOperationalStatuses = useMemo(() => sortByLocalizedName(operationalStatuses, currentLanguage), [operationalStatuses, currentLanguage]);
  const sortedLocations = useMemo(() => sortByLocalizedName(locations, currentLanguage), [locations, currentLanguage]);
  const sortedStructures = useMemo(() => sortByLocalizedName(structures, currentLanguage), [structures, currentLanguage]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let stationData: StationDTO | null = null;
      if (isEditMode) {
        stationData = await StationService.getById(Number(stationId));
      }
      
      const [
        locationsData,
        structuresData,
        vendorsData,
        pipelineSystemsData,
        stationTypesData,
        operationalStatusesData,
      ] = await Promise.allSettled([
        LocationService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
        VendorService.getAllNoPagination(),
        PipelineSystemService.getAllNoPagination(),
        StationTypeService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
      ]);

      if (locationsData.status === 'fulfilled') {
        setLocations(Array.isArray(locationsData.value) ? locationsData.value : []);
      }
      if (structuresData.status === 'fulfilled') {
        setStructures(Array.isArray(structuresData.value) ? structuresData.value : []);
      }
      if (vendorsData.status === 'fulfilled') {
        setVendors(Array.isArray(vendorsData.value) ? vendorsData.value : []);
      }
      if (pipelineSystemsData.status === 'fulfilled') {
        setPipelineSystems(Array.isArray(pipelineSystemsData.value) ? pipelineSystemsData.value : []);
      }
      if (stationTypesData.status === 'fulfilled') {
        setStationTypes(Array.isArray(stationTypesData.value) ? stationTypesData.value : []);
      }
      if (operationalStatusesData.status === 'fulfilled') {
        setOperationalStatuses(Array.isArray(operationalStatusesData.value) ? operationalStatusesData.value : []);
      }

      if (stationData) {
        setStation(stationData);
        if (stationData.location) {
          setSelectedLocation(stationData.location);
        } else if (stationData.locationId) {
          try {
            const loc = await LocationService.getById(stationData.locationId);
            setSelectedLocation(loc);
          } catch (err) {
            console.error('Failed to load location details:', err);
          }
        }
      }
      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || t('common.errors.loadingDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!station.name || station.name.trim().length < 3) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 3 });
    }
    if (!station.code || station.code.trim().length < 2) {
      errors.code = t('common.validation.codeRequired');
    }
    if (!station.operationalStatusId) {
      errors.operationalStatusId = t('common.validation.required', { field: t('common.fields.operationalStatus') });
    }
    if (!station.structureId) {
      errors.structureId = t('common.validation.required', { field: t('common.fields.structure') });
    }
    if (!station.vendorId) {
      errors.vendorId = t('common.validation.required', { field: t('common.fields.vendor') });
    }
    if (!station.locationId) {
      errors.locationId = t('common.validation.required', { field: t('common.fields.location') });
    }
    if (!station.stationTypeId) {
      errors.stationTypeId = t('common.validation.required', { field: t('station.fields.stationType') });
    }
    if (!station.pipelineSystemId) {
      errors.pipelineSystemId = t('common.validation.required', { field: t('station.fields.pipelineSystem') });
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof StationDTO) => (e: any) => {
    const value = e.target.value;
    setStation({ ...station, [field]: value });
    
    if (field === 'locationId') {
      const loc = locations.find(l => l.id === Number(value));
      setSelectedLocation(loc || null);
    }
    
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleLocationChange = (_event: any, newValue: LocationDTO | null) => {
    setSelectedLocation(newValue);
    setStation({ ...station, locationId: newValue?.id || 0 });
    
    if (validationErrors.locationId) {
      setValidationErrors({ ...validationErrors, locationId: '' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const payload: StationDTO = {
        id: isEditMode ? Number(stationId) : undefined,
        code: String(station.code || ''),
        name: String(station.name || ''),
        installationDate: station.installationDate,
        commissioningDate: station.commissioningDate,
        decommissioningDate: station.decommissioningDate,
        operationalStatusId: Number(station.operationalStatusId),
        structureId: Number(station.structureId),
        vendorId: Number(station.vendorId),
        locationId: Number(station.locationId),
        stationTypeId: Number(station.stationTypeId),
        pipelineSystemId: Number(station.pipelineSystemId),
        pipelineIds: station.pipelineIds || [],
      };

      if (isEditMode) {
        await StationService.update(Number(stationId), payload);
      } else {
        await StationService.create(payload);
      }

      navigate('/network/core/stations');
    } catch (err: any) {
      console.error('Failed to save station:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/stations');
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {isEditMode 
                    ? t('common.page.editTitle', { entity: t('station.title') })
                    : t('common.page.createTitle', { entity: t('station.title') })
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isEditMode 
                    ? t('common.page.editSubtitle', { entity: t('station.title') })
                    : t('common.page.createSubtitle', { entity: t('station.title') })
                  }
                </Typography>
              </Box>
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
                  disabled={saving || locations.length === 0}
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

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {locations.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('station.warnings.noLocations')}
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label={t('common.fields.code')}
                    value={station.code || ''}
                    onChange={handleChange('code')} required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('common.fields.codeHelper')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label={t('common.fields.name')}
                    value={station.name || ''}
                    onChange={handleChange('name')} required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('common.fields.nameHelper')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('common.fields.structure')}
                    value={station.structureId || ''}
                    onChange={handleChange('structureId')} required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId}
                  >
                    {sortedStructures.length > 0 ? (
                      sortedStructures.map((structure) => (
                        <MenuItem key={structure.id} value={structure.id}>
                          {getLocalizedName(structure, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
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
                <Grid item xs={12}>
                  <Autocomplete
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    options={sortedLocations}
                    getOptionLabel={(option) => getLocalizedDesignation(option)}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('common.fields.location')}
                        required
                        error={!!validationErrors.locationId}
                        helperText={validationErrors.locationId || t('common.fields.locationHelper')}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <LocationIcon fontSize="small" color="action" sx={{ ml: 1, mr: 0.5 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {getLocalizedDesignation(option)}
                            </Typography>
                            {option.locality && (
                              <Typography variant="caption" color="text.secondary">
                                {getLocalizedDesignation(option.locality)}
                                {option.locality.district && ` • ${getLocalizedDesignation(option.locality.district)}`}
                                {option.locality.district?.state && ` • ${getLocalizedDesignation(option.locality.district.state)}`}
                              </Typography>
                            )}
                          </Box>
                          {option.locality && (
                            <Chip 
                              label={getLocalizedDesignation(option.locality)} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    noOptionsText={t('list.noData')}
                    loadingText={t('common.loading')}
                  />
                </Grid>

                {selectedLocation && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50', borderStyle: 'dashed' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                        📍 {t('station.selectedLocation')}
                      </Typography>
                      
                      <Grid container spacing={1.5} alignItems="flex-end">
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.place')}</Typography>
                          <Typography variant="body2" fontWeight={500} fontSize="0.875rem">
                            {getLocalizedDesignation(selectedLocation)}
                          </Typography>
                        </Grid>

                        {selectedLocation.locality && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">{t('common.fields.locality')}</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {getLocalizedDesignation(selectedLocation.locality)}
                            </Typography>
                          </Grid>
                        )}

                        {selectedLocation.locality?.district && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">{t('common.fields.district')}</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {getLocalizedDesignation(selectedLocation.locality.district)}
                            </Typography>
                          </Grid>
                        )}

                        {selectedLocation.locality?.district?.state && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">{t('common.fields.state')}</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {getLocalizedDesignation(selectedLocation.locality.district.state)}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={4} sm={3} md={1.5}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.latitude')}</Typography>
                          <Typography variant="body2" fontSize="0.875rem">{selectedLocation.latitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1.5}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.longitude')}</Typography>
                          <Typography variant="body2" fontSize="0.875rem">{selectedLocation.longitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.elevation')}</Typography>
                          <Typography variant="body2" fontSize="0.875rem">
                            {selectedLocation.elevation ? `${selectedLocation.elevation}m` : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.technicalDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('station.fields.stationType')}
                    value={station.stationTypeId || ''}
                    onChange={handleChange('stationTypeId')} required
                    error={!!validationErrors.stationTypeId}
                    helperText={validationErrors.stationTypeId}
                  >
                    {sortedStationTypes.length > 0 ? (
                      sortedStationTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {getLocalizedName(type, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('common.fields.operationalStatus')}
                    value={station.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')} required
                    error={!!validationErrors.operationalStatusId}
                    helperText={validationErrors.operationalStatusId}
                  >
                    {sortedOperationalStatuses.length > 0 ? (
                      sortedOperationalStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {getLocalizedName(status, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('common.fields.vendor')}
                    value={station.vendorId || ''}
                    onChange={handleChange('vendorId')} required
                    error={!!validationErrors.vendorId}
                    helperText={validationErrors.vendorId}
                  >
                    {vendors.length > 0 ? (
                      vendors.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('station.fields.pipelineSystem')}
                    value={station.pipelineSystemId || ''}
                    onChange={handleChange('pipelineSystemId')} required
                    error={!!validationErrors.pipelineSystemId}
                    helperText={validationErrors.pipelineSystemId}
                  >
                    {pipelineSystems.length > 0 ? (
                      pipelineSystems.map((system) => (
                        <MenuItem key={system.id} value={system.id}>
                          {system.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.importantDates')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label={t('common.fields.installationDate')}
                    type="date" value={station.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label={t('common.fields.commissioningDate')}
                    type="date" value={station.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label={t('common.fields.decommissioningDate')}
                    type="date" value={station.decommissioningDate || ''}
                    onChange={handleChange('decommissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default StationEdit;