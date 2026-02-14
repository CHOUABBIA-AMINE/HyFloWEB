/**
 * Pipeline Segment Edit/Create Page
 * Manage pipeline segments and their geographic coordinates
 * 
 * Architecture: PipelineSegment contains coordinateIds for path definition
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026 12:30 - Aligned with backend: structureId→ownerId, facilities now REQUIRED
 * @updated 02-14-2026 12:23 - Made coating fields optional per backend update
 * @updated 02-14-2026 12:16 - Aligned validation with backend @PositiveOrZero constraint
 * @updated 02-14-2026 12:03 - Clarified Structure field as organizational owner/manager
 * @updated 02-14-2026 11:58 - Added detailed error logging for debugging
 * @updated 02-14-2026 11:50 - Added Departure and Arrival Facility fields
 * @updated 02-14-2026 01:41 - Fixed: Aligned with actual PipelineSegmentDTO structure
 * @updated 02-14-2026 01:38 - Initial creation with coordinate management
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
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  LinearScale as SegmentIcon,
} from '@mui/icons-material';
import { PipelineSegmentService, FacilityService } from '../services';
import { AlloyService, OperationalStatusService } from '../../common/services';
import { StructureService } from '@/modules/general/organization/services';
import { CoordinateService } from '@/modules/general/localization/services';
import { PipelineSegmentDTO } from '../dto/PipelineSegmentDTO';
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
      id={`segment-tabpanel-${index}`}
      aria-labelledby={`segment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PipelineSegmentEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pipelineId, segmentId } = useParams<{ pipelineId: string; segmentId: string }>();
  const isEditMode = segmentId !== 'new';

  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Tabs state
  const [activeTab, setActiveTab] = useState(0);

  // Form state matching backend PipelineSegment fields
  const [segment, setSegment] = useState<Partial<PipelineSegmentDTO>>({
    code: '',
    name: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    diameter: 0,                      // Number (Double) - @PositiveOrZero
    length: 0,                        // Calculated from endPoint - startPoint
    thickness: 0,                     // Number (Double) - @PositiveOrZero
    roughness: 0,                     // Number (Double) - @PositiveOrZero
    startPoint: 0,                    // Position in pipeline (km) - @PositiveOrZero
    endPoint: 0,                      // Position in pipeline (km) - @PositiveOrZero
    departureFacilityId: undefined,   // REQUIRED (backend @NotNull)
    arrivalFacilityId: undefined,     // REQUIRED (backend @NotNull)
    operationalStatusId: undefined,   // REQUIRED
    ownerId: undefined,               // OPTIONAL (backend field: ownerId, not structureId)
    constructionMaterialId: undefined,// REQUIRED
    exteriorCoatingId: undefined,     // OPTIONAL
    interiorCoatingId: undefined,     // OPTIONAL
    pipelineId: Number(pipelineId),
    coordinateIds: [],
  });

  // Available options
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [alloys, setAlloys] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [coordinates, setCoordinates] = useState<CoordinateDTO[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Coordinate management state
  const [coordinateDialogOpen, setCoordinateDialogOpen] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<CoordinateDTO | null>(null);
  const [coordinateRefreshTrigger, setCoordinateRefreshTrigger] = useState(0);

  useEffect(() => {
    loadData();
  }, [segmentId]);

  // Auto-calculate length when startPoint or endPoint changes
  useEffect(() => {
    if (segment.startPoint !== undefined && segment.endPoint !== undefined) {
      const calculatedLength = segment.endPoint - segment.startPoint;
      if (calculatedLength !== segment.length) {
        setSegment(prev => ({ ...prev, length: calculatedLength }));
      }
    }
  }, [segment.startPoint, segment.endPoint]);

  // Sort alloys by localized name
  const sortedAlloys = useMemo(
    () => sortByLocalizedName(alloys, currentLanguage),
    [alloys, currentLanguage]
  );

  const sortedOperationalStatuses = useMemo(
    () => sortByLocalizedName(operationalStatuses, currentLanguage),
    [operationalStatuses, currentLanguage]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load segment if editing
      let segmentData: PipelineSegmentDTO | null = null;
      if (isEditMode) {
        segmentData = await PipelineSegmentService.getById(Number(segmentId));
      }
      
      // Load reference data
      const [
        alloysData,
        coordinatesData,
        operationalStatusesData,
        structuresData,
        facilitiesData,
      ] = await Promise.allSettled([
        AlloyService.getAllNoPagination(),
        CoordinateService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
        FacilityService.getAllNoPagination(),
      ]);

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

      // Handle facilities
      if (facilitiesData.status === 'fulfilled') {
        const facilities = Array.isArray(facilitiesData.value) 
          ? facilitiesData.value 
          : (Array.isArray((facilitiesData.value as any)?.data) ? (facilitiesData.value as any).data 
            : Array.isArray((facilitiesData.value as any)?.content) ? (facilitiesData.value as any).content : []);
        console.log('Loaded facilities:', facilities);
        setFacilities(facilities);
      } else {
        console.warn('Facilities service not available:', facilitiesData.reason);
        setFacilities([]);
      }

      // Set segment data if editing
      if (segmentData) {
        console.log('Loaded segment data:', segmentData);
        setSegment(segmentData);
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load segment data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Code validation: 2-20 characters
    if (!segment.code || segment.code.trim().length < 2) {
      errors.code = 'Code is required (minimum 2 characters)';
    } else if (segment.code.length > 20) {
      errors.code = 'Code must not exceed 20 characters';
    }

    // Name validation: 3-100 characters
    if (!segment.name || segment.name.trim().length < 3) {
      errors.name = 'Name is required (minimum 3 characters)';
    } else if (segment.name.length > 100) {
      errors.name = 'Name must not exceed 100 characters';
    }

    // Physical dimensions: @PositiveOrZero (>= 0)
    if (segment.diameter === undefined || segment.diameter === null) {
      errors.diameter = 'Diameter is required';
    } else if (segment.diameter < 0) {
      errors.diameter = 'Diameter must be zero or positive';
    }

    if (segment.thickness === undefined || segment.thickness === null) {
      errors.thickness = 'Thickness is required';
    } else if (segment.thickness < 0) {
      errors.thickness = 'Thickness must be zero or positive';
    }

    if (segment.roughness === undefined || segment.roughness === null) {
      errors.roughness = 'Roughness is required';
    } else if (segment.roughness < 0) {
      errors.roughness = 'Roughness must be zero or positive';
    }

    // Position validation: @PositiveOrZero (>= 0)
    if (segment.startPoint === undefined || segment.startPoint === null) {
      errors.startPoint = 'Start point is required';
    } else if (segment.startPoint < 0) {
      errors.startPoint = 'Start point must be zero or positive';
    }

    if (segment.endPoint === undefined || segment.endPoint === null) {
      errors.endPoint = 'End point is required';
    } else if (segment.endPoint < 0) {
      errors.endPoint = 'End point must be zero or positive';
    } else if (segment.endPoint <= (segment.startPoint || 0)) {
      errors.endPoint = 'End point must be greater than start point';
    }

    // REQUIRED relationships (backend @NotNull)
    if (!segment.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }

    if (!segment.constructionMaterialId) {
      errors.constructionMaterialId = 'Construction material is required';
    }

    // REQUIRED facilities (backend @NotNull)
    if (!segment.departureFacilityId) {
      errors.departureFacilityId = 'Departure facility is required';
    }

    if (!segment.arrivalFacilityId) {
      errors.arrivalFacilityId = 'Arrival facility is required';
    }

    // ownerId is OPTIONAL - no validation
    // Coatings are OPTIONAL - no validation

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PipelineSegmentDTO) => (e: any) => {
    const value = e.target.value;
    setSegment({ ...segment, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Coordinate management handlers
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
    loadCoordinatesForSegment();
  };

  const loadCoordinatesForSegment = async () => {
    if (!isEditMode || !segmentId) return;
    
    try {
      // Load coordinates associated with this segment
      const coords = await CoordinateService.getByInfrastructure(Number(segmentId));
      const coordIds = coords.map(c => c.id).filter((id): id is number => id !== undefined);
      setSegment(prev => ({ ...prev, coordinateIds: coordIds }));
    } catch (err) {
      console.error('Failed to load segment coordinates:', err);
    }
  };

  // Get max sequence number for auto-increment
  const maxSequence = useMemo(() => {
    if (!isEditMode || !segmentId) return 0;
    const segmentCoords = coordinates.filter(c => c.infrastructureId === Number(segmentId));
    return segmentCoords.length > 0 
      ? Math.max(...segmentCoords.map(c => c.sequence))
      : 0;
  }, [coordinates, segmentId, isEditMode, coordinateRefreshTrigger]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const segmentData: Partial<PipelineSegmentDTO> = {
        code: segment.code!,
        name: segment.name!,
        installationDate: segment.installationDate,
        commissioningDate: segment.commissioningDate,
        decommissioningDate: segment.decommissioningDate,
        diameter: Number(segment.diameter),
        length: Number(segment.length),
        thickness: Number(segment.thickness),
        roughness: Number(segment.roughness),
        startPoint: Number(segment.startPoint),
        endPoint: Number(segment.endPoint),
        departureFacilityId: Number(segment.departureFacilityId),  // REQUIRED
        arrivalFacilityId: Number(segment.arrivalFacilityId),      // REQUIRED
        operationalStatusId: Number(segment.operationalStatusId),
        ownerId: segment.ownerId ? Number(segment.ownerId) : undefined,  // OPTIONAL
        constructionMaterialId: Number(segment.constructionMaterialId),
        exteriorCoatingId: segment.exteriorCoatingId ? Number(segment.exteriorCoatingId) : undefined, // OPTIONAL
        interiorCoatingId: segment.interiorCoatingId ? Number(segment.interiorCoatingId) : undefined, // OPTIONAL
        pipelineId: Number(pipelineId),
        coordinateIds: segment.coordinateIds || [],
      };

      console.log('Submitting segment data:', segmentData);

      if (isEditMode) {
        await PipelineSegmentService.update(Number(segmentId), { id: Number(segmentId), ...segmentData } as PipelineSegmentDTO);
        setSuccess('Segment updated successfully');
        setTimeout(() => navigate(`/network/core/pipelines/${pipelineId}/edit`), 1000);
      } else {
        const created = await PipelineSegmentService.create(segmentData as PipelineSegmentDTO);
        setSuccess('Segment created successfully');
        // Redirect to edit mode to allow coordinate management
        setTimeout(() => navigate(`/network/core/pipelines/${pipelineId}/segments/${created.id}/edit`), 1500);
        return;
      }
    } catch (err: any) {
      console.error('Failed to save segment:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract detailed error message from backend
      let errorMessage = 'Failed to save segment';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/network/core/pipelines/${pipelineId}/edit`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SegmentIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {isEditMode ? 'Edit Pipeline Segment' : 'Create Pipeline Segment'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isEditMode 
                    ? 'Update segment details and manage coordinates'
                    : 'Create a new segment for the pipeline'
                  }
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Cancel">
                <IconButton 
                  onClick={handleCancel} 
                  disabled={saving}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save">
                <IconButton 
                  onClick={() => handleSubmit()} 
                  disabled={saving}
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
          <Tab label="Segment Details" />
          <Tab label="Coordinates" disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: Segment Details */}
          <TabPanel value={activeTab} index={0}>
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
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Code"
                          value={segment.code || ''}
                          onChange={handleChange('code')}
                          required
                          error={!!validationErrors.code}
                          helperText={validationErrors.code || 'Unique segment code (2-20 characters)'}
                        />
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <TextField
                          fullWidth
                          label="Name"
                          value={segment.name || ''}
                          onChange={handleChange('name')}
                          required
                          error={!!validationErrors.name}
                          helperText={validationErrors.name || 'Segment name (3-100 characters)'}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Connected Infrastructure - NOW REQUIRED */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Connected Infrastructure
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Departure Facility"
                          value={segment.departureFacilityId || ''}
                          onChange={handleChange('departureFacilityId')}
                          required
                          error={!!validationErrors.departureFacilityId}
                          helperText={validationErrors.departureFacilityId || 'Starting infrastructure (REQUIRED)'}
                        >
                          {facilities.length === 0 ? (
                            <MenuItem value="" disabled>No facilities available</MenuItem>
                          ) : (
                            facilities.map((facility) => (
                              <MenuItem key={facility.id} value={facility.id}>
                                {facility.name} ({facility.code})
                              </MenuItem>
                            ))
                          )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Arrival Facility"
                          value={segment.arrivalFacilityId || ''}
                          onChange={handleChange('arrivalFacilityId')}
                          required
                          error={!!validationErrors.arrivalFacilityId}
                          helperText={validationErrors.arrivalFacilityId || 'Ending infrastructure (REQUIRED)'}
                        >
                          {facilities.length === 0 ? (
                            <MenuItem value="" disabled>No facilities available</MenuItem>
                          ) : (
                            facilities.map((facility) => (
                              <MenuItem key={facility.id} value={facility.id}>
                                {facility.name} ({facility.code})
                              </MenuItem>
                            ))
                          )}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Position in Pipeline */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Position in Pipeline
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Start Point (km)"
                          type="number"
                          value={segment.startPoint ?? 0}
                          onChange={handleChange('startPoint')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          error={!!validationErrors.startPoint}
                          helperText={validationErrors.startPoint || 'Starting kilometer from pipeline origin'}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="End Point (km)"
                          type="number"
                          value={segment.endPoint ?? 0}
                          onChange={handleChange('endPoint')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          error={!!validationErrors.endPoint}
                          helperText={validationErrors.endPoint || 'Ending kilometer from pipeline origin'}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Segment Length (km)"
                          type="number"
                          value={segment.length?.toFixed(4) || 0}
                          disabled
                          helperText="Auto-calculated from end - start"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Physical Specifications */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Physical Specifications
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Diameter (mm)"
                          type="number"
                          value={segment.diameter ?? 0}
                          onChange={handleChange('diameter')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          error={!!validationErrors.diameter}
                          helperText={validationErrors.diameter || 'Segment diameter in millimeters'}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Wall Thickness (mm)"
                          type="number"
                          value={segment.thickness ?? 0}
                          onChange={handleChange('thickness')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          error={!!validationErrors.thickness}
                          helperText={validationErrors.thickness || 'Wall thickness in millimeters'}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Roughness (mm)"
                          type="number"
                          value={segment.roughness ?? 0}
                          onChange={handleChange('roughness')}
                          inputProps={{ step: 0.0001, min: 0 }}
                          required
                          error={!!validationErrors.roughness}
                          helperText={validationErrors.roughness || 'Surface roughness in millimeters'}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Status & Owner */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Status & Owner
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Operational Status"
                          value={segment.operationalStatusId || ''}
                          onChange={handleChange('operationalStatusId')}
                          required
                          error={!!validationErrors.operationalStatusId}
                          helperText={validationErrors.operationalStatusId}
                        >
                          {sortedOperationalStatuses.map((status) => (
                            <MenuItem key={status.id} value={status.id}>
                              {getLocalizedName(status, currentLanguage)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Owner (Optional)"
                          value={segment.ownerId || ''}
                          onChange={handleChange('ownerId')}
                          error={!!validationErrors.ownerId}
                          helperText={validationErrors.ownerId || 'Organizational owner (optional)'}
                        >
                          <MenuItem value="">None</MenuItem>
                          {structures.map((structure) => (
                            <MenuItem key={structure.id} value={structure.id}>
                              {structure.designationFr} ({structure.code})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Materials & Coatings */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Materials & Coatings
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Construction Material"
                          value={segment.constructionMaterialId || ''}
                          onChange={handleChange('constructionMaterialId')}
                          required
                          error={!!validationErrors.constructionMaterialId}
                          helperText={validationErrors.constructionMaterialId}
                        >
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
                          label="Exterior Coating (Optional)"
                          value={segment.exteriorCoatingId || ''}
                          onChange={handleChange('exteriorCoatingId')}
                          error={!!validationErrors.exteriorCoatingId}
                          helperText="External protective coating (optional for bare metal)"
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
                          label="Interior Coating (Optional)"
                          value={segment.interiorCoatingId || ''}
                          onChange={handleChange('interiorCoatingId')}
                          error={!!validationErrors.interiorCoatingId}
                          helperText="Internal protective coating (optional for bare metal)"
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
                          value={segment.installationDate || ''}
                          onChange={handleChange('installationDate')}
                          InputLabelProps={{ shrink: true }}
                          helperText="Date when segment was installed"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Commissioning Date"
                          type="date"
                          value={segment.commissioningDate || ''}
                          onChange={handleChange('commissioningDate')}
                          InputLabelProps={{ shrink: true }}
                          helperText="Date when segment was commissioned"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Decommissioning Date"
                          type="date"
                          value={segment.decommissioningDate || ''}
                          onChange={handleChange('decommissioningDate')}
                          InputLabelProps={{ shrink: true }}
                          helperText="Date when segment was decommissioned"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Stack>
            </form>
          </TabPanel>

          {/* Tab 1: Coordinates */}
          <TabPanel value={activeTab} index={1}>
            {isEditMode && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Define the geographic path of this segment by adding coordinate points in sequence.
                  Minimum 2 coordinates required for a valid segment path.
                </Alert>
                <CoordinateList
                  pipelineId={Number(segmentId)}
                  coordinateIds={segment.coordinateIds || []}
                  onEdit={handleEditCoordinate}
                  onAdd={handleAddCoordinate}
                  refreshTrigger={coordinateRefreshTrigger}
                />
              </Box>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Coordinate Edit Dialog */}
      {isEditMode && (
        <CoordinateEditDialog
          open={coordinateDialogOpen}
          onClose={handleCoordinateDialogClose}
          onSave={handleCoordinateSaved}
          pipelineId={Number(segmentId)}
          coordinate={selectedCoordinate}
          maxSequence={maxSequence}
        />
      )}
    </Box>
  );
};

export default PipelineSegmentEdit;