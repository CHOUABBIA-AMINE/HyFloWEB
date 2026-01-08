/**
 * Station Edit/Create Page - Updated for U-006 Schema
 * Refactored to use locationId instead of inline coordinates
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-08-2026 - Refactored for U-006 schema (locationId)
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { StationService, PipelineSystemService } from '../services';
import { VendorService, OperationalStatusService } from '../../common/services';
import { StationTypeService } from '../../type/services';
import { LocationService } from '../../../general/localization/services';
import { StructureService } from '../../../general/organization/services';
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
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!station.name || station.name.trim().length < 3) {
      errors.name = 'Station name must be at least 3 characters';
    }

    if (!station.code || station.code.trim().length < 2) {
      errors.code = 'Station code must be at least 2 characters';
    }

    if (!station.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }

    if (!station.structureId) {
      errors.structureId = 'Structure is required';
    }

    if (!station.vendorId) {
      errors.vendorId = 'Vendor is required';
    }

    if (!station.locationId) {
      errors.locationId = 'Location is required';
    }

    if (!station.stationTypeId) {
      errors.stationTypeId = 'Station type is required';
    }

    if (!station.pipelineSystemId) {
      errors.pipelineSystemId = 'Pipeline system is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof StationDTO) => (e: any) => {
    const value = e.target.value;
    setStation({ ...station, [field]: value });
    
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
      setError(err.response?.data?.message || err.message || 'Failed to save station');
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
          {isEditMode ? 'Edit Station' : 'Create Station'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update station information and details' : 'Create a new pipeline station'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Basic Information */}
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
                    label="Station Code"
                    value={station.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || '2-20 characters'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Station Name"
                    value={station.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || '3-100 characters'}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Location & Organization */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location & Organization
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Location"
                    value={station.locationId || ''}
                    onChange={handleChange('locationId')}
                    required
                    error={!!validationErrors.locationId}
                    helperText={validationErrors.locationId || 'Select the physical location'}
                  >
                    {sortedLocations.length > 0 ? (
                      sortedLocations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {getLocalizationLocalizedName(location, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading locations...</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Structure"
                    value={station.structureId || ''}
                    onChange={handleChange('structureId')}
                    required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId || 'Organizational unit'}
                  >
                    {sortedStructures.length > 0 ? (
                      sortedStructures.map((structure) => (
                        <MenuItem key={structure.id} value={structure.id}>
                          {getLocalizedName(structure, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading structures...</MenuItem>
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
                Technical Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Station Type"
                    value={station.stationTypeId || ''}
                    onChange={handleChange('stationTypeId')}
                    required
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
                      <MenuItem disabled>Loading types...</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Operational Status"
                    value={station.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')}
                    required
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
                      <MenuItem disabled>Loading statuses...</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Vendor"
                    value={station.vendorId || ''}
                    onChange={handleChange('vendorId')}
                    required
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
                      <MenuItem disabled>Loading vendors...</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Pipeline System"
                    value={station.pipelineSystemId || ''}
                    onChange={handleChange('pipelineSystemId')}
                    required
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
                      <MenuItem disabled>Loading systems...</MenuItem>
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
                Important Dates
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Installation Date"
                    type="date"
                    value={station.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Commissioning Date"
                    type="date"
                    value={station.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Decommissioning Date"
                    type="date"
                    value={station.decommissioningDate || ''}
                    onChange={handleChange('decommissioningDate')}
                    InputLabelProps={{ shrink: true }}
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

export default StationEdit;