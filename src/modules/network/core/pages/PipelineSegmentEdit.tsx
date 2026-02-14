/**
 * Pipeline Segment Edit/Create Page
 * Manage pipeline segments and their geographic coordinates
 * 
 * Architecture: PipelineSegment contains coordinateIds for path definition
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
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
import { PipelineSegmentService } from '../services';
import { AlloyService } from '../../common/services';
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
    description: '',
    diameter: '',                     // String with unit
    length: 0,                        // Calculated from endPoint - startPoint
    thickness: '',                    // String with unit
    constructionMaterialId: undefined,
    exteriorCoatingId: undefined,
    interiorCoatingId: undefined,
    startPoint: 0,                    // Position in pipeline (km)
    endPoint: 0,                      // Position in pipeline (km)
    serviceDate: undefined,
    pipelineId: Number(pipelineId),
    coordinateIds: [],
  });

  // Available options
  const [alloys, setAlloys] = useState<any[]>([]);
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
      ] = await Promise.allSettled([
        AlloyService.getAllNoPagination(),
        CoordinateService.getAllNoPagination(),
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

      // Set segment data if editing
      if (segmentData) {
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

    if (!segment.code || segment.code.trim().length < 2) {
      errors.code = 'Code is required (minimum 2 characters)';
    }

    if (!segment.name || segment.name.trim().length < 2) {
      errors.name = 'Name is required (minimum 2 characters)';
    }

    if (!segment.diameter || segment.diameter.trim() === '') {
      errors.diameter = 'Diameter is required (e.g., "48 inches")';
    }

    if (!segment.thickness || segment.thickness.trim() === '') {
      errors.thickness = 'Thickness is required (e.g., "12.7 mm")';
    }

    if (segment.startPoint === undefined || segment.startPoint < 0) {
      errors.startPoint = 'Start point is required (must be >= 0)';
    }

    if (segment.endPoint === undefined || segment.endPoint <= (segment.startPoint || 0)) {
      errors.endPoint = 'End point must be greater than start point';
    }

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
        description: segment.description,
        diameter: segment.diameter || '',
        length: segment.length !== undefined ? Number(segment.length) : 0,
        thickness: segment.thickness || '',
        constructionMaterialId: segment.constructionMaterialId ? Number(segment.constructionMaterialId) : undefined,
        exteriorCoatingId: segment.exteriorCoatingId ? Number(segment.exteriorCoatingId) : undefined,
        interiorCoatingId: segment.interiorCoatingId ? Number(segment.interiorCoatingId) : undefined,
        startPoint: Number(segment.startPoint),
        endPoint: Number(segment.endPoint),
        serviceDate: segment.serviceDate,
        pipelineId: Number(pipelineId),
        coordinateIds: segment.coordinateIds || [],
      };

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
      setError(err.response?.data?.message || err.message || 'Failed to save segment');
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
                          helperText={validationErrors.code || 'Unique segment code'}
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
                          helperText={validationErrors.name || 'Segment name'}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={segment.description || ''}
                          onChange={handleChange('description')}
                          multiline
                          rows={2}
                          helperText="Optional description of the segment"
                        />
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Diameter"
                          type="text"
                          value={segment.diameter || ''}
                          onChange={handleChange('diameter')}
                          required
                          error={!!validationErrors.diameter}
                          helperText={validationErrors.diameter || 'e.g., "48 inches", "1200 mm"'}
                          placeholder="48 inches"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Wall Thickness"
                          type="text"
                          value={segment.thickness || ''}
                          onChange={handleChange('thickness')}
                          required
                          error={!!validationErrors.thickness}
                          helperText={validationErrors.thickness || 'e.g., "12.7 mm", "0.5 inch"'}
                          placeholder="12.7 mm"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* Materials */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Materials
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
                          label="Exterior Coating"
                          value={segment.exteriorCoatingId || ''}
                          onChange={handleChange('exteriorCoatingId')}
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
                          label="Interior Coating"
                          value={segment.interiorCoatingId || ''}
                          onChange={handleChange('interiorCoatingId')}
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

                {/* Service Date */}
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Service Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Service Date"
                          type="date"
                          value={segment.serviceDate || ''}
                          onChange={handleChange('serviceDate')}
                          InputLabelProps={{ shrink: true }}
                          helperText="Date when segment was put into service"
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