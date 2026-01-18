/**
 * Structure Edit Page
 * Create/Edit organizational structures with nested job management
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 01-03-2026 - Fixed imports to use relative paths
 * @updated 01-04-2026 - i18n: replaced hardcoded strings with translation keys
 * @updated 01-07-2026 - Fixed service imports to use UpperCase static methods
 * @updated 01-08-2026 - Added multilanguage support for select fields
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
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

// Import from correct modules aligned with backend architecture
import { StructureService } from '../services';
import { StructureTypeService } from '../../type/services';
import { StructureDTO } from '../dto/StructureDTO';
import { StructureTypeDTO } from '../../type/dto';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const currentLanguage = i18n.language || 'en';

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

  /**
   * Get localized designation based on current language
   * Falls back to French -> English -> Arabic if current language not available
   */
  const getLocalizedDesignation = (item: StructureDTO | StructureTypeDTO): string => {
    if (currentLanguage === 'ar') {
      return item.designationAr || item.designationFr || item.designationEn || '-';
    }
    if (currentLanguage === 'en') {
      return item.designationEn || item.designationFr || item.designationAr || '-';
    }
    // Default to French
    return item.designationFr || item.designationEn || item.designationAr || '-';
  };

  useEffect(() => {
    loadDropdownData();
    if (isEditMode) {
      loadStructure();
    }
  }, [id]);

  const loadDropdownData = async () => {
    try {
      const [typesList, structuresList] = await Promise.all([
        StructureTypeService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
      ]);

      setStructureTypes(typesList);
      setParentStructures(structuresList);
    } catch (err: any) {
      console.error('Failed to load dropdown data:', err);
      setError(t('common.errors.loadingDataFailed'));
    }
  };

  const loadStructure = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await StructureService.getById(parseInt(id));
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
      setError(err.message || t('common.errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('common.validation.codeRequired');
    }
    if (!formData.designationFr?.trim()) {
      errors.designationFr = t('common.validation.designationFrRequired');
    }
    if (!formData.structureTypeId || formData.structureTypeId === 0) {
      errors.structureTypeId = t('common.validation.required', { field: t('structure.fields.structureType') });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError(t('common.errors.validationFailed'));
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
        await StructureService.update(parseInt(id!), structureData);
        setSuccess(t('common.messages.updateSuccess'));
      } else {
        const created = await StructureService.create(structureData);
        setSuccess(t('common.messages.createSuccess'));
        // Redirect to edit mode after creation
        setTimeout(() => navigate(`/administration/structures/${created.id}/edit`), 1500);
      }
    } catch (err: any) {
      console.error('Failed to save structure:', err);
      setError(err.message || t('common.errors.savingFailed'));
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
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
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
    setJobRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <StructureIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {isEditMode 
              ? t('common.page.editTitle', { entity: t('structure.title') })
              : t('common.page.createTitle', { entity: t('structure.title') })
            }
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('structure.title') })
            : t('common.page.createSubtitle', { entity: t('structure.title') })
          }
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
          <Tab label={t('structure.tabs.generalInformation')} />
          <Tab label={t('structure.tabs.jobs')} disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {t('common.sections.basicInformation')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={t('common.fields.code')}
                    value={formData.code || ''}
                    onChange={handleChange('code')}
                    error={Boolean(validationErrors.code)}
                    helperText={validationErrors.code || t('common.fields.codeHelper')}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    required
                    error={Boolean(validationErrors.structureTypeId)}
                  >
                    <InputLabel>{t('structure.fields.structureType')}</InputLabel>
                    <Select
                      value={formData.structureTypeId || ''}
                      onChange={handleChange('structureTypeId')}
                      label={t('structure.fields.structureType')}
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>{t('common.actions.selectOne')}</em>
                      </MenuItem>
                      {structureTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {getLocalizedDesignation(type)}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.structureTypeId && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {validationErrors.structureTypeId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Designations */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    {t('common.sections.designations')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label={t('common.fields.designationFr')}
                    value={formData.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    error={Boolean(validationErrors.designationFr)}
                    helperText={validationErrors.designationFr || t('common.fields.designationFrHelper')}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationEn')}
                    value={formData.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    helperText={t('common.fields.designationEnHelper')}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationAr')}
                    value={formData.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    helperText={t('common.fields.designationArHelper')}
                    disabled={loading}
                    dir="rtl"
                  />
                </Grid>

                {/* Hierarchy */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    {t('structure.sections.organizationalHierarchy')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>{t('structure.fields.parentStructure')}</InputLabel>
                    <Select
                      value={formData.parentStructureId || ''}
                      onChange={handleChange('parentStructureId')}
                      label={t('structure.fields.parentStructure')}
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>{t('structure.noParent')}</em>
                      </MenuItem>
                      {parentStructures
                        .filter((s) => !isEditMode || s.id !== parseInt(id!))
                        .map((structure) => (
                          <MenuItem key={structure.id} value={structure.id}>
                            {structure.code} - {getLocalizedDesignation(structure)}
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
            {loading ? t('common.saving') : t('common.save')}
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
