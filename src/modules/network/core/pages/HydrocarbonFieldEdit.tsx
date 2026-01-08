/**
 * HydrocarbonField Edit/Create Page - Professional Version
 * Comprehensive form for creating and editing hydrocarbon fields
 * Updated for U-006 schema (locationId reference)
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-08-2026 - Updated for U-006 location schema
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
import { HydrocarbonFieldService } from '../services';
import { VendorService, OperationalStatusService } from '../../common/services';
import { HydrocarbonFieldTypeService } from '../../type/services';
import { LocationService } from '../../../general/localization/services';
import { HydrocarbonFieldDTO } from '../dto';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

const HydrocarbonFieldEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { fieldId } = useParams<{ fieldId: string }>();
  const isEditMode = !!fieldId;

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Form state with 0 as default for numeric fields
  const [field, setField] = useState<Partial<HydrocarbonFieldDTO>>({
    name: '',
    code: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    operationalStatusId: 0,
    hydrocarbonFieldTypeId: 0,
    vendorId: 0,
    locationId: 0,
    structureId: 0,
  });

  // Available options
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [fieldTypes, setFieldTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [fieldId]);

  // Sort options by localized name
  const sortedFieldTypes = useMemo(
    () => sortByLocalizedName(fieldTypes, currentLanguage),
    [fieldTypes, currentLanguage]
  );

  const sortedOperationalStatuses = useMemo(
    () => sortByLocalizedName(operationalStatuses, currentLanguage),
    [operationalStatuses, currentLanguage]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load field first if editing
      let fieldData: HydrocarbonFieldDTO | null = null;
      if (isEditMode) {
        fieldData = await HydrocarbonFieldService.getById(Number(fieldId));
      }
      
      // Load all data from REST APIs in parallel
      const [
        vendorsData,
        fieldTypesData,
        operationalStatusesData,
        locationsData
      ] = await Promise.allSettled([
        VendorService.getAllNoPagination(),
        HydrocarbonFieldTypeService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        LocationService.getAllNoPagination(),
      ]);

      // Handle vendors
      if (vendorsData.status === 'fulfilled') {
        const vendors = Array.isArray(vendorsData.value) 
          ? vendorsData.value 
          : (Array.isArray((vendorsData.value as any)?.data) ? (vendorsData.value as any).data 
            : Array.isArray((vendorsData.value as any)?.content) ? (vendorsData.value as any).content : []);
        setVendors(vendors);
      } else {
        console.error('Failed to load vendors:', vendorsData.reason);
      }

      // Handle field types
      if (fieldTypesData.status === 'fulfilled') {
        const types = Array.isArray(fieldTypesData.value) 
          ? fieldTypesData.value 
          : (Array.isArray((fieldTypesData.value as any)?.data) ? (fieldTypesData.value as any).data 
            : Array.isArray((fieldTypesData.value as any)?.content) ? (fieldTypesData.value as any).content : []);
        setFieldTypes(types);
      } else {
        console.error('Failed to load field types:', fieldTypesData.reason);
      }

      // Handle operational statuses
      if (operationalStatusesData.status === 'fulfilled') {
        const statuses = Array.isArray(operationalStatusesData.value) 
          ? operationalStatusesData.value 
          : (Array.isArray((operationalStatusesData.value as any)?.data) ? (operationalStatusesData.value as any).data 
            : Array.isArray((operationalStatusesData.value as any)?.content) ? (operationalStatusesData.value as any).content : []);
        setOperationalStatuses(statuses);
      } else {
        console.error('Failed to load operational statuses:', operationalStatusesData.reason);
      }

      // Handle locations
      if (locationsData.status === 'fulfilled') {
        const locations = Array.isArray(locationsData.value) 
          ? locationsData.value 
          : (Array.isArray((locationsData.value as any)?.data) ? (locationsData.value as any).data 
            : Array.isArray((locationsData.value as any)?.content) ? (locationsData.value as any).content : []);
        setLocations(locations);
      } else {
        console.error('Failed to load locations:', locationsData.reason);
      }

      // Set field data if editing
      if (fieldData) {
        setField(fieldData);
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

    if (!field.name || field.name.trim().length < 2) {
      errors.name = 'Field name must be at least 2 characters';
    }

    if (!field.code || field.code.trim().length < 2) {
      errors.code = 'Field code is required';
    }

    if (!field.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }

    if (!field.hydrocarbonFieldTypeId) {
      errors.hydrocarbonFieldTypeId = 'Field type is required';
    }

    if (!field.vendorId) {
      errors.vendorId = 'Vendor is required';
    }

    if (!field.locationId) {
      errors.locationId = 'Location is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (fieldName: keyof HydrocarbonFieldDTO) => (e: any) => {
    const value = e.target.value;
    setField({ ...field, [fieldName]: value });
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors({ ...validationErrors, [fieldName]: '' });
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

      const fieldData: Partial<HydrocarbonFieldDTO> = {
        name: field.name!,
        code: field.code!,
        installationDate: field.installationDate,
        commissioningDate: field.commissioningDate,
        decommissioningDate: field.decommissioningDate,
        operationalStatusId: Number(field.operationalStatusId),
        hydrocarbonFieldTypeId: Number(field.hydrocarbonFieldTypeId),
        vendorId: Number(field.vendorId),
        locationId: Number(field.locationId),
        structureId: field.structureId ? Number(field.structureId) : 0,
      };

      if (isEditMode) {
        await HydrocarbonFieldService.update(Number(fieldId), { id: Number(fieldId), ...fieldData } as HydrocarbonFieldDTO);
      } else {
        await HydrocarbonFieldService.create(fieldData as HydrocarbonFieldDTO);
      }

      navigate('/network/core/hydrocarbon-fields');
    } catch (err: any) {
      console.error('Failed to save field:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save hydrocarbon field');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/hydrocarbon-fields');
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
          {isEditMode ? 'Edit Hydrocarbon Field' : 'Create Hydrocarbon Field'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update field information and details' : 'Create a new hydrocarbon field'}
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
                    label="Field Name"
                    value={field.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Field Code"
                    value={field.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Location"
                    value={field.locationId || ''}
                    onChange={handleChange('locationId')}
                    required
                    error={!!validationErrors.locationId}
                    helperText={validationErrors.locationId || 'Select the geographic location'}
                  >
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.placeName || location.name} ({location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading locations...</MenuItem>
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
                    label="Field Type"
                    value={field.hydrocarbonFieldTypeId || ''}
                    onChange={handleChange('hydrocarbonFieldTypeId')}
                    required
                    error={!!validationErrors.hydrocarbonFieldTypeId}
                    helperText={validationErrors.hydrocarbonFieldTypeId}
                  >
                    {sortedFieldTypes.length > 0 ? (
                      sortedFieldTypes.map((type) => (
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
                    value={field.operationalStatusId || ''}
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
                    value={field.vendorId || ''}
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
                    value={field.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Commissioning Date"
                    type="date"
                    value={field.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Decommissioning Date"
                    type="date"
                    value={field.decommissioningDate || ''}
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

export default HydrocarbonFieldEdit;