/**
 * Station Edit/Create Page - Updated for U-006 Schema
 * Refactored to use locationId instead of inline coordinates
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-08-2026 - Refactored for U-006 schema (locationId)
 * @updated 01-10-2026 - Applied i18n translations
 * @updated 01-16-2026 - Applied compact location details template (single row layout)
 */

import { useState, useEffect, useMemo } from 'react';
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
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { StationService, PipelineSystemService } from '../services';
import { VendorService, OperationalStatusService } from '../../common/services';
import { StationTypeService } from '../../type/services';
import { LocationService } from '../../../general/localization/services';
import { StructureService } from '../../../general/organization/services';
import { LocationDTO } from '../../../general/localization/dto';
import { StationDTO } from '../dto';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';
import { getLocalizedName as getLocalizationLocalizedName } from '../../../general/localization/utils';

const StationEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stationId } = useParams<{ stationId: string }>();
  const isEditMode = !!stationId;

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Form state - aligned with StationDTO schema
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

  // Selected location (for display purposes)
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);

  // Available options
  const [locations, setLocations] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [stationTypes, setStationTypes] = useState<any[]>([]);
  const [pipelineSystems, setPipelineSystems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [stationId]);

  // Sort options by localized name
  const sortedStationTypes = useMemo(
    () => sortByLocalizedName(stationTypes, currentLanguage),
    [stationTypes, currentLanguage]
  );

  const sortedOperationalStatuses = useMemo(
    () => sortByLocalizedName(operationalStatuses, currentLanguage),
    [operationalStatuses, currentLanguage]
  );

  const sortedLocations = useMemo(
    () => sortByLocalizedName(locations, currentLanguage),
    [locations, currentLanguage]
  );

  const sortedStructures = useMemo(
    () => sortByLocalizedName(structures, currentLanguage),
    [structures, currentLanguage]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load station first if editing
      let stationData: StationDTO | null = null;
      if (isEditMode) {
        stationData = await StationService.getById(Number(stationId));
      }
      
      // Load all data from REST APIs in parallel
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

      // Handle locations
      if (locationsData.status === 'fulfilled') {
        const locs = Array.isArray(locationsData.value) 
          ? locationsData.value 
          : [];
        setLocations(locs);
      } else {
        console.error('Failed to load locations:', locationsData.reason);
      }

      // Handle structures
      if (structuresData.status === 'fulfilled') {
        const structs = Array.isArray(structuresData.value) 
          ? structuresData.value 
          : [];
        setStructures(structs);
      } else {
        console.error('Failed to load structures:', structuresData.reason);
      }

      // Handle vendors
      if (vendorsData.status === 'fulfilled') {
        const vnds = Array.isArray(vendorsData.value) 
          ? vendorsData.value 
          : [];
        setVendors(vnds);
      } else {
        console.error('Failed to load vendors:', vendorsData.reason);
      }

      // Handle pipeline systems
      if (pipelineSystemsData.status === 'fulfilled') {
        const systems = Array.isArray(pipelineSystemsData.value) 
          ? pipelineSystemsData.value 
          : [];
        setPipelineSystems(systems);
      } else {
        console.error('Failed to load pipeline systems:', pipelineSystemsData.reason);
      }

      // Handle station types
      if (stationTypesData.status === 'fulfilled') {
        const types = Array.isArray(stationTypesData.value) 
          ? stationTypesData.value 
          : [];
        setStationTypes(types);
      } else {
        console.error('Failed to load station types:', stationTypesData.reason);
      }

      // Handle operational statuses
      if (operationalStatusesData.status === 'fulfilled') {
        const statuses = Array.isArray(operationalStatusesData.value) 
          ? operationalStatusesData.value 
          : [];
        setOperationalStatuses(statuses);
      } else {
        console.error('Failed to load operational statuses:', operationalStatusesData.reason);
      }

      // Set station data if editing
      if (stationData) {
        setStation(stationData);
        // Set selected location if station has location
        if (stationData.location) {
          setSelectedLocation(stationData.location);
        } else if (stationData.locationId) {
          // Load location details if not nested
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
      setError(err.message || t('station.errorLoadingFormData'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!station.name || station.name.trim().length < 3) {
      errors.name = t('station.validation.nameRequired');
    }

    if (!station.code || station.code.trim().length < 2) {
      errors.code = t('station.validation.codeRequired');
    }

    if (!station.operationalStatusId) {
      errors.operationalStatusId = t('station.validation.operationalStatusRequired');
    }

    if (!station.structureId) {
      errors.structureId = t('station.validation.structureRequired');
    }

    if (!station.vendorId) {
      errors.vendorId = t('station.validation.vendorRequired');
    }

    if (!station.locationId) {
      errors.locationId = t('station.validation.locationRequired');
    }

    if (!station.stationTypeId) {
      errors.stationTypeId = t('station.validation.stationTypeRequired');
    }

    if (!station.pipelineSystemId) {
      errors.pipelineSystemId = t('station.validation.pipelineSystemRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof StationDTO) => (e: any) => {
    const value = e.target.value;
    setStation({ ...station, [field]: value });
    
    // If location changed, update selected location for display
    if (field === 'locationId') {
      const loc = locations.find(l => l.id === Number(value));
      setSelectedLocation(loc || null);
    }
    
    // Clear validation error for this field
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

      const payload: StationDTO = {
        id: isEditMode ? Number(stationId) : undefined,
        code: String(station.code || ''),
        name: String(station.name || ''),
        
        // Dates
        installationDate: station.installationDate,
        commissioningDate: station.commissioningDate,
        decommissioningDate: station.decommissioningDate,
        
        // Required relationships
        operationalStatusId: Number(station.operationalStatusId),
        structureId: Number(station.structureId),
        vendorId: Number(station.vendorId),
        locationId: Number(station.locationId),
        stationTypeId: Number(station.stationTypeId),
        pipelineSystemId: Number(station.pipelineSystemId),
        
        // Collections
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
      setError(err.response?.data?.message || err.message || t('station.saveError'));
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isEditMode ? t('station.edit') : t('station.create')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? t('station.editSubtitle') : t('station.createSubtitle')}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Warning for empty locations */}
      {locations.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No locations available. Please create locations first in General → Localization → Locations.
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('station.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('station.fields.code')}
                    value={station.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('station.fields.codeHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('station.fields.name')}
                    value={station.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('station.fields.nameHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Location Information */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('station.sections.locationOrganization')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {/* Location Reference */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label={t('station.fields.location')}
                    value={station.locationId || ''}
                    onChange={handleChange('locationId')}
                    required
                    error={!!validationErrors.locationId}
                    helperText={validationErrors.locationId || `Select the physical location with GPS coordinates (${locations.length} available)`}
                  >
                    {locations.length > 0 ? (
                      sortedLocations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <span>{location.placeName}</span>
                            {location.locality && (
                              <Chip 
                                label={location.locality.designationFr || location.locality.designationEn} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No locations available</MenuItem>
                    )}
                  </TextField>
                </Grid>

                {/* Selected Location Details (Single Row) */}
                {selectedLocation && (
                  <Grid item xs={12}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50',
                        borderStyle: 'dashed'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                        📍 Selected Location
                      </Typography>
                      
                      <Grid container spacing={1.5} alignItems="flex-end">
                        {/* Place */}
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="caption" color="text.secondary">Place</Typography>
                          <Typography variant="body2" fontWeight={500} fontSize="0.875rem">{selectedLocation.placeName}</Typography>
                        </Grid>

                        {/* Locality */}
                        {selectedLocation.locality && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">Locality</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {selectedLocation.locality.designationEn || selectedLocation.locality.designationFr}
                            </Typography>
                          </Grid>
                        )}

                        {/* District */}
                        {selectedLocation.locality?.district && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">District</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {selectedLocation.locality.district.designationEn || selectedLocation.locality.district.designationFr}
                            </Typography>
                          </Grid>
                        )}

                        {/* State */}
                        {selectedLocation.locality?.district?.state && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">State</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {selectedLocation.locality.district.state.designationEn || selectedLocation.locality.district.state.designationFr}
                            </Typography>
                          </Grid>
                        )}

                        {/* Coordinates */}
                        <Grid item xs={4} sm={3} md={1.5}>
                          <Typography variant="caption" color="text.secondary">Latitude</Typography>
                          <Typography variant="body2" fontSize="0.875rem">{selectedLocation.latitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1.5}>
                          <Typography variant="caption" color="text.secondary">Longitude</Typography>
                          <Typography variant="body2" fontSize="0.875rem">{selectedLocation.longitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1}>
                          <Typography variant="caption" color="text.secondary">Elev</Typography>
                          <Typography variant="body2" fontSize="0.875rem">
                            {selectedLocation.elevation ? `${selectedLocation.elevation}m` : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Structure */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('station.fields.structure')}
                    value={station.structureId || ''}
                    onChange={handleChange('structureId')}
                    required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId || t('station.fields.structureHelper')}
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

          {/* Technical Details */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('station.sections.technicalDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('station.fields.stationType')}
                    value={station.stationTypeId || ''}
                    onChange={handleChange('stationTypeId')}
                    required
                    error={!!validationErrors.stationTypeId}
                    helperText={validationErrors.stationTypeId || t('station.fields.stationTypeHelper')}
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
                    fullWidth
                    select
                    label={t('station.fields.operationalStatus')}
                    value={station.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')}
                    required
                    error={!!validationErrors.operationalStatusId}
                    helperText={validationErrors.operationalStatusId || t('station.fields.operationalStatusHelper')}
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
                    fullWidth
                    select
                    label={t('station.fields.vendor')}
                    value={station.vendorId || ''}
                    onChange={handleChange('vendorId')}
                    required
                    error={!!validationErrors.vendorId}
                    helperText={validationErrors.vendorId || t('station.fields.vendorHelper')}
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
                    fullWidth
                    select
                    label={t('station.fields.pipelineSystem')}
                    value={station.pipelineSystemId || ''}
                    onChange={handleChange('pipelineSystemId')}
                    required
                    error={!!validationErrors.pipelineSystemId}
                    helperText={validationErrors.pipelineSystemId || t('station.fields.pipelineSystemHelper')}
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

          {/* Important Dates */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('station.sections.importantDates')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('station.fields.installationDate')}
                    type="date"
                    value={station.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                    helperText={t('station.fields.installationDateHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('station.fields.commissioningDate')}
                    type="date"
                    value={station.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                    helperText={t('station.fields.commissioningDateHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('station.fields.decommissioningDate')}
                    type="date"
                    value={station.decommissioningDate || ''}
                    onChange={handleChange('decommissioningDate')}
                    InputLabelProps={{ shrink: true }}
                    helperText={t('station.fields.decommissioningDateHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Actions */}
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
                disabled={saving || locations.length === 0}
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

export default StationEdit;