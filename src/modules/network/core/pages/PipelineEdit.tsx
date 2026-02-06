/**
 * Pipeline Edit/Create Page - Professional Version with Tabs
 * Comprehensive form matching exact backend Pipeline entity fields
 * Pattern: Header+Actions at top, content in tabs (like Structure/Job Edit)
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 02-06-2026 20:07 - Integrated coordinate management (CoordinateList + CoordinateEditDialog)
 * @updated 02-06-2026 19:42 - Restructured: Header+Actions at top, tabs for content sections
 * @updated 02-06-2026 18:52 - CRITICAL: Backend removed locations, changed to coordinateIds only
 * @updated 02-06-2026 18:38 - Aligned with backend Model (nominalDiameter/Thickness as string text fields, 4 decimals for Double)
 * @updated 02-02-2026 - Added missing required fields: ownerId, managerId, locationIds
 * @updated 02-02-2026 - Fixed LocationService import path (localization not geography)
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-15-2026 - Updated to use Terminal references (departureTerminalId/arrivalTerminalId)
 * @updated 01-15-2026 - Fixed type compatibility: convert numbers to strings for DTO fields
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
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Timeline as PipelineIcon,
} from '@mui/icons-material';
import { PipelineService, PipelineSystemService, TerminalService } from '../services';
import { VendorService, OperationalStatusService, AlloyService } from '../../common/services';
import { StructureService } from '@/modules/general/organization/services';
import { CoordinateService } from '@/modules/general/localization/services';
import { PipelineDTO } from '../dto/PipelineDTO';
import { CoordinateDTO } from '@/modules/general/localization/dto/CoordinateDTO';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';
import CoordinateList from '../components/CoordinateList';
import CoordinateEditDialog from '../components/CoordinateEditDialog';

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
      id={`pipeline-tabpanel-${index}`}
      aria-labelledby={`pipeline-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PipelineEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const isEditMode = !!pipelineId;

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Tabs state
  const [activeTab, setActiveTab] = useState(0);

  // Form state matching backend fields
  const [pipeline, setPipeline] = useState<Partial<PipelineDTO>>({
    code: '',
    name: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    nominalDiameter: '',              // String with unit (e.g., "48 inches")
    length: 0,
    nominalThickness: '',             // String with unit (e.g., "12.7 mm")
    nominalRoughness: 0,              // Number (Double)
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
    pipelineSystemId: undefined,
    departureTerminalId: undefined,
    arrivalTerminalId: undefined,
    coordinateIds: [],                // NEW: coordinateIds instead of locationIds
    vendorIds: [],                    // NEW: vendorIds Set instead of single vendorId
  });

  // Available options
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [pipelineSystems, setPipelineSystems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [alloys, setAlloys] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [coordinates, setCoordinates] = useState<CoordinateDTO[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Coordinate management state (Pattern: Structure→Job)
  const [coordinateDialogOpen, setCoordinateDialogOpen] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<CoordinateDTO | null>(null);
  const [coordinateRefreshTrigger, setCoordinateRefreshTrigger] = useState(0);

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
        coordinatesData,
      ] = await Promise.allSettled([
        VendorService.getAllNoPagination(),
        PipelineSystemService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        AlloyService.getAllNoPagination(),
        TerminalService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
        CoordinateService.getAllNoPagination(),
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

      // Handle coordinates
      if (coordinatesData.status === 'fulfilled') {
        const coordinates = Array.isArray(coordinatesData.value) 
          ? coordinatesData.value 
          : (Array.isArray((coordinatesData.value as any)?.data) ? (coordinatesData.value as any).data 
            : Array.isArray((coordinatesData.value as any)?.content) ? (coordinatesData.value as any).content : []);
        setCoordinates(coordinates);
      } else {
        console.error('Failed to load coordinates:', coordinatesData.reason);
        setCoordinates([]);
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

    // Validate nominalDiameter (string)
    if (!pipeline.nominalDiameter || pipeline.nominalDiameter.trim() === '') {
      errors.nominalDiameter = t('common.validation.required', { field: t('pipeline.fields.nominalDiameter') });
    }

    // Validate nominalThickness (string)
    if (!pipeline.nominalThickness || pipeline.nominalThickness.trim() === '') {
      errors.nominalThickness = t('common.validation.required', { field: t('pipeline.fields.nominalThickness') });
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

    // Vendors are now optional (ManyToMany relationship)
    // No validation needed for vendorIds

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

  const handleVendorsChange = (_: any, newValue: any[]) => {
    const vendorIds = newValue.map(vendor => vendor.id);
    setPipeline({ ...pipeline, vendorIds });
  };

  const handleCoordinatesChange = (_: any, newValue: any[]) => {
    const coordinateIds = newValue.map(coord => coord.id);
    setPipeline({ ...pipeline, coordinateIds });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Coordinate management handlers (Pattern: Structure→Job)
  const handleAddCoordinate = () => {
    setSelectedCoordinate(null);
    setCoordinateDialogOpen(true);
  };

  const handleEditCoordinate = (coordinate: CoordinateDTO) => {
    setSelectedCoordinate(coordinate);
    setCoordinateDialogOpen(true);
  };

  const handleCoordinateDialogClose = () => {
    setCoordinateDialogOpen(false);
    setSelectedCoordinate(null);
  };

  const handleCoordinateSaved = () => {
    setCoordinateRefreshTrigger((prev) => prev + 1);
    // Reload coordinates to update the list
    loadCoordinatesForPipeline();
  };

  const loadCoordinatesForPipeline = async () => {
    if (!isEditMode || !pipelineId) return;
    
    try {
      const coords = await CoordinateService.getByInfrastructure(Number(pipelineId));
      const coordIds = coords.map(c => c.id).filter((id): id is number => id !== undefined);
      setPipeline(prev => ({ ...prev, coordinateIds: coordIds }));
    } catch (err) {
      console.error('Failed to load pipeline coordinates:', err);
    }
  };

  // Get max sequence number for auto-increment
  const maxSequence = useMemo(() => {
    if (!isEditMode || !pipelineId) return 0;
    const pipelineCoords = coordinates.filter(c => c.infrastructureId === Number(pipelineId));
    return pipelineCoords.length > 0 
      ? Math.max(...pipelineCoords.map(c => c.sequence))
      : 0;
  }, [coordinates, pipelineId, isEditMode, coordinateRefreshTrigger]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields');
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
        nominalDiameter: pipeline.nominalDiameter || '',          // String
        length: pipeline.length !== undefined ? Number(pipeline.length) : 0,
        nominalThickness: pipeline.nominalThickness || '',        // String
        nominalRoughness: pipeline.nominalRoughness !== undefined ? Number(pipeline.nominalRoughness) : 0,  // Number
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
        pipelineSystemId: Number(pipeline.pipelineSystemId),
        departureTerminalId: Number(pipeline.departureTerminalId),
        arrivalTerminalId: Number(pipeline.arrivalTerminalId),
        coordinateIds: pipeline.coordinateIds || [],
        vendorIds: pipeline.vendorIds || [],
      };

      if (isEditMode) {
        await PipelineService.update(Number(pipelineId), { id: Number(pipelineId), ...pipelineData } as PipelineDTO);
        setSuccess(t('common.messages.updateSuccess'));
      } else {
        const created = await PipelineService.create(pipelineData as PipelineDTO);
        setSuccess(t('common.messages.createSuccess'));
        // Redirect to edit mode after creation to allow coordinate management
        setTimeout(() => navigate(`/network/core/pipelines/${created.id}/edit`), 1500);
        return;
      }

      setTimeout(() => navigate('/network/core/pipelines'), 1000);
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

  // Get selected vendors for Autocomplete
  const selectedVendors = useMemo(() => {
    if (!pipeline.vendorIds || !vendors.length) return [];
    return vendors.filter(vendor => pipeline.vendorIds?.includes(vendor.id));
  }, [pipeline.vendorIds, vendors]);

  // Get selected coordinates for Autocomplete
  const selectedCoordinates = useMemo(() => {
    if (!pipeline.coordinateIds || !coordinates.length) return [];
    return coordinates.filter(coord => pipeline.coordinateIds?.includes(coord.id));
  }, [pipeline.coordinateIds, coordinates]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Title, Subtitle, and Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PipelineIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
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
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={saving}
            sx={{ minWidth: 120 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
            sx={{ minWidth: 120, boxShadow: 2 }}
          >
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

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
          <Tab label={t('pipeline.tabs.generalInformation')} />
          <Tab label={t('pipeline.tabs.pipelinePath')} disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information */}
          <TabPanel value={activeTab} index={0}>
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
                          type="text"
                          value={pipeline.nominalDiameter || ''}
                          onChange={handleChange('nominalDiameter')}
                          required
                          error={!!validationErrors.nominalDiameter}
                          helperText={validationErrors.nominalDiameter || 'e.g., "48 inches", "1200 mm"'}
                          placeholder="48 inches"
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.nominalThickness')}
                          type="text"
                          value={pipeline.nominalThickness || ''}
                          onChange={handleChange('nominalThickness')}
                          required
                          error={!!validationErrors.nominalThickness}
                          helperText={validationErrors.nominalThickness || 'e.g., "12.7 mm", "0.5 inch"'}
                          placeholder="12.7 mm"
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.length')}
                          type="number"
                          value={pipeline.length || 0}
                          onChange={handleChange('length')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Length in kilometers (4 decimals)"
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.nominalRoughness')}
                          type="number"
                          value={pipeline.nominalRoughness || 0}
                          onChange={handleChange('nominalRoughness')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Roughness in mm (4 decimals)"
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
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Pressure in bar (4 decimals)"
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.operationalMaxServicePressure')}
                          type="number"
                          value={pipeline.operationalMaxServicePressure ?? 0}
                          onChange={handleChange('operationalMaxServicePressure')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Pressure in bar (4 decimals)"
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.designMinServicePressure')}
                          type="number"
                          value={pipeline.designMinServicePressure ?? 0}
                          onChange={handleChange('designMinServicePressure')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Pressure in bar (4 decimals)"
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.operationalMinServicePressure')}
                          type="number"
                          value={pipeline.operationalMinServicePressure ?? 0}
                          onChange={handleChange('operationalMinServicePressure')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Pressure in bar (4 decimals)"
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
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Capacity in m³/day (4 decimals)"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={t('pipeline.fields.operationalCapacity')}
                          type="number"
                          value={pipeline.operationalCapacity ?? 0}
                          onChange={handleChange('operationalCapacity')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          helperText="Capacity in m³/day (4 decimals)"
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
                        <Autocomplete
                          multiple
                          options={vendors}
                          value={selectedVendors}
                          onChange={handleVendorsChange}
                          getOptionLabel={(option) => option.name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t('common.fields.vendors')}
                              helperText="Select multiple vendors (optional)"
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
              </Stack>
            </form>
          </TabPanel>

          {/* Tab 1: Pipeline Path (Coordinates) - Pattern: Structure→Job */}
          <TabPanel value={activeTab} index={1}>
            {isEditMode && (
              <CoordinateList
                pipelineId={Number(pipelineId)}
                coordinateIds={pipeline.coordinateIds || []}
                onEdit={handleEditCoordinate}
                onAdd={handleAddCoordinate}
                refreshTrigger={coordinateRefreshTrigger}
              />
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Coordinate Edit Dialog - Pattern: Structure→Job */}
      {isEditMode && (
        <CoordinateEditDialog
          open={coordinateDialogOpen}
          onClose={handleCoordinateDialogClose}
          onSave={handleCoordinateSaved}
          pipelineId={Number(pipelineId)}
          coordinate={selectedCoordinate}
          maxSequence={maxSequence}
        />
      )}
    </Box>
  );
};

export default PipelineEdit;