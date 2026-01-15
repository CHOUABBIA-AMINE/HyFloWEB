/**
 * ProcessingPlant Edit/Create Page
 * Comprehensive form for processing plant management
 * 
 * @author CHOUABBIA Amine
 * @created 01-15-2026
 * @updated 01-15-2026 - Fixed LocationService import path
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, Button, CircularProgress, Alert,
  Grid, Paper, Divider, Stack, MenuItem
} from '@mui/material';
import {
  Save as SaveIcon, Cancel as CancelIcon, ArrowBack as BackIcon
} from '@mui/icons-material';
import { ProcessingPlantService } from '../services';
import { OperationalStatusService, VendorService } from '../../common/services';
import { ProcessingPlantTypeService } from '../../type/services';
import { StructureService } from '../../../general/organization/services';
import { LocationService } from '../../../general/localization/services';
import { ProcessingPlantDTO } from '../dto/ProcessingPlantDTO';

const ProcessingPlantEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { plantId } = useParams<{ plantId: string }>();
  const isEditMode = !!plantId;

  const [plant, setPlant] = useState<Partial<ProcessingPlantDTO>>({
    code: '',
    name: '',
    capacity: 0,
    operationalStatusId: 0,
    structureId: 0,
    vendorId: 0,
    locationId: 0,
    processingPlantTypeId: 0,
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
  });

  const [structures, setStructures] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [processingPlantTypes, setProcessingPlantTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [plantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let plantData: ProcessingPlantDTO | null = null;
      if (isEditMode) {
        plantData = await ProcessingPlantService.getById(Number(plantId));
      }
      
      const [
        structuresData,
        vendorsData,
        locationsData,
        statusesData,
        typesData
      ] = await Promise.allSettled([
        StructureService.getAllNoPagination(),
        VendorService.getAllNoPagination(),
        LocationService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        ProcessingPlantTypeService.getAllNoPagination(),
      ]);

      if (structuresData.status === 'fulfilled') {
        const structs = Array.isArray(structuresData.value) 
          ? structuresData.value 
          : (Array.isArray((structuresData.value as any)?.data) ? (structuresData.value as any).data : []);
        setStructures(structs);
      }

      if (vendorsData.status === 'fulfilled') {
        const vends = Array.isArray(vendorsData.value) 
          ? vendorsData.value 
          : (Array.isArray((vendorsData.value as any)?.data) ? (vendorsData.value as any).data : []);
        setVendors(vends);
      }

      if (locationsData.status === 'fulfilled') {
        const locs = Array.isArray(locationsData.value) 
          ? locationsData.value 
          : (Array.isArray((locationsData.value as any)?.data) ? (locationsData.value as any).data : []);
        setLocations(locs);
      }

      if (statusesData.status === 'fulfilled') {
        const stats = Array.isArray(statusesData.value) 
          ? statusesData.value 
          : (Array.isArray((statusesData.value as any)?.data) ? (statusesData.value as any).data : []);
        setOperationalStatuses(stats);
      }

      if (typesData.status === 'fulfilled') {
        const types = Array.isArray(typesData.value) 
          ? typesData.value 
          : (Array.isArray((typesData.value as any)?.data) ? (typesData.value as any).data : []);
        setProcessingPlantTypes(types);
      }

      if (plantData) setPlant(plantData);
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
    if (!plant.name || plant.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    if (!plant.code || plant.code.trim().length < 2) {
      errors.code = 'Code is required (min 2 characters)';
    }
    if (!plant.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }
    if (!plant.structureId) {
      errors.structureId = 'Structure is required';
    }
    if (!plant.vendorId) {
      errors.vendorId = 'Vendor is required';
    }
    if (!plant.locationId) {
      errors.locationId = 'Location is required';
    }
    if (!plant.processingPlantTypeId) {
      errors.processingPlantTypeId = 'Processing plant type is required';
    }
    if (plant.capacity === undefined || plant.capacity === null || plant.capacity < 0) {
      errors.capacity = 'Capacity must be a positive number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (fieldName: keyof ProcessingPlantDTO) => (e: any) => {
    const value = e.target.value;
    setPlant({ ...plant, [fieldName]: value });
    if (validationErrors[fieldName]) {
      setValidationErrors({ ...validationErrors, [fieldName]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const plantData: Partial<ProcessingPlantDTO> = {
        code: plant.code!,
        name: plant.name!,
        capacity: Number(plant.capacity) || 0,
        operationalStatusId: Number(plant.operationalStatusId),
        structureId: Number(plant.structureId),
        vendorId: Number(plant.vendorId),
        locationId: Number(plant.locationId),
        processingPlantTypeId: Number(plant.processingPlantTypeId),
        installationDate: plant.installationDate,
        commissioningDate: plant.commissioningDate,
        decommissioningDate: plant.decommissioningDate,
      };

      if (isEditMode) {
        await ProcessingPlantService.update(Number(plantId), { id: Number(plantId), ...plantData } as ProcessingPlantDTO);
      } else {
        await ProcessingPlantService.create(plantData as ProcessingPlantDTO);
      }

      navigate('/network/core/processing-plants');
    } catch (err: any) {
      console.error('Failed to save processing plant:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save processing plant');
    } finally {
      setSaving(false);
    }
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
        <Button startIcon={<BackIcon />} onClick={() => navigate('/network/core/processing-plants')} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEditMode ? 'Edit Processing Plant' : 'Create Processing Plant'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update processing plant information' : 'Create a new processing plant'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Code" value={plant.code || ''}
                    onChange={handleChange('code')} required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || 'Min 2, max 20 characters'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Name" value={plant.name || ''}
                    onChange={handleChange('name')} required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || 'Min 3, max 100 characters'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Capacity"
                    type="number" value={plant.capacity ?? 0}
                    onChange={handleChange('capacity')}
                    required
                    error={!!validationErrors.capacity}
                    helperText={validationErrors.capacity || 'Processing capacity (required)'}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Operational Status"
                    value={plant.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')} required
                    error={!!validationErrors.operationalStatusId}
                    helperText={validationErrors.operationalStatusId}
                  >
                    {operationalStatuses.length > 0 ? (
                      operationalStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>{status.nameEn || status.code}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading statuses...</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Structure"
                    value={plant.structureId || ''}
                    onChange={handleChange('structureId')} required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId}
                  >
                    {structures.length > 0 ? (
                      structures.map((struct) => (
                        <MenuItem key={struct.id} value={struct.id}>{struct.name}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading structures...</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Vendor"
                    value={plant.vendorId || ''}
                    onChange={handleChange('vendorId')} required
                    error={!!validationErrors.vendorId}
                    helperText={validationErrors.vendorId}
                  >
                    {vendors.length > 0 ? (
                      vendors.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading vendors...</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Location"
                    value={plant.locationId || ''}
                    onChange={handleChange('locationId')} required
                    error={!!validationErrors.locationId}
                    helperText={validationErrors.locationId}
                  >
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading locations...</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Processing Plant Type"
                    value={plant.processingPlantTypeId || ''}
                    onChange={handleChange('processingPlantTypeId')} required
                    error={!!validationErrors.processingPlantTypeId}
                    helperText={validationErrors.processingPlantTypeId}
                  >
                    {processingPlantTypes.length > 0 ? (
                      processingPlantTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>{type.nameEn || type.code}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading types...</MenuItem>
                    )}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Important Dates</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label="Installation Date"
                    type="date"
                    value={plant.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label="Commissioning Date"
                    type="date"
                    value={plant.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label="Decommissioning Date"
                    type="date"
                    value={plant.decommissioningDate || ''}
                    onChange={handleChange('decommissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined" startIcon={<CancelIcon />}
                onClick={() => navigate('/network/core/processing-plants')}
                disabled={saving}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit" variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving} sx={{ minWidth: 150 }}
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

export default ProcessingPlantEdit;