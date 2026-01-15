/**
 * Terminal Edit/Create Page - Aligned with Backend
 * Uses locationId relationship only (no embedded location fields)
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-16-2026 - Removed legacy location fields, uses locationId only
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
import { TerminalService } from '../services';
import { VendorService, OperationalStatusService } from '../../common/services';
import { TerminalTypeService } from '../../type/services';
import { LocationService } from '../../../general/localization/services';
import { StructureService } from '../../../general/organization/services';
import { LocationDTO } from '../../../general/localization/dto';
import { TerminalDTO } from '../dto';
import { getLocalizedName } from '../utils/localizationUtils';

const TerminalEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { terminalId } = useParams<{ terminalId: string }>();
  const isEditMode = !!terminalId;

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Form state - aligned with TerminalDTO schema
  const [terminal, setTerminal] = useState<Partial<TerminalDTO>>({
    name: '',
    code: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    operationalStatusId: undefined,
    structureId: undefined,
    vendorId: undefined,
    locationId: undefined,
    terminalTypeId: undefined,
    pipelineIds: [],
  });

  // Selected location (for display purposes)
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);

  // Available options
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [terminalTypes, setTerminalTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [terminalId]);

  // Sort options by localized name
  const sortedTerminalTypes = useMemo(
    () => sortByLocalizedName(terminalTypes, currentLanguage),
    [terminalTypes, currentLanguage]
  );

  const sortedOperationalStatuses = useMemo(
    () => sortByLocalizedName(operationalStatuses, currentLanguage),
    [operationalStatuses, currentLanguage]
  );

  const sortedStructures = useMemo(
    () => sortByLocalizedName(structures, currentLanguage),
    [structures, currentLanguage]
  );

  // Helper function to sort by localized name
  function sortByLocalizedName(items: any[], language: string) {
    return [...items].sort((a, b) => {
      const nameA = getLocalizedName(a, language);
      const nameB = getLocalizedName(b, language);
      return nameA.localeCompare(nameB);
    });
  }

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load terminal first if editing
      let terminalData: TerminalDTO | null = null;
      if (isEditMode) {
        terminalData = await TerminalService.getById(Number(terminalId));
      }
      
      // Load all data from REST APIs in parallel
      const [
        locationsData,
        structuresData,
        vendorsData,
        terminalTypesData,
        operationalStatusesData,
      ] = await Promise.allSettled([
        LocationService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
        VendorService.getAllNoPagination(),
        TerminalTypeService.getAllNoPagination(),
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

      // Handle terminal types
      if (terminalTypesData.status === 'fulfilled') {
        const types = Array.isArray(terminalTypesData.value) 
          ? terminalTypesData.value 
          : [];
        setTerminalTypes(types);
      } else {
        console.error('Failed to load terminal types:', terminalTypesData.reason);
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

      // Set terminal data if editing
      if (terminalData) {
        setTerminal(terminalData);
        // Set selected location if terminal has location
        if (terminalData.location) {
          setSelectedLocation(terminalData.location);
        } else if (terminalData.locationId) {
          // Load location details if not nested
          try {
            const loc = await LocationService.getById(terminalData.locationId);
            setSelectedLocation(loc);
          } catch (err) {
            console.error('Failed to load location details:', err);
          }
        }
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

    if (!terminal.name || terminal.name.trim().length < 3) {
      errors.name = 'Terminal name must be at least 3 characters';
    }

    if (!terminal.code || terminal.code.trim().length < 2) {
      errors.code = 'Terminal code must be at least 2 characters';
    }

    if (!terminal.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }

    if (!terminal.structureId) {
      errors.structureId = 'Structure is required';
    }

    if (!terminal.vendorId) {
      errors.vendorId = 'Vendor is required';
    }

    if (!terminal.locationId) {
      errors.locationId = 'Location is required';
    }

    if (!terminal.terminalTypeId) {
      errors.terminalTypeId = 'Terminal type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof TerminalDTO) => (e: any) => {
    const value = e.target.value;
    setTerminal({ ...terminal, [field]: value });
    
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

      const payload: TerminalDTO = {
        id: isEditMode ? Number(terminalId) : undefined,
        code: String(terminal.code || ''),
        name: String(terminal.name || ''),
        
        // Dates
        installationDate: terminal.installationDate,
        commissioningDate: terminal.commissioningDate,
        decommissioningDate: terminal.decommissioningDate,
        
        // Required relationships
        operationalStatusId: Number(terminal.operationalStatusId),
        structureId: Number(terminal.structureId),
        vendorId: Number(terminal.vendorId),
        locationId: Number(terminal.locationId),
        terminalTypeId: Number(terminal.terminalTypeId),
        
        // Collections
        pipelineIds: terminal.pipelineIds || [],
        facilityIds: terminal.facilityIds || [],
      };

      if (isEditMode) {
        await TerminalService.update(Number(terminalId), payload);
      } else {
        await TerminalService.create(payload);
      }

      navigate('/network/core/terminals');
    } catch (err: any) {
      console.error('Failed to save terminal:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save terminal');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/terminals');
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
          {isEditMode ? 'Edit Terminal' : 'Create Terminal'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update terminal information and details' : 'Create a new pipeline terminal'}
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
                    label="Terminal Code"
                    value={terminal.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || '2-20 characters'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Terminal Name"
                    value={terminal.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || '3-100 characters'}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Location Information */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {/* Location Reference */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Location *"
                    value={terminal.locationId || ''}
                    onChange={handleChange('locationId')}
                    required
                    error={!!validationErrors.locationId}
                    helperText={validationErrors.locationId || 'Select the physical location with GPS coordinates'}
                  >
                    {locations.length > 0 ? (
                      locations.map((location) => (
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
                      <MenuItem disabled>Loading locations...</MenuItem>
                    )}
                  </TextField>
                </Grid>

                {/* Selected Location Details (Read-only) */}
                {selectedLocation && (
                  <Grid item xs={12}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50',
                        borderStyle: 'dashed'
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Selected Location Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Place Name</Typography>
                          <Typography variant="body2" fontWeight={500}>{selectedLocation.placeName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Latitude</Typography>
                          <Typography variant="body2" fontWeight={500}>{selectedLocation.latitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Longitude</Typography>
                          <Typography variant="body2" fontWeight={500}>{selectedLocation.longitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Elevation</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedLocation.elevation ? `${selectedLocation.elevation} m` : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>

          {/* Organization & Technical Details */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Organization & Technical Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Structure *"
                    value={terminal.structureId || ''}
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

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Terminal Type *"
                    value={terminal.terminalTypeId || ''}
                    onChange={handleChange('terminalTypeId')}
                    required
                    error={!!validationErrors.terminalTypeId}
                    helperText={validationErrors.terminalTypeId}
                  >
                    {sortedTerminalTypes.length > 0 ? (
                      sortedTerminalTypes.map((type) => (
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
                    label="Operational Status *"
                    value={terminal.operationalStatusId || ''}
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
                    label="Vendor *"
                    value={terminal.vendorId || ''}
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
                    value={terminal.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Commissioning Date"
                    type="date"
                    value={terminal.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Decommissioning Date"
                    type="date"
                    value={terminal.decommissioningDate || ''}
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

export default TerminalEdit;
