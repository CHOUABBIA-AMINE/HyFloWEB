/**
 * ProcessingPlant Edit/Create Page - Tab-based UI
 * Production Fields tab integrated with DataGrid showing linked production fields
 * 
 * @author CHOUABBIA Amine
 * @created 01-15-2026
 * @updated 01-16-2026 - Added tabs with Production Fields DataGrid integration
 * @updated 01-16-2026 - Fixed property names: designationEn instead of nameEn
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-18-2026 - Fixed all hardcoded designationEn references to use i18n-based designation selector
 * @updated 01-18-2026 - Changed location selector from dropdown to Autocomplete with search
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, CircularProgress, Alert,
  Grid, Paper, Divider, Stack, MenuItem, Chip,
  Card, CardContent, Tabs, Tab, IconButton, Autocomplete, Tooltip
} from '@mui/material';
import {
  Save as SaveIcon, Close as CloseIcon,
  LocationOn as LocationIcon, Refresh as RefreshIcon, Edit as EditIcon,
  Factory as PlantIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ProcessingPlantService, ProductionFieldService } from '../services';
import { OperationalStatusService, VendorService } from '../../common/services';
import { ProcessingPlantTypeService } from '../../type/services';
import { StructureService } from '../../../general/organization/services';
import { LocationService } from '../../../general/localization/services';
import { LocationDTO } from '../../../general/localization/dto';
import { ProcessingPlantDTO } from '../dto/ProcessingPlantDTO';
import { ProductionFieldDTO } from '../dto/ProductionFieldDTO';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`plant-tabpanel-${index}`}
      aria-labelledby={`plant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProcessingPlantEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { plantId } = useParams<{ plantId: string }>();
  const isEditMode = !!plantId;

  // Utility function to get localized designation based on current language
  const getLocalizedDesignation = (entity: any): string => {
    if (!entity) return '';
    
    const currentLanguage = i18n.language;
    const designationKey = currentLanguage === 'ar' ? 'designationAr' 
      : currentLanguage === 'fr' ? 'designationFr' 
      : 'designationEn';
    
    // Return selected language designation or fallback to designationFr, then code
    return entity[designationKey] || entity.designationFr || entity.code || '';
  };

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

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

  // Selected location (for display purposes)
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);

  // Production Fields tab data
  const [productionFields, setProductionFields] = useState<ProductionFieldDTO[]>([]);
  const [productionFieldsLoading, setProductionFieldsLoading] = useState(false);
  const [productionFieldsError, setProductionFieldsError] = useState('');

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

  // Load production fields when tab is activated
  useEffect(() => {
    if (activeTab === 1 && isEditMode) {
      loadProductionFields();
    }
  }, [activeTab, plantId]);

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

      if (plantData) {
        setPlant(plantData);
        if (plantData.location) {
          setSelectedLocation(plantData.location);
        } else if (plantData.locationId) {
          try {
            const loc = await LocationService.getById(plantData.locationId);
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

  const loadProductionFields = async () => {
    if (!plantId) return;

    try {
      setProductionFieldsLoading(true);
      setProductionFieldsError('');
      const fields = await ProductionFieldService.findByProcessingPlant(Number(plantId));
      setProductionFields(Array.isArray(fields) ? fields : []);
    } catch (err: any) {
      console.error('Failed to load production fields:', err);
      setProductionFieldsError(err.message || t('common.errors.loadingFailed'));
      setProductionFields([]);
    } finally {
      setProductionFieldsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!plant.name || plant.name.trim().length < 3) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 3 });
    }
    if (!plant.code || plant.code.trim().length < 2) {
      errors.code = t('common.validation.codeRequired');
    }
    if (!plant.operationalStatusId) {
      errors.operationalStatusId = t('common.validation.required', { field: t('common.fields.operationalStatus') });
    }
    if (!plant.structureId) {
      errors.structureId = t('common.validation.required', { field: t('common.fields.structure') });
    }
    if (!plant.vendorId) {
      errors.vendorId = t('common.validation.required', { field: t('common.fields.vendor') });
    }
    if (!plant.locationId) {
      errors.locationId = t('common.validation.required', { field: t('common.fields.location') });
    }
    if (!plant.processingPlantTypeId) {
      errors.processingPlantTypeId = t('common.validation.required', { field: t('processingPlant.fields.type') });
    }
    if (plant.capacity === undefined || plant.capacity === null || plant.capacity < 0) {
      errors.capacity = t('common.validation.positiveNumber', { field: t('common.fields.capacity') });
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (fieldName: keyof ProcessingPlantDTO) => (e: any) => {
    const value = e.target.value;
    setPlant({ ...plant, [fieldName]: value });
    
    if (fieldName === 'locationId') {
      const loc = locations.find(l => l.id === Number(value));
      setSelectedLocation(loc || null);
    }
    
    if (validationErrors[fieldName]) {
      setValidationErrors({ ...validationErrors, [fieldName]: '' });
    }
  };

  const handleLocationChange = (_event: any, newValue: LocationDTO | null) => {
    setSelectedLocation(newValue);
    setPlant({ ...plant, locationId: newValue?.id || 0 });
    
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
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/processing-plants');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const productionFieldColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    {
      field: 'name',
      headerName: t('common.fields.name'),
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'code',
      headerName: t('common.fields.code'),
      width: 140,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
      ),
    },
    {
      field: 'capacity',
      headerName: t('common.fields.capacity'),
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? params.value.toLocaleString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'operationalStatusId',
      headerName: t('common.fields.status'),
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as ProductionFieldDTO;
        if (row.operationalStatus) {
          return <>{getLocalizedDesignation(row.operationalStatus)}</>;
        }
        return <>{row.operationalStatusId}</>;
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 110,
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => navigate(`/network/core/production-fields/${params.row.id}/edit`)}
          sx={{ color: 'primary.main' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

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
              <PlantIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {isEditMode 
                    ? t('common.page.editTitle', { entity: t('processingPlant.title') })
                    : t('common.page.createTitle', { entity: t('processingPlant.title') })
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isEditMode 
                    ? t('common.page.editSubtitle', { entity: t('processingPlant.title') })
                    : t('common.page.createSubtitle', { entity: t('processingPlant.title') })
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
                  disabled={saving || structures.length === 0 || locations.length === 0 || processingPlantTypes.length === 0}
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

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label={t('processingPlant.tabs.generalInformation')} />
          <Tab label={t('processingPlant.tabs.productionFields')} disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {structures.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('processingPlant.warnings.noStructures')}
              </Alert>
            )}
            {locations.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('processingPlant.warnings.noLocations')}
              </Alert>
            )}
            {processingPlantTypes.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('processingPlant.warnings.noTypes')}
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
                          fullWidth label={t('common.fields.code')} value={plant.code || ''}
                          onChange={handleChange('code')} required
                          error={!!validationErrors.code}
                          helperText={validationErrors.code || t('common.fields.codeHelper')}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth label={t('common.fields.name')} value={plant.name || ''}
                          onChange={handleChange('name')} required
                          error={!!validationErrors.name}
                          helperText={validationErrors.name || t('common.fields.nameHelper')}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth label={t('common.fields.capacity')}
                          type="number" value={plant.capacity ?? 0}
                          onChange={handleChange('capacity')}
                          required
                          error={!!validationErrors.capacity}
                          helperText={validationErrors.capacity || t('common.fields.capacityHelper')}
                          inputProps={{ step: 0.01, min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth select label={t('common.fields.structure')}
                          value={plant.structureId || ''}
                          onChange={handleChange('structureId')} required
                          error={!!validationErrors.structureId}
                          helperText={validationErrors.structureId}
                        >
                          {structures.length > 0 ? (
                            structures.map((struct) => (
                              <MenuItem key={struct.id} value={struct.id}>
                                {struct.name || getLocalizedDesignation(struct)}
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

                {/* Location section - same as TerminalEdit, truncated for brevity */}
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
                          options={locations}
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
                              📍 {t('processingPlant.selectedLocation')}
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
                          fullWidth select label={t('common.fields.operationalStatus')}
                          value={plant.operationalStatusId || ''}
                          onChange={handleChange('operationalStatusId')} required
                          error={!!validationErrors.operationalStatusId}
                          helperText={validationErrors.operationalStatusId}
                        >
                          {operationalStatuses.length > 0 ? (
                            operationalStatuses.map((status) => (
                              <MenuItem key={status.id} value={status.id}>
                                {getLocalizedDesignation(status)}
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
                          value={plant.vendorId || ''}
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
                          fullWidth select label={t('processingPlant.fields.type')}
                          value={plant.processingPlantTypeId || ''}
                          onChange={handleChange('processingPlantTypeId')} required
                          error={!!validationErrors.processingPlantTypeId}
                          helperText={validationErrors.processingPlantTypeId}
                        >
                          {processingPlantTypes.length > 0 ? (
                            processingPlantTypes.map((type) => (
                              <MenuItem key={type.id} value={type.id}>
                                {getLocalizedDesignation(type)}
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
                          type="date"
                          value={plant.installationDate || ''}
                          onChange={handleChange('installationDate')}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth label={t('common.fields.commissioningDate')}
                          type="date"
                          value={plant.commissioningDate || ''}
                          onChange={handleChange('commissioningDate')}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth label={t('common.fields.decommissioningDate')}
                          type="date"
                          value={plant.decommissioningDate || ''}
                          onChange={handleChange('decommissioningDate')}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Stack>
            </form>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {productionFieldsError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProductionFieldsError('')}>
                {productionFieldsError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {t('processingPlant.tabs.productionFieldsSupplied')}
              </Typography>
              <IconButton onClick={loadProductionFields} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>

            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <DataGrid
                rows={productionFields}
                columns={productionFieldColumns}
                loading={productionFieldsLoading}
                disableRowSelectionOnClick
                autoHeight
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                }}
              />
            </Paper>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProcessingPlantEdit;