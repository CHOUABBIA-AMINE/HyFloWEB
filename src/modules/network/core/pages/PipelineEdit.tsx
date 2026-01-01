/**
 * Pipeline Edit/Create Page - Professional Version
 * Comprehensive form matching exact backend Pipeline entity fields
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-24-2025
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
import { pipelineService, pipelineSystemService, facilityService } from '../services';
import { vendorService, operationalStatusService, alloyService } from '../../common/services';
import { PipelineDTO, PipelineCreateDTO } from '../dto/PipelineDTO';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

const PipelineEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const isEditMode = !!pipelineId;

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Form state matching backend fields with 0 as default for numeric fields
  const [pipeline, setPipeline] = useState<Partial<PipelineDTO>>({
    code: '',
    name: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    nominalDiameter: 0,
    length: 0,
    nominalThickness: 0,
    nominalRoughness: 0,
    designMaxServicePressure: 0,
    operationalMaxServicePressure: 0,
    designMinServicePressure: 0,
    operationalMinServicePressure: 0,
    designCapacity: 0,
    operationalCapacity: 0,
    nominalConstructionMaterialId: undefined,
    nominalExteriorCoatingId: undefined,
    nominalInteriorCoatingId: undefined,
    operationalStatusId: 0,
    vendorId: 0,
    pipelineSystemId: undefined,
    departureFacilityId: undefined,
    arrivalFacilityId: undefined,
  });

  // Available options
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [pipelineSystems, setPipelineSystems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [alloys, setAlloys] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [pipelineId]);

  // Sort options by localized name
  const sortedOperationalStatuses = useMemo(
    () => sortByLocalizedName(operationalStatuses, currentLanguage),
    [operationalStatuses, currentLanguage]
  );

  const sortedAlloys = useMemo(
    () => sortByLocalizedName(alloys, currentLanguage),
    [alloys, currentLanguage]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pipeline first if editing
      let pipelineData: PipelineDTO | null = null;
      if (isEditMode) {
        pipelineData = await pipelineService.getById(Number(pipelineId));
      }
      
      // Load all data from REST APIs in parallel
      const [
        vendorsData,
        pipelineSystemsData,
        operationalStatusesData,
        alloysData,
        facilitiesData,
      ] = await Promise.allSettled([
        vendorService.getAll(),
        pipelineSystemService.getAll(),
        operationalStatusService.getAll(),
        alloyService.getAll(),
        facilityService.getAll(),
      ]);

      // Handle vendors
      if (vendorsData.status === 'fulfilled') {
        const vendors = Array.isArray(vendorsData.value) 
          ? vendorsData.value 
          : (vendorsData.value?.data || vendorsData.value?.content || []);
        setVendors(vendors);
      } else {
        console.error('Failed to load vendors:', vendorsData.reason);
      }

      // Handle pipeline systems
      if (pipelineSystemsData.status === 'fulfilled') {
        const systems = Array.isArray(pipelineSystemsData.value) 
          ? pipelineSystemsData.value 
          : (pipelineSystemsData.value?.data || pipelineSystemsData.value?.content || []);
        setPipelineSystems(systems);
      } else {
        console.error('Failed to load pipeline systems:', pipelineSystemsData.reason);
      }

      // Handle operational statuses
      if (operationalStatusesData.status === 'fulfilled') {
        const statuses = Array.isArray(operationalStatusesData.value) 
          ? operationalStatusesData.value 
          : (operationalStatusesData.value?.data || operationalStatusesData.value?.content || []);
        setOperationalStatuses(statuses);
      } else {
        console.error('Failed to load operational statuses:', operationalStatusesData.reason);
      }

      // Handle alloys
      if (alloysData.status === 'fulfilled') {
        const alloys = Array.isArray(alloysData.value) 
          ? alloysData.value 
          : (alloysData.value?.data || alloysData.value?.content || []);
        setAlloys(alloys);
      } else {
        console.error('Failed to load alloys:', alloysData.reason);
      }

      // Handle facilities
      if (facilitiesData.status === 'fulfilled') {
        const facilities = Array.isArray(facilitiesData.value) 
          ? facilitiesData.value 
          : (facilitiesData.value?.data || facilitiesData.value?.content || []);
        setFacilities(facilities);
      } else {
        console.error('Failed to load facilities:', facilitiesData.reason);
        setFacilities([]);
      }

      // Set pipeline data if editing
      if (pipelineData) {
        setPipeline(pipelineData);
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

    if (!pipeline.name || pipeline.name.trim().length < 2) {
      errors.name = 'Pipeline name must be at least 2 characters';
    }

    if (!pipeline.code || pipeline.code.trim().length < 2) {
      errors.code = 'Pipeline code is required';
    }

    if (!pipeline.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }

    if (!pipeline.vendorId) {
      errors.vendorId = 'Vendor is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PipelineDTO) => (e: any) => {
    const value = e.target.value;
    setPipeline({ ...pipeline, [field]: value });
    
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

      const pipelineData: PipelineCreateDTO = {
        code: pipeline.code!,
        name: pipeline.name!,
        installationDate: pipeline.installationDate,
        commissioningDate: pipeline.commissioningDate,
        decommissioningDate: pipeline.decommissioningDate,
        nominalDiameter: pipeline.nominalDiameter !== undefined ? Number(pipeline.nominalDiameter) : undefined,
        length: pipeline.length !== undefined ? Number(pipeline.length) : undefined,
        nominalThickness: pipeline.nominalThickness !== undefined ? Number(pipeline.nominalThickness) : undefined,
        nominalRoughness: pipeline.nominalRoughness !== undefined ? Number(pipeline.nominalRoughness) : undefined,
        designMaxServicePressure: pipeline.designMaxServicePressure !== undefined ? Number(pipeline.designMaxServicePressure) : undefined,
        operationalMaxServicePressure: pipeline.operationalMaxServicePressure !== undefined ? Number(pipeline.operationalMaxServicePressure) : undefined,
        designMinServicePressure: pipeline.designMinServicePressure !== undefined ? Number(pipeline.designMinServicePressure) : undefined,
        operationalMinServicePressure: pipeline.operationalMinServicePressure !== undefined ? Number(pipeline.operationalMinServicePressure) : undefined,
        designCapacity: pipeline.designCapacity !== undefined ? Number(pipeline.designCapacity) : undefined,
        operationalCapacity: pipeline.operationalCapacity !== undefined ? Number(pipeline.operationalCapacity) : undefined,
        nominalConstructionMaterialId: pipeline.nominalConstructionMaterialId ? Number(pipeline.nominalConstructionMaterialId) : undefined,
        nominalExteriorCoatingId: pipeline.nominalExteriorCoatingId ? Number(pipeline.nominalExteriorCoatingId) : undefined,
        nominalInteriorCoatingId: pipeline.nominalInteriorCoatingId ? Number(pipeline.nominalInteriorCoatingId) : undefined,
        operationalStatusId: Number(pipeline.operationalStatusId),
        vendorId: Number(pipeline.vendorId),
        pipelineSystemId: pipeline.pipelineSystemId ? Number(pipeline.pipelineSystemId) : undefined,
        departureFacilityId: pipeline.departureFacilityId ? Number(pipeline.departureFacilityId) : undefined,
        arrivalFacilityId: pipeline.arrivalFacilityId ? Number(pipeline.arrivalFacilityId) : undefined,
      };

      if (isEditMode) {
        await pipelineService.update(Number(pipelineId), { id: Number(pipelineId), ...pipelineData });
      } else {
        await pipelineService.create(pipelineData);
      }

      navigate('/network/core/pipelines');
    } catch (err: any) {
      console.error('Failed to save pipeline:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save pipeline');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/pipelines');
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
          {isEditMode ? 'Edit Pipeline' : 'Create Pipeline'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update pipeline information and details' : 'Create a new pipeline'}
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
                    label="Pipeline Code"
                    value={pipeline.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pipeline Name"
                    value={pipeline.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Dimensional Specifications */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Dimensional Specifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Nominal Diameter (in)"
                    type="number"
                    value={pipeline.nominalDiameter ?? 0}
                    onChange={handleChange('nominalDiameter')}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Nominal Thickness (mm)"
                    type="number"
                    value={pipeline.nominalThickness ?? 0}
                    onChange={handleChange('nominalThickness')}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Length (km)"
                    type="number"
                    value={pipeline.length ?? 0}
                    onChange={handleChange('length')}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Nominal Roughness (mm)"
                    type="number"
                    value={pipeline.nominalRoughness ?? 0}
                    onChange={handleChange('nominalRoughness')}
                    inputProps={{ step: 0.0001, min: 0 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Pressure Specifications */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Pressure Specifications (bar)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Design Max Service Pressure"
                    type="number"
                    value={pipeline.designMaxServicePressure ?? 0}
                    onChange={handleChange('designMaxServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Operational Max Service Pressure"
                    type="number"
                    value={pipeline.operationalMaxServicePressure ?? 0}
                    onChange={handleChange('operationalMaxServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Design Min Service Pressure"
                    type="number"
                    value={pipeline.designMinServicePressure ?? 0}
                    onChange={handleChange('designMinServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Operational Min Service Pressure"
                    type="number"
                    value={pipeline.operationalMinServicePressure ?? 0}
                    onChange={handleChange('operationalMinServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Capacity Specifications */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Capacity Specifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Design Capacity"
                    type="number"
                    value={pipeline.designCapacity ?? 0}
                    onChange={handleChange('designCapacity')}
                    inputProps={{ step: 0.01, min: 0 }}
                    helperText="Maximum designed throughput capacity"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Operational Capacity"
                    type="number"
                    value={pipeline.operationalCapacity ?? 0}
                    onChange={handleChange('operationalCapacity')}
                    inputProps={{ step: 0.01, min: 0 }}
                    helperText="Current operational throughput capacity"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Material & Coating */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Material & Coating
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Nominal Construction Material"
                    value={pipeline.nominalConstructionMaterialId || ''}
                    onChange={handleChange('nominalConstructionMaterialId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {sortedAlloys.map((alloy) => (
                      <MenuItem key={alloy.id} value={alloy.id}>
                        {getLocalizedName(alloy, currentLanguage)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Nominal Exterior Coating"
                    value={pipeline.nominalExteriorCoatingId || ''}
                    onChange={handleChange('nominalExteriorCoatingId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {sortedAlloys.map((alloy) => (
                      <MenuItem key={alloy.id} value={alloy.id}>
                        {getLocalizedName(alloy, currentLanguage)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Nominal Interior Coating"
                    value={pipeline.nominalInteriorCoatingId || ''}
                    onChange={handleChange('nominalInteriorCoatingId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {sortedAlloys.map((alloy) => (
                      <MenuItem key={alloy.id} value={alloy.id}>
                        {getLocalizedName(alloy, currentLanguage)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Operational Details */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Operational Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Operational Status"
                    value={pipeline.operationalStatusId || ''}
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
                    value={pipeline.vendorId || ''}
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Pipeline System"
                    value={pipeline.pipelineSystemId || ''}
                    onChange={handleChange('pipelineSystemId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {pipelineSystems.map((system) => (
                      <MenuItem key={system.id} value={system.id}>
                        {system.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Connected Facilities */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Connected Facilities
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Departure Facility"
                    value={pipeline.departureFacilityId || ''}
                    onChange={handleChange('departureFacilityId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {facilities.map((facility) => (
                      <MenuItem key={facility.id} value={facility.id}>
                        {facility.name} ({facility.code})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Arrival Facility"
                    value={pipeline.arrivalFacilityId || ''}
                    onChange={handleChange('arrivalFacilityId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {facilities.map((facility) => (
                      <MenuItem key={facility.id} value={facility.id}>
                        {facility.name} ({facility.code})
                      </MenuItem>
                    ))}
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
                    value={pipeline.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Commissioning Date"
                    type="date"
                    value={pipeline.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Decommissioning Date"
                    type="date"
                    value={pipeline.decommissioningDate || ''}
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

export default PipelineEdit;
