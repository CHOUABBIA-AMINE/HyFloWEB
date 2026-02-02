/**
 * Pipeline Edit/Create Page - Professional Version
 * Comprehensive form matching exact backend Pipeline entity fields
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-15-2026 - Updated to use Terminal references (departureTerminalId/arrivalTerminalId)
 * @updated 01-15-2026 - Fixed type compatibility: convert numbers to strings for DTO fields
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 02-02-2026 - Added missing required fields: ownerId, managerId, locationIds
 * @updated 02-02-2026 - Fixed LocationService import path (localization not geography)
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
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { PipelineService, PipelineSystemService, TerminalService } from '../services';
import { VendorService, OperationalStatusService, AlloyService } from '../../common/services';
import { StructureService } from '@/modules/general/organization/services';
import { LocationService } from '@/modules/general/localization/services';
import { PipelineDTO } from '../dto/PipelineDTO';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

const PipelineEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const isEditMode = !!pipelineId;

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Form state matching backend fields - using strings for fields that backend expects as strings
  const [pipeline, setPipeline] = useState<Partial<PipelineDTO>>({
    code: '',
    name: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    nominalDiameter: '0',
    length: 0,
    nominalThickness: '0',
    nominalRoughness: '0',
    designMaxServicePressure: 0,
    operationalMaxServicePressure: 0,
    designMinServicePressure: 0,
    operationalMinServicePressure: 0,
    designCapacity: 0,
    operationalCapacity: 0,
    nominalConstructionMaterialId: undefined,
    nominalExteriorCoatingId: undefined,
    nominalInteriorCoatingId: undefined,
    operationalStatusId: undefined,
    ownerId: undefined,
    managerId: undefined,
    vendorId: undefined,
    pipelineSystemId: undefined,
    departureTerminalId: undefined,
    arrivalTerminalId: undefined,
    locationIds: [],
  });

  // Available options
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [pipelineSystems, setPipelineSystems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [alloys, setAlloys] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

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
        pipelineData = await PipelineService.getById(Number(pipelineId));
      }
      
      // Load all data from REST APIs in parallel
      const [
        vendorsData,
        pipelineSystemsData,
        operationalStatusesData,
        alloysData,
        terminalsData,
        structuresData,
        locationsData,
      ] = await Promise.allSettled([
        VendorService.getAllNoPagination(),
        PipelineSystemService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        AlloyService.getAllNoPagination(),
        TerminalService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
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

      // Handle pipeline systems
      if (pipelineSystemsData.status === 'fulfilled') {
        const systems = Array.isArray(pipelineSystemsData.value) 
          ? pipelineSystemsData.value 
          : (Array.isArray((pipelineSystemsData.value as any)?.data) ? (pipelineSystemsData.value as any).data 
            : Array.isArray((pipelineSystemsData.value as any)?.content) ? (pipelineSystemsData.value as any).content : []);
        setPipelineSystems(systems);
      } else {
        console.error('Failed to load pipeline systems:', pipelineSystemsData.reason);
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

      // Handle alloys
      if (alloysData.status === 'fulfilled') {
        const alloys = Array.isArray(alloysData.value) 
          ? alloysData.value 
          : (Array.isArray((alloysData.value as any)?.data) ? (alloysData.value as any).data 
            : Array.isArray((alloysData.value as any)?.content) ? (alloysData.value as any).content : []);
        setAlloys(alloys);
      } else {
        console.error('Failed to load alloys:', alloysData.reason);
      }

      // Handle terminals
      if (terminalsData.status === 'fulfilled') {
        const terminals = Array.isArray(terminalsData.value) 
          ? terminalsData.value 
          : (Array.isArray((terminalsData.value as any)?.data) ? (terminalsData.value as any).data 
            : Array.isArray((terminalsData.value as any)?.content) ? (terminalsData.value as any).content : []);
        setTerminals(terminals);
      } else {
        console.error('Failed to load terminals:', terminalsData.reason);
        setTerminals([]);
      }

      // Handle structures
      if (structuresData.status === 'fulfilled') {
        const structures = Array.isArray(structuresData.value) 
          ? structuresData.value 
          : (Array.isArray((structuresData.value as any)?.data) ? (structuresData.value as any).data 
            : Array.isArray((structuresData.value as any)?.content) ? (structuresData.value as any).content : []);
        setStructures(structures);
      } else {
        console.error('Failed to load structures:', structuresData.reason);
        setStructures([]);
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
        setLocations([]);
      }

      // Set pipeline data if editing
      if (pipelineData) {
        setPipeline(pipelineData);
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

    if (!pipeline.name || pipeline.name.trim().length < 2) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 2 });
    }

    if (!pipeline.code || pipeline.code.trim().length < 2) {
      errors.code = t('common.validation.codeRequired');
    }

    if (!pipeline.operationalStatusId) {
      errors.operationalStatusId = t('common.validation.required', { field: t('common.fields.operationalStatus') });
    }

    if (!pipeline.ownerId) {
      errors.ownerId = t('common.validation.required', { field: t('common.fields.owner') });
    }

    if (!pipeline.managerId) {
      errors.managerId = t('common.validation.required', { field: t('common.fields.manager') });
    }

    if (!pipeline.vendorId) {
      errors.vendorId = t('common.validation.required', { field: t('common.fields.vendor') });
    }

    if (!pipeline.pipelineSystemId) {
      errors.pipelineSystemId = t('common.validation.required', { field: t('pipeline.fields.pipelineSystem') });
    }

    if (!pipeline.departureTerminalId) {
      errors.departureTerminalId = t('common.validation.required', { field: t('pipeline.fields.departureTerminal') });
    }

    if (!pipeline.arrivalTerminalId) {
      errors.arrivalTerminalId = t('common.validation.required', { field: t('pipeline.fields.arrivalTerminal') });
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

  const handleLocationsChange = (_: any, newValue: any[]) => {
    const locationIds = newValue.map(loc => loc.id);
    setPipeline({ ...pipeline, locationIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const pipelineData: Partial<PipelineDTO> = {
        code: pipeline.code!,
        name: pipeline.name!,
        installationDate: pipeline.installationDate,
        commissioningDate: pipeline.commissioningDate,
        decommissioningDate: pipeline.decommissioningDate,
        nominalDiameter: String(pipeline.nominalDiameter || '0'),
        length: pipeline.length !== undefined ? Number(pipeline.length) : 0,
        nominalThickness: String(pipeline.nominalThickness || '0'),
        nominalRoughness: String(pipeline.nominalRoughness || '0'),
        designMaxServicePressure: pipeline.designMaxServicePressure !== undefined ? Number(pipeline.designMaxServicePressure) : 0,
        operationalMaxServicePressure: pipeline.operationalMaxServicePressure !== undefined ? Number(pipeline.operationalMaxServicePressure) : 0,
        designMinServicePressure: pipeline.designMinServicePressure !== undefined ? Number(pipeline.designMinServicePressure) : 0,
        operationalMinServicePressure: pipeline.operationalMinServicePressure !== undefined ? Number(pipeline.operationalMinServicePressure) : 0,
        designCapacity: pipeline.designCapacity !== undefined ? Number(pipeline.designCapacity) : 0,
        operationalCapacity: pipeline.operationalCapacity !== undefined ? Number(pipeline.operationalCapacity) : 0,
        nominalConstructionMaterialId: pipeline.nominalConstructionMaterialId ? Number(pipeline.nominalConstructionMaterialId) : undefined,
        nominalExteriorCoatingId: pipeline.nominalExteriorCoatingId ? Number(pipeline.nominalExteriorCoatingId) : undefined,
        nominalInteriorCoatingId: pipeline.nominalInteriorCoatingId ? Number(pipeline.nominalInteriorCoatingId) : undefined,
        operationalStatusId: Number(pipeline.operationalStatusId),
        ownerId: Number(pipeline.ownerId),
        managerId: Number(pipeline.managerId),
        vendorId: Number(pipeline.vendorId),
        pipelineSystemId: Number(pipeline.pipelineSystemId),
        departureTerminalId: Number(pipeline.departureTerminalId),
        arrivalTerminalId: Number(pipeline.arrivalTerminalId),
        locationIds: pipeline.locationIds || [],
      };

      if (isEditMode) {
        await PipelineService.update(Number(pipelineId), { id: Number(pipelineId), ...pipelineData } as PipelineDTO);
      } else {
        await PipelineService.create(pipelineData as PipelineDTO);
      }

      navigate('/network/core/pipelines');
    } catch (err: any) {
      console.error('Failed to save pipeline:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/pipelines');
  };

  // Get selected locations for Autocomplete
  const selectedLocations = useMemo(() => {
    if (!pipeline.locationIds || !locations.length) return [];
    return locations.filter(loc => pipeline.locationIds?.includes(loc.id));
  }, [pipeline.locationIds, locations]);

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
          {isEditMode 
            ? t('common.page.editTitle', { entity: t('pipeline.title') })
            : t('common.page.createTitle', { entity: t('pipeline.title') })
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('pipeline.title') })
            : t('common.page.createSubtitle', { entity: t('pipeline.title') })
          }
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
                {t('common.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.code')}
                    value={pipeline.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('common.fields.codeHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.name')}
                    value={pipeline.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('common.fields.nameHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Organizational Details */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.organizationalDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('common.fields.owner')}
                    value={pipeline.ownerId || ''}
                    onChange={handleChange('ownerId')}
                    required
                    error={!!validationErrors.ownerId}
                    helperText={validationErrors.ownerId || t('common.fields.ownerHelper')}
                  >
                    {structures.length > 0 ? (
                      structures.map((structure) => (
                        <MenuItem key={structure.id} value={structure.id}>
                          {structure.designationFr} ({structure.code})
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
                    label={t('common.fields.manager')}
                    value={pipeline.managerId || ''}
                    onChange={handleChange('managerId')}
                    required
                    error={!!validationErrors.managerId}
                    helperText={validationErrors.managerId || t('common.fields.managerHelper')}
                  >
                    {structures.length > 0 ? (
                      structures.map((structure) => (
                        <MenuItem key={structure.id} value={structure.id}>
                          {structure.designationFr} ({structure.code})
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

          {/* Dimensional Specifications */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('pipeline.sections.dimensionalSpecs')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.nominalDiameter')}
                    type="number"
                    value={pipeline.nominalDiameter || '0'}
                    onChange={handleChange('nominalDiameter')}
                    inputProps={{ step: 0.01, min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.nominalThickness')}
                    type="number"
                    value={pipeline.nominalThickness || '0'}
                    onChange={handleChange('nominalThickness')}
                    inputProps={{ step: 0.01, min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.length')}
                    type="number"
                    value={pipeline.length || 0}
                    onChange={handleChange('length')}
                    inputProps={{ step: 0.01, min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.nominalRoughness')}
                    type="number"
                    value={pipeline.nominalRoughness || '0'}
                    onChange={handleChange('nominalRoughness')}
                    inputProps={{ step: 0.0001, min: 0 }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Pressure Specifications */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('pipeline.sections.pressureSpecs')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.designMaxServicePressure')}
                    type="number"
                    value={pipeline.designMaxServicePressure ?? 0}
                    onChange={handleChange('designMaxServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.operationalMaxServicePressure')}
                    type="number"
                    value={pipeline.operationalMaxServicePressure ?? 0}
                    onChange={handleChange('operationalMaxServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.designMinServicePressure')}
                    type="number"
                    value={pipeline.designMinServicePressure ?? 0}
                    onChange={handleChange('designMinServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.operationalMinServicePressure')}
                    type="number"
                    value={pipeline.operationalMinServicePressure ?? 0}
                    onChange={handleChange('operationalMinServicePressure')}
                    inputProps={{ step: 0.1, min: 0 }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Capacity Specifications */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('pipeline.sections.capacitySpecs')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.designCapacity')}
                    type="number"
                    value={pipeline.designCapacity ?? 0}
                    onChange={handleChange('designCapacity')}
                    inputProps={{ step: 0.01, min: 0 }}
                    required
                    helperText={t('pipeline.fields.designCapacityHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('pipeline.fields.operationalCapacity')}
                    type="number"
                    value={pipeline.operationalCapacity ?? 0}
                    onChange={handleChange('operationalCapacity')}
                    inputProps={{ step: 0.01, min: 0 }}
                    required
                    helperText={t('pipeline.fields.operationalCapacityHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Material & Coating */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('pipeline.sections.materialCoating')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label={t('pipeline.fields.nominalConstructionMaterial')}
                    value={pipeline.nominalConstructionMaterialId || ''}
                    onChange={handleChange('nominalConstructionMaterialId')}
                  >
                    <MenuItem value="">{t('common.actions.selectNone')}</MenuItem>
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
                    label={t('pipeline.fields.nominalExteriorCoating')}
                    value={pipeline.nominalExteriorCoatingId || ''}
                    onChange={handleChange('nominalExteriorCoatingId')}
                  >
                    <MenuItem value="">{t('common.actions.selectNone')}</MenuItem>
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
                    label={t('pipeline.fields.nominalInteriorCoating')}
                    value={pipeline.nominalInteriorCoatingId || ''}
                    onChange={handleChange('nominalInteriorCoatingId')}
                  >
                    <MenuItem value="">{t('common.actions.selectNone')}</MenuItem>
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
                {t('common.sections.operationalDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label={t('common.fields.operationalStatus')}
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
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label={t('common.fields.vendor')}
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
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label={t('pipeline.fields.pipelineSystem')}
                    value={pipeline.pipelineSystemId || ''}
                    onChange={handleChange('pipelineSystemId')}
                    required
                    error={!!validationErrors.pipelineSystemId}
                    helperText={validationErrors.pipelineSystemId}
                  >
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

          {/* Connected Terminals */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('pipeline.sections.connectedTerminals')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('pipeline.fields.departureTerminal')}
                    value={pipeline.departureTerminalId || ''}
                    onChange={handleChange('departureTerminalId')}
                    required
                    error={!!validationErrors.departureTerminalId}
                    helperText={validationErrors.departureTerminalId}
                  >
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal.id} value={terminal.id}>
                        {terminal.name} ({terminal.code})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('pipeline.fields.arrivalTerminal')}
                    value={pipeline.arrivalTerminalId || ''}
                    onChange={handleChange('arrivalTerminalId')}
                    required
                    error={!!validationErrors.arrivalTerminalId}
                    helperText={validationErrors.arrivalTerminalId}
                  >
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal.id} value={terminal.id}>
                        {terminal.name} ({terminal.code})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Geographic Details */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.geographicDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={locations}
                    value={selectedLocations}
                    onChange={handleLocationsChange}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('common.fields.locations')}
                        helperText={t('common.fields.locationsHelper')}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Important Dates */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.importantDates')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.installationDate')}
                    type="date"
                    value={pipeline.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.commissioningDate')}
                    type="date"
                    value={pipeline.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.decommissioningDate')}
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
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default PipelineEdit;