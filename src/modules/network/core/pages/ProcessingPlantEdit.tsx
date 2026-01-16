/**
 * ProcessingPlant Edit/Create Page - Tab-based UI
 * Production Fields tab integrated with DataGrid showing linked production fields
 * 
 * @author CHOUABBIA Amine
 * @created 01-15-2026
 * @updated 01-16-2026 - Added tabs with Production Fields DataGrid integration
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, Button, CircularProgress, Alert,
  Grid, Paper, Divider, Stack, MenuItem, Chip,
  Card, CardContent, Tabs, Tab, IconButton
} from '@mui/material';
import {
  Save as SaveIcon, Cancel as CancelIcon, ArrowBack as BackIcon,
  LocationOn as LocationIcon, Refresh as RefreshIcon, Edit as EditIcon
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { plantId } = useParams<{ plantId: string }>();
  const isEditMode = !!plantId;

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
      console.log('🔄 Loading data for ProcessingPlantEdit...');
      
      let plantData: ProcessingPlantDTO | null = null;
      if (isEditMode) {
        console.log('📝 Loading existing plant with ID:', plantId);
        plantData = await ProcessingPlantService.getById(Number(plantId));
        console.log('✅ Plant data loaded:', plantData);
      }
      
      console.log('📦 Fetching reference data...');
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

      // Structure data
      if (structuresData.status === 'fulfilled') {
        const structs = Array.isArray(structuresData.value) 
          ? structuresData.value 
          : (Array.isArray((structuresData.value as any)?.data) ? (structuresData.value as any).data : []);
        console.log('✅ Structures loaded:', structs.length, 'items');
        setStructures(structs);
      } else {
        console.error('❌ Failed to load structures:', structuresData.reason);
      }

      // Vendor data
      if (vendorsData.status === 'fulfilled') {
        const vends = Array.isArray(vendorsData.value) 
          ? vendorsData.value 
          : (Array.isArray((vendorsData.value as any)?.data) ? (vendorsData.value as any).data : []);
        console.log('✅ Vendors loaded:', vends.length, 'items');
        setVendors(vends);
      } else {
        console.error('❌ Failed to load vendors:', vendorsData.reason);
      }

      // Location data
      if (locationsData.status === 'fulfilled') {
        const locs = Array.isArray(locationsData.value) 
          ? locationsData.value 
          : (Array.isArray((locationsData.value as any)?.data) ? (locationsData.value as any).data : []);
        console.log('✅ Locations loaded:', locs.length, 'items');
        setLocations(locs);
      } else {
        console.error('❌ Failed to load locations:', locationsData.reason);
      }

      // Operational Status data
      if (statusesData.status === 'fulfilled') {
        const stats = Array.isArray(statusesData.value) 
          ? statusesData.value 
          : (Array.isArray((statusesData.value as any)?.data) ? (statusesData.value as any).data : []);
        console.log('✅ Operational statuses loaded:', stats.length, 'items');
        setOperationalStatuses(stats);
      } else {
        console.error('❌ Failed to load operational statuses:', statusesData.reason);
      }

      // Processing Plant Type data
      if (typesData.status === 'fulfilled') {
        const types = Array.isArray(typesData.value) 
          ? typesData.value 
          : (Array.isArray((typesData.value as any)?.data) ? (typesData.value as any).data : []);
        console.log('✅ Processing plant types loaded:', types.length, 'items');
        setProcessingPlantTypes(types);
      } else {
        console.error('❌ Failed to load processing plant types:', typesData.reason);
      }

      if (plantData) {
        console.log('📝 Setting plant data in form');
        setPlant(plantData);
        // Set selected location if plant has location
        if (plantData.location) {
          setSelectedLocation(plantData.location);
        } else if (plantData.locationId) {
          // Load location details if not nested
          try {
            const loc = await LocationService.getById(plantData.locationId);
            setSelectedLocation(loc);
          } catch (err) {
            console.error('Failed to load location details:', err);
          }
        }
      }
      setError('');
      console.log('✅ All data loaded successfully');
    } catch (err: any) {
      console.error('❌ Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadProductionFields = async () => {
    if (!plantId) return;

    try {
      setProductionFieldsLoading(true);
      setProductionFieldsError('');
      console.log('🔄 Loading production fields for plant:', plantId);
      const fields = await ProductionFieldService.findByProcessingPlant(Number(plantId));
      console.log('✅ Production fields loaded:', fields.length, 'items');
      setProductionFields(Array.isArray(fields) ? fields : []);
    } catch (err: any) {
      console.error('❌ Failed to load production fields:', err);
      setProductionFieldsError(err.message || 'Failed to load production fields');
      setProductionFields([]);
    } finally {
      setProductionFieldsLoading(false);
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
    
    // If location changed, update selected location for display
    if (fieldName === 'locationId') {
      const loc = locations.find(l => l.id === Number(value));
      setSelectedLocation(loc || null);
    }
    
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const productionFieldColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    {
      field: 'name',
      headerName: 'Production Field Name',
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
      headerName: 'Code',
      width: 140,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
      ),
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
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
      headerName: 'Status',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as ProductionFieldDTO;
        if (row.operationalStatus) {
          return <>{row.operationalStatus.nameEn || row.operationalStatus.code}</>;
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/network/core/processing-plants')} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEditMode ? 'Edit Processing Plant' : 'Create Processing Plant'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update processing plant information and manage production fields' : 'Create a new processing plant'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs Card */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab label="General Information" />
          <Tab label="Production Fields" disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information (existing form) */}
          <TabPanel value={activeTab} index={0}>
            {/* Warning alerts for empty dropdowns */}
            {structures.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No structures available. Please create structures first in Administration → Structures.
              </Alert>
            )}
            {locations.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No locations available. Please create locations first in General → Localization → Locations.
              </Alert>
            )}
            {processingPlantTypes.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No processing plant types available. Please create types first or check API connectivity.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Basic Information */}
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
                          fullWidth select label="Structure"
                          value={plant.structureId || ''}
                          onChange={handleChange('structureId')} required
                          error={!!validationErrors.structureId}
                          helperText={validationErrors.structureId || `${structures.length} structure(s) available`}
                        >
                          {structures.length > 0 ? (
                            structures.map((struct) => (
                              <MenuItem key={struct.id} value={struct.id}>
                                {struct.name || struct.designationEn || struct.code}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No structures available</MenuItem>
                          )}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Location Information */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Location Information</Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      {/* Location Reference */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth select label="Location"
                          value={plant.locationId || ''}
                          onChange={handleChange('locationId')} required
                          error={!!validationErrors.locationId}
                          helperText={validationErrors.locationId || `Select the physical location with GPS coordinates (${locations.length} available)`}
                        >
                          {locations.length > 0 ? (
                            locations.map((loc) => (
                              <MenuItem key={loc.id} value={loc.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationIcon fontSize="small" color="action" />
                                  <span>{loc.placeName || loc.name}</span>
                                  {loc.locality && (
                                    <Chip 
                                      label={loc.locality.designationFr || loc.locality.designationEn} 
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
                    </Grid>
                  </Box>
                </Paper>

                {/* Technical Details */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Technical Details</Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
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
                              <MenuItem key={status.id} value={status.id}>
                                {status.nameEn || status.code}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No statuses available</MenuItem>
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
                              <MenuItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No vendors available</MenuItem>
                          )}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth select label="Processing Plant Type"
                          value={plant.processingPlantTypeId || ''}
                          onChange={handleChange('processingPlantTypeId')} required
                          error={!!validationErrors.processingPlantTypeId}
                          helperText={validationErrors.processingPlantTypeId || `${processingPlantTypes.length} type(s) available`}
                        >
                          {processingPlantTypes.length > 0 ? (
                            processingPlantTypes.map((type) => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.nameEn || type.code}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No types available</MenuItem>
                          )}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Important Dates */}
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
              </Stack>
            </form>
          </TabPanel>

          {/* Tab 1: Production Fields */}
          <TabPanel value={activeTab} index={1}>
            {productionFieldsError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProductionFieldsError('')}>
                {productionFieldsError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Production Fields supplied by this plant
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

      {/* Actions */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined" startIcon={<CancelIcon />}
            onClick={() => navigate('/network/core/processing-plants')}
            disabled={saving}
            size="large"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit" variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={saving || structures.length === 0 || locations.length === 0 || processingPlantTypes.length === 0}
            size="large"
            sx={{ minWidth: 150 }}
          >
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcessingPlantEdit;