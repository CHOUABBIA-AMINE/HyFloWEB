/**
 * Structure Edit Page
 * Create/Edit organizational structures with nested job management
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-28-2025
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountTree as StructureIcon,
} from '@mui/icons-material';
import structureService from '../services/StructureService';
import structureTypeService from '../services/StructureTypeService';
import { StructureDTO } from '../dto/StructureDTO';
import { StructureTypeDTO } from '../dto/StructureTypeDTO';
import { JobDTO } from '../dto/JobDTO';
import JobList from '../components/JobList';
import JobEditDialog from '../components/JobEditDialog';

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
      id={`structure-tabpanel-${index}`}
      aria-labelledby={`structure-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const StructureEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState<Partial<StructureDTO>>({
    code: '',
    designationFr: '',
    designationEn: '',
    designationAr: '',
    structureTypeId: 0,
    parentStructureId: undefined,
  });

  // Dropdown data
  const [structureTypes, setStructureTypes] = useState<StructureTypeDTO[]>([]);
  const [parentStructures, setParentStructures] = useState<StructureDTO[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Job management state
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDTO | null>(null);
  const [jobRefreshTrigger, setJobRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDropdownData();
    if (isEditMode) {
      loadStructure();
    }
  }, [id]);

  const loadDropdownData = async () => {
    try {
      const [typesData, structuresData] = await Promise.all([
        structureTypeService.getAll(),
        structureService.getAll()
      ]);
      
      let typesList: StructureTypeDTO[] = Array.isArray(typesData) ? typesData : 
        (typesData as any).data || (typesData as any).content || [];
      let structuresList: StructureDTO[] = Array.isArray(structuresData) ? structuresData : 
        (structuresData as any).data || (structuresData as any).content || [];
      
      setStructureTypes(typesList);
      setParentStructures(structuresList);
    } catch (err: any) {
      console.error('Failed to load dropdown data:', err);
      setError('Failed to load form data');
    }
  };

  const loadStructure = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await structureService.getById(parseInt(id));
      setFormData({
        code: data.code || '',
        designationFr: data.designationFr || '',
        designationEn: data.designationEn || '',
        designationAr: data.designationAr || '',
        structureTypeId: data.structureTypeId || data.structureType?.id || 0,
        parentStructureId: data.parentStructureId || data.parentStructure?.id,
      });
      setError('');
    } catch (err: any) {
      console.error('Failed to load structure:', err);
      setError(err.message || 'Failed to load structure');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = 'Code is required';
    }
    if (!formData.designationFr?.trim()) {
      errors.designationFr = 'French designation is required';
    }
    if (!formData.structureTypeId || formData.structureTypeId === 0) {
      errors.structureTypeId = 'Structure type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const structureData: StructureDTO = {
        ...formData,
        id: isEditMode ? parseInt(id!) : 0,
        code: formData.code!,
        designationFr: formData.designationFr!,
        structureTypeId: formData.structureTypeId!,
      };

      if (isEditMode) {
        await structureService.update(parseInt(id!), structureData);
        setSuccess('Structure updated successfully');
      } else {
        const created = await structureService.create(structureData);
        setSuccess('Structure created successfully');
        // Redirect to edit mode after creation
        setTimeout(() => navigate(`/administration/structures/${created.id}/edit`), 1500);
      }
    } catch (err: any) {
      console.error('Failed to save structure:', err);
      setError(err.message || 'Failed to save structure');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/administration/structures');
  };

  const handleChange = (field: keyof StructureDTO) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Job management handlers
  const handleAddJob = () => {
    setSelectedJob(null);
    setJobDialogOpen(true);
  };

  const handleEditJob = (job: JobDTO) => {
    setSelectedJob(job);
    setJobDialogOpen(true);
  };

  const handleJobDialogClose = () => {
    setJobDialogOpen(false);
    setSelectedJob(null);
  };

  const handleJobSaved = () => {
    setJobRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <StructureIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {isEditMode ? 'Edit Structure' : 'Create Structure'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isEditMode ? 'Update organizational structure information and manage jobs' : 'Add a new organizational structure'}
        </Typography>
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

      {/* Tabs */}
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
          <Tab label="Jobs" disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Code"
                    value={formData.code || ''}
                    onChange={handleChange('code')}
                    error={Boolean(validationErrors.code)}
                    helperText={validationErrors.code}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={Boolean(validationErrors.structureTypeId)}>
                    <InputLabel>Structure Type</InputLabel>
                    <Select
                      value={formData.structureTypeId || ''}
                      onChange={handleChange('structureTypeId')}
                      label="Structure Type"
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>Select type</em>
                      </MenuItem>
                      {structureTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.designationFr || type.designationEn}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.structureTypeId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {validationErrors.structureTypeId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Designations - Single Row */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                    Designations
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="Designation (French)"
                    value={formData.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    error={Boolean(validationErrors.designationFr)}
                    helperText={validationErrors.designationFr}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Designation (English)"
                    value={formData.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Designation (Arabic)"
                    value={formData.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    disabled={loading}
                    dir="rtl"
                  />
                </Grid>

                {/* Hierarchy */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                    Organizational Hierarchy
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Parent Structure</InputLabel>
                    <Select
                      value={formData.parentStructureId || ''}
                      onChange={handleChange('parentStructureId')}
                      label="Parent Structure"
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>None (Root Level)</em>
                      </MenuItem>
                      {parentStructures
                        .filter(s => !isEditMode || s.id !== parseInt(id!))
                        .map((structure) => (
                          <MenuItem key={structure.id} value={structure.id}>
                            {structure.code} - {structure.designationFr || structure.designationEn}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          {/* Tab 1: Jobs */}
          <TabPanel value={activeTab} index={1}>
            {isEditMode && (
              <JobList
                structureId={parseInt(id!)}
                onEdit={handleEditJob}
                onAdd={handleAddJob}
                refreshTrigger={jobRefreshTrigger}
              />
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Actions */}
      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
            sx={{ minWidth: 120, boxShadow: 2 }}
          >
            {loading ? 'Saving...' : t('common.save')}
          </Button>
        </Stack>
      </Paper>

      {/* Job Edit Dialog */}
      {isEditMode && (
        <JobEditDialog
          open={jobDialogOpen}
          onClose={handleJobDialogClose}
          onSave={handleJobSaved}
          structureId={parseInt(id!)}
          job={selectedJob}
        />
      )}
    </Box>
  );
};

export default StructureEdit;
