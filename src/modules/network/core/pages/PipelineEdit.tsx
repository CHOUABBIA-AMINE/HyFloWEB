/**
 * Pipeline Edit/Create Page - Complete with All Form Fields
 * Comprehensive form matching exact backend Pipeline entity fields
 * Pattern: Header+Actions at top, content in tabs
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 02-14-2026 02:35 - Fixed: Restored all form sections with infrastructure display
 * @updated 02-14-2026 02:24 - Show infrastructure facilities in segment table
 * @updated 02-14-2026 01:52 - Fixed: Added safety checks for segment rendering
 * @updated 02-14-2026 01:47 - Fixed: Restored complete General Information form fields
 * @updated 02-14-2026 01:35 - Added Pipeline Segments tab (coordinates moved to segments)
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Stack,
  MenuItem,
  Autocomplete,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Timeline as PipelineIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { PipelineService, PipelineSystemService, TerminalService, PipelineSegmentService } from '../services';
import { VendorService, OperationalStatusService, AlloyService } from '../../common/services';
import { StructureService } from '@/modules/general/organization/services';
import { PipelineDTO } from '../dto/PipelineDTO';
import { PipelineSegmentDTO } from '../dto/PipelineSegmentDTO';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

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

  const currentLanguage = i18n.language || 'en';
  const [activeTab, setActiveTab] = useState(0);

  // Form state matching backend fields
  const [pipeline, setPipeline] = useState<Partial<PipelineDTO>>({
    code: '',
    name: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    nominalDiameter: '',
    length: 0,
    nominalThickness: '',
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
    operationalStatusId: undefined,
    ownerId: undefined,
    managerId: undefined,
    pipelineSystemId: undefined,
    departureTerminalId: undefined,
    arrivalTerminalId: undefined,
    vendorIds: [],
  });

  // Available options
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [pipelineSystems, setPipelineSystems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [alloys, setAlloys] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [segments, setSegments] = useState<PipelineSegmentDTO[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [pipelineId]);

  useEffect(() => {
    if (isEditMode && activeTab === 1) {
      loadSegments();
    }
  }, [isEditMode, activeTab, pipelineId]);

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
      
      let pipelineData: PipelineDTO | null = null;
      if (isEditMode) {
        pipelineData = await PipelineService.getById(Number(pipelineId));
      }
      
      const [
        vendorsData,
        pipelineSystemsData,
        operationalStatusesData,
        alloysData,
        terminalsData,
        structuresData,
      ] = await Promise.allSettled([
        VendorService.getAllNoPagination(),
        PipelineSystemService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        AlloyService.getAllNoPagination(),
        TerminalService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
      ]);

      if (vendorsData.status === 'fulfilled') {
        const vendors = Array.isArray(vendorsData.value) ? vendorsData.value : (Array.isArray((vendorsData.value as any)?.data) ? (vendorsData.value as any).data : []);
        setVendors(vendors);
      }

      if (pipelineSystemsData.status === 'fulfilled') {
        const systems = Array.isArray(pipelineSystemsData.value) ? pipelineSystemsData.value : (Array.isArray((pipelineSystemsData.value as any)?.data) ? (pipelineSystemsData.value as any).data : []);
        setPipelineSystems(systems);
      }

      if (operationalStatusesData.status === 'fulfilled') {
        const statuses = Array.isArray(operationalStatusesData.value) ? operationalStatusesData.value : (Array.isArray((operationalStatusesData.value as any)?.data) ? (operationalStatusesData.value as any).data : []);
        setOperationalStatuses(statuses);
      }

      if (alloysData.status === 'fulfilled') {
        const alloys = Array.isArray(alloysData.value) ? alloysData.value : (Array.isArray((alloysData.value as any)?.data) ? (alloysData.value as any).data : []);
        setAlloys(alloys);
      }

      if (terminalsData.status === 'fulfilled') {
        const terminals = Array.isArray(terminalsData.value) ? terminalsData.value : (Array.isArray((terminalsData.value as any)?.data) ? (terminalsData.value as any).data : []);
        setTerminals(terminals);
      }

      if (structuresData.status === 'fulfilled') {
        const structures = Array.isArray(structuresData.value) ? structuresData.value : (Array.isArray((structuresData.value as any)?.data) ? (structuresData.value as any).data : []);
        setStructures(structures);
      }

      if (pipelineData) {
        setPipeline(pipelineData);
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const loadSegments = async () => {
    if (!pipelineId) return;
    
    try {
      setLoadingSegments(true);
      console.log('Loading segments for pipeline:', pipelineId);
      const segmentsData = await PipelineSegmentService.getByPipelineId(Number(pipelineId));
      console.log('Loaded segments:', segmentsData);
      
      // Debug: Check infrastructure presence
      segmentsData.forEach((seg, idx) => {
        console.log(`Segment ${idx + 1} (${seg.code}):`, {
          hasDepartureFacility: !!seg.departureFacility,
          hasArrivalFacility: !!seg.arrivalFacility,
          departureName: seg.departureFacility?.name || 'N/A',
          arrivalName: seg.arrivalFacility?.name || 'N/A',
          startPoint: seg.startPoint,
          endPoint: seg.endPoint,
        });
      });
      
      const sorted = segmentsData.sort((a, b) => (a.startPoint ?? 0) - (b.startPoint ?? 0));
      setSegments(sorted);
    } catch (err: any) {
      console.error('Failed to load segments:', err);
      setError('Failed to load pipeline segments');
    } finally {
      setLoadingSegments(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!pipeline.name || pipeline.name.trim().length < 2) {
      errors.name = 'Name is required (minimum 2 characters)';
    }

    if (!pipeline.code || pipeline.code.trim().length < 2) {
      errors.code = 'Code is required (minimum 2 characters)';
    }

    if (!pipeline.nominalDiameter || pipeline.nominalDiameter.trim() === '') {
      errors.nominalDiameter = 'Nominal diameter is required (e.g., "48 inches")';
    }

    if (!pipeline.nominalThickness || pipeline.nominalThickness.trim() === '') {
      errors.nominalThickness = 'Nominal thickness is required (e.g., "12.7 mm")';
    }

    if (!pipeline.operationalStatusId) errors.operationalStatusId = 'Operational status is required';
    if (!pipeline.ownerId) errors.ownerId = 'Owner is required';
    if (!pipeline.managerId) errors.managerId = 'Manager is required';
    if (!pipeline.pipelineSystemId) errors.pipelineSystemId = 'Pipeline system is required';
    if (!pipeline.departureTerminalId) errors.departureTerminalId = 'Departure terminal is required';
    if (!pipeline.arrivalTerminalId) errors.arrivalTerminalId = 'Arrival terminal is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PipelineDTO) => (e: any) => {
    const value = e.target.value;
    setPipeline({ ...pipeline, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleVendorsChange = (_: any, newValue: any[]) => {
    const vendorIds = newValue.map(vendor => vendor.id);
    setPipeline({ ...pipeline, vendorIds });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddSegment = () => {
    navigate(`/network/core/pipelines/${pipelineId}/segments/new`);
  };

  const handleEditSegment = (segmentId: number) => {
    navigate(`/network/core/pipelines/${pipelineId}/segments/${segmentId}/edit`);
  };

  const handleDeleteSegment = async (segmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      await PipelineSegmentService.delete(segmentId);
      setSuccess('Segment deleted successfully');
      loadSegments();
    } catch (err: any) {
      console.error('Failed to delete segment:', err);
      setError('Failed to delete segment');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
        nominalDiameter: pipeline.nominalDiameter || '',
        length: pipeline.length !== undefined ? Number(pipeline.length) : 0,
        nominalThickness: pipeline.nominalThickness || '',
        nominalRoughness: pipeline.nominalRoughness !== undefined ? Number(pipeline.nominalRoughness) : 0,
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
        vendorIds: pipeline.vendorIds || [],
      };

      if (isEditMode) {
        await PipelineService.update(Number(pipelineId), { id: Number(pipelineId), ...pipelineData } as PipelineDTO);
        setSuccess('Pipeline updated successfully');
      } else {
        const created = await PipelineService.create(pipelineData as PipelineDTO);
        setSuccess('Pipeline created successfully');
        setTimeout(() => navigate(`/network/core/pipelines/${created.id}/edit`), 1500);
        return;
      }

      setTimeout(() => navigate('/network/core/pipelines'), 1000);
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

  const selectedVendors = useMemo(() => {
    if (!pipeline.vendorIds || !vendors.length) return [];
    return vendors.filter(vendor => pipeline.vendorIds?.includes(vendor.id));
  }, [pipeline.vendorIds, vendors]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PipelineIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {isEditMode ? 'Edit Pipeline' : 'Create Pipeline'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isEditMode ? 'Update pipeline information and manage segments' : 'Create a new pipeline'}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Cancel">
                <IconButton onClick={handleCancel} disabled={saving} size="medium" color="default">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save">
                <IconButton onClick={() => handleSubmit()} disabled={saving} size="medium" color="primary">
                  {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs Card */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="General Information" />
          <Tab label="Pipeline Segments" disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Basic Information */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Basic Information</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Code" value={pipeline.code || ''} onChange={handleChange('code')} required error={!!validationErrors.code} helperText={validationErrors.code || 'Unique pipeline code'} />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <TextField fullWidth label="Name" value={pipeline.name || ''} onChange={handleChange('name')} required error={!!validationErrors.name} helperText={validationErrors.name || 'Pipeline name'} />
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
                        <TextField fullWidth label="Installation Date" type="date" value={pipeline.installationDate || ''} onChange={handleChange('installationDate')} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Commissioning Date" type="date" value={pipeline.commissioningDate || ''} onChange={handleChange('commissioningDate')} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Decommissioning Date" type="date" value={pipeline.decommissioningDate || ''} onChange={handleChange('decommissioningDate')} InputLabelProps={{ shrink: true }} />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Physical Dimensions */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Physical Dimensions</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Nominal Diameter" value={pipeline.nominalDiameter || ''} onChange={handleChange('nominalDiameter')} required error={!!validationErrors.nominalDiameter} helperText={validationErrors.nominalDiameter || 'e.g., "48 inches"'} placeholder="48 inches" />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Length (km)" type="number" value={pipeline.length ?? 0} onChange={handleChange('length')} inputProps={{ step: 0.0001, min: 0 }} helperText="Total pipeline length" />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Nominal Thickness" value={pipeline.nominalThickness || ''} onChange={handleChange('nominalThickness')} required error={!!validationErrors.nominalThickness} helperText={validationErrors.nominalThickness || 'e.g., "12.7 mm"'} placeholder="12.7 mm" />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Nominal Roughness" type="number" value={pipeline.nominalRoughness ?? 0} onChange={handleChange('nominalRoughness')} inputProps={{ step: 0.0001, min: 0 }} helperText="Surface roughness" />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Pressure Specifications */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Pressure Specifications (bar)</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Design Max Pressure" type="number" value={pipeline.designMaxServicePressure ?? 0} onChange={handleChange('designMaxServicePressure')} inputProps={{ step: 0.01, min: 0 }} helperText="Design maximum pressure" />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Operational Max Pressure" type="number" value={pipeline.operationalMaxServicePressure ?? 0} onChange={handleChange('operationalMaxServicePressure')} inputProps={{ step: 0.01, min: 0 }} helperText="Operational max pressure" />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Design Min Pressure" type="number" value={pipeline.designMinServicePressure ?? 0} onChange={handleChange('designMinServicePressure')} inputProps={{ step: 0.01, min: 0 }} helperText="Design minimum pressure" />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Operational Min Pressure" type="number" value={pipeline.operationalMinServicePressure ?? 0} onChange={handleChange('operationalMinServicePressure')} inputProps={{ step: 0.01, min: 0 }} helperText="Operational min pressure" />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Capacity Specifications */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Capacity Specifications (m³/day)</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Design Capacity" type="number" value={pipeline.designCapacity ?? 0} onChange={handleChange('designCapacity')} inputProps={{ step: 0.01, min: 0 }} helperText="Design capacity in m³/day" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Operational Capacity" type="number" value={pipeline.operationalCapacity ?? 0} onChange={handleChange('operationalCapacity')} inputProps={{ step: 0.01, min: 0 }} helperText="Operational capacity in m³/day" />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Materials & Coatings */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Materials & Coatings</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Construction Material" value={pipeline.nominalConstructionMaterialId || ''} onChange={handleChange('nominalConstructionMaterialId')}>
                          <MenuItem value="">None</MenuItem>
                          {sortedAlloys.map((alloy) => (
                            <MenuItem key={alloy.id} value={alloy.id}>{getLocalizedName(alloy, currentLanguage)}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Exterior Coating" value={pipeline.nominalExteriorCoatingId || ''} onChange={handleChange('nominalExteriorCoatingId')}>
                          <MenuItem value="">None</MenuItem>
                          {sortedAlloys.map((alloy) => (
                            <MenuItem key={alloy.id} value={alloy.id}>{getLocalizedName(alloy, currentLanguage)}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Interior Coating" value={pipeline.nominalInteriorCoatingId || ''} onChange={handleChange('nominalInteriorCoatingId')}>
                          <MenuItem value="">None</MenuItem>
                          {sortedAlloys.map((alloy) => (
                            <MenuItem key={alloy.id} value={alloy.id}>{getLocalizedName(alloy, currentLanguage)}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Organizational Details */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Organizational Details</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Operational Status" value={pipeline.operationalStatusId || ''} onChange={handleChange('operationalStatusId')} required error={!!validationErrors.operationalStatusId} helperText={validationErrors.operationalStatusId}>
                          {sortedOperationalStatuses.map((status) => (
                            <MenuItem key={status.id} value={status.id}>{getLocalizedName(status, currentLanguage)}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Owner" value={pipeline.ownerId || ''} onChange={handleChange('ownerId')} required error={!!validationErrors.ownerId} helperText={validationErrors.ownerId}>
                          {structures.map((structure) => (
                            <MenuItem key={structure.id} value={structure.id}>{structure.designationFr} ({structure.code})</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Manager" value={pipeline.managerId || ''} onChange={handleChange('managerId')} required error={!!validationErrors.managerId} helperText={validationErrors.managerId}>
                          {structures.map((structure) => (
                            <MenuItem key={structure.id} value={structure.id}>{structure.designationFr} ({structure.code})</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* System & Terminals */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>System & Terminals</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Pipeline System" value={pipeline.pipelineSystemId || ''} onChange={handleChange('pipelineSystemId')} required error={!!validationErrors.pipelineSystemId} helperText={validationErrors.pipelineSystemId}>
                          {pipelineSystems.map((system) => (
                            <MenuItem key={system.id} value={system.id}>{system.name} ({system.code})</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Departure Terminal" value={pipeline.departureTerminalId || ''} onChange={handleChange('departureTerminalId')} required error={!!validationErrors.departureTerminalId} helperText={validationErrors.departureTerminalId}>
                          {terminals.map((terminal) => (
                            <MenuItem key={terminal.id} value={terminal.id}>{terminal.name} ({terminal.code})</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth select label="Arrival Terminal" value={pipeline.arrivalTerminalId || ''} onChange={handleChange('arrivalTerminalId')} required error={!!validationErrors.arrivalTerminalId} helperText={validationErrors.arrivalTerminalId}>
                          {terminals.map((terminal) => (
                            <MenuItem key={terminal.id} value={terminal.id}>{terminal.name} ({terminal.code})</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Vendors */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Vendors</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          options={vendors}
                          value={selectedVendors}
                          onChange={handleVendorsChange}
                          getOptionLabel={(option) => `${option.name} (${option.code})`}
                          renderInput={(params) => <TextField {...params} label="Vendors" helperText="Select one or more vendors" />}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Stack>
            </form>
          </TabPanel>

          {/* Tab 1: Pipeline Segments */}
          <TabPanel value={activeTab} index={1}>
            {isEditMode && (
              <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>Pipeline Segments</Typography>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddSegment}>Add Segment</Button>
                  </Box>
                  
                  {loadingSegments ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : segments.length === 0 ? (
                    <Alert severity="info">No segments defined for this pipeline. Add segments to define the pipeline path and coordinates.</Alert>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Code</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Departure</strong></TableCell>
                            <TableCell><strong>Arrival</strong></TableCell>
                            <TableCell align="right"><strong>Start (km)</strong></TableCell>
                            <TableCell align="right"><strong>End (km)</strong></TableCell>
                            <TableCell align="right"><strong>Length (km)</strong></TableCell>
                            <TableCell align="right"><strong>Coordinates</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {segments.map((segment) => (
                            <TableRow key={segment.id} hover>
                              <TableCell>{segment.code || 'N/A'}</TableCell>
                              <TableCell>{segment.name || 'N/A'}</TableCell>
                              <TableCell>
                                {segment.departureFacility?.name || (
                                  <Chip label="Not set" size="small" color="warning" icon={<WarningIcon />} />
                                )}
                              </TableCell>
                              <TableCell>
                                {segment.arrivalFacility?.name || (
                                  <Chip label="Not set" size="small" color="warning" icon={<WarningIcon />} />
                                )}
                              </TableCell>
                              <TableCell align="right">{(segment.startPoint ?? 0).toFixed(2)}</TableCell>
                              <TableCell align="right">{(segment.endPoint ?? 0).toFixed(2)}</TableCell>
                              <TableCell align="right">{(segment.length ?? 0).toFixed(2)}</TableCell>
                              <TableCell align="right">{segment.coordinateIds?.length ?? 0} points</TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Tooltip title="Edit Segment">
                                    <IconButton size="small" color="primary" onClick={() => handleEditSegment(segment.id!)}><EditIcon fontSize="small" /></IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Segment">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteSegment(segment.id!)}><DeleteIcon fontSize="small" /></IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Paper>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PipelineEdit;