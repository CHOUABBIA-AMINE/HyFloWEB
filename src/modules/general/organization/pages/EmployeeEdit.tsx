/**
 * Employee Edit/Create Page
 * Form for creating and editing employee records
 * 
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 * @updated 01-19-2026 - Fixed FileService import path
 * @updated 01-19-2026 - Fixed: use FileService for picture upload, store pictureId
 * @updated 01-19-2026 - Fixed: separate picture upload endpoint from employee data
 * @updated 01-19-2026 - Adjusted picture layout: next to 3 rows (Ar names, Lt names, Country)
 * @updated 01-19-2026 - Adjusted picture layout: next to names, clickable avatar area
 * @updated 01-19-2026 - Added picture upload field with preview
 * @updated 01-19-2026 - Fixed layout: Birth Date separate, State/District/Locality on own row
 * @updated 01-19-2026 - Reorganized layout: Country after names, State/District/Locality in one row
 * @updated 01-19-2026 - Added cascading State→District→Locality selectors for birth and address
 * @updated 01-19-2026 - Added missing fields: birthPlaceAr, addressAr, addressLt, localities
 * @updated 01-19-2026 - Confirmed alignment with EmployeeDTO (Locality fields)
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-18-2026 - Fixed translation key paths to match established pattern
 * @updated 01-07-2026 - Fixed service imports and field mappings
 * @updated 01-03-2026 - Removed MilitaryCategory and MilitaryRank (no longer in Employee model)
 * @updated 01-01-2026 - Dependent selects (Structure→Job)
 * @updated 01-01-2026 - Align routes and translation keys
 * 
 * Required Translation Keys:
 * - employee.picture
 * - employee.clickToUpload
 * - employee.birthLocality
 * - employee.addressLocality
 * - employee.birthPlaceAr
 * - employee.birthPlaceLt (or employee.birthPlace)
 * - employee.addressAr
 * - employee.addressLt
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import {
  EmployeeService,
  StructureService,
  JobService,
} from '../services';
import { 
  CountryService, 
  StateService,
  DistrictService,
  LocalityService 
} from '../../localization/services';
import { FileService } from '../../../system/utility/services';
import {
  EmployeeDTO,
  JobDTO,
  StructureDTO,
} from '../dto';
import { 
  CountryDTO, 
  StateDTO,
  DistrictDTO,
  LocalityDTO 
} from '../../localization/dto';

type HasDesignation = {
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
};

const EmployeeEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Picture state
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<EmployeeDTO>({
    lastNameAr: '',
    firstNameAr: '',
    lastNameLt: '',
    firstNameLt: '',
    birthDate: '',
    birthPlaceAr: '',
    birthPlaceLt: '',
    addressAr: '',
    addressLt: '',
    registrationNumber: '',
    countryId: undefined,
    birthLocalityId: undefined,
    addressLocalityId: undefined,
    jobId: undefined,
    pictureId: undefined,
  });

  // Lookup data
  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [states, setStates] = useState<StateDTO[]>([]);
  
  // Cascading selectors for birth location
  const [birthStateId, setBirthStateId] = useState<number | undefined>(undefined);
  const [birthDistrictId, setBirthDistrictId] = useState<number | undefined>(undefined);
  const [birthDistricts, setBirthDistricts] = useState<DistrictDTO[]>([]);
  const [birthLocalities, setBirthLocalities] = useState<LocalityDTO[]>([]);
  
  // Cascading selectors for address location
  const [addressStateId, setAddressStateId] = useState<number | undefined>(undefined);
  const [addressDistrictId, setAddressDistrictId] = useState<number | undefined>(undefined);
  const [addressDistricts, setAddressDistricts] = useState<DistrictDTO[]>([]);
  const [addressLocalities, setAddressLocalities] = useState<LocalityDTO[]>([]);
  
  const [selectedStructureId, setSelectedStructureId] = useState<number | undefined>(undefined);

  // Form validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  const getDesignation = (item?: HasDesignation | null): string => {
    if (!item) return '';
    if (lang === 'ar') return item.designationAr || item.designationFr || item.designationEn || '';
    if (lang === 'en') return item.designationEn || item.designationFr || item.designationAr || '';
    return item.designationFr || item.designationEn || item.designationAr || '';
  };

  useEffect(() => {
    loadInitialLookupData();
    if (isEditMode) {
      loadEmployee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // When structure changes, load jobs for that structure
  useEffect(() => {
    if (!selectedStructureId) {
      setJobs([]);
      setFormData((prev) => ({ ...prev, jobId: undefined }));
      return;
    }

    (async () => {
      try {
        const jobsList = await JobService.getByStructureId(selectedStructureId);
        setJobs(jobsList);
      } catch (err) {
        console.error('Error loading jobs by structure:', err);
        setError(t('common.errors.loadingDataFailed'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStructureId]);

  // Load birth districts when birth state changes
  useEffect(() => {
    if (!birthStateId) {
      setBirthDistricts([]);
      setBirthDistrictId(undefined);
      setBirthLocalities([]);
      return;
    }

    (async () => {
      try {
        const districts = await DistrictService.findByState(birthStateId);
        setBirthDistricts(districts);
      } catch (err) {
        console.error('Error loading birth districts:', err);
      }
    })();
  }, [birthStateId]);

  // Load birth localities when birth district changes
  useEffect(() => {
    if (!birthDistrictId) {
      setBirthLocalities([]);
      setFormData((prev) => ({ ...prev, birthLocalityId: undefined }));
      return;
    }

    (async () => {
      try {
        const localities = await LocalityService.findByDistrict(birthDistrictId);
        setBirthLocalities(localities);
      } catch (err) {
        console.error('Error loading birth localities:', err);
      }
    })();
  }, [birthDistrictId]);

  // Load address districts when address state changes
  useEffect(() => {
    if (!addressStateId) {
      setAddressDistricts([]);
      setAddressDistrictId(undefined);
      setAddressLocalities([]);
      return;
    }

    (async () => {
      try {
        const districts = await DistrictService.findByState(addressStateId);
        setAddressDistricts(districts);
      } catch (err) {
        console.error('Error loading address districts:', err);
      }
    })();
  }, [addressStateId]);

  // Load address localities when address district changes
  useEffect(() => {
    if (!addressDistrictId) {
      setAddressLocalities([]);
      setFormData((prev) => ({ ...prev, addressLocalityId: undefined }));
      return;
    }

    (async () => {
      try {
        const localities = await LocalityService.findByDistrict(addressDistrictId);
        setAddressLocalities(localities);
      } catch (err) {
        console.error('Error loading address localities:', err);
      }
    })();
  }, [addressDistrictId]);

  const loadInitialLookupData = async () => {
    try {
      const [structuresList, countriesList, statesList] = await Promise.all([
        StructureService.getAllNoPagination(),
        CountryService.getAllNoPagination(),
        StateService.getAllNoPagination(),
      ]);
      
      setStructures(structuresList);
      setCountries(countriesList);
      setStates(statesList);
    } catch (err) {
      console.error('Error loading lookup data:', err);
      setError(t('common.errors.loadingDataFailed'));
    }
  };

  const loadEmployee = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await EmployeeService.getById(Number(id));
      setFormData(data);
      
      // If employee has a picture, load the preview URL
      if (data.picture?.id) {
        const pictureUrl = FileService.getFileUrl(data.picture.id);
        setPicturePreview(pictureUrl);
      }
      
      // If employee has a job, load the job's structure and jobs for that structure
      if (data.job && data.job.structureId) {
        setSelectedStructureId(data.job.structureId);
      }

      // Load cascading data for birth location if locality exists
      if (data.birthLocality?.district?.stateId) {
        const stateId = data.birthLocality.district.stateId;
        setBirthStateId(stateId);
        
        if (data.birthLocality.districtId) {
          setBirthDistrictId(data.birthLocality.districtId);
        }
      }

      // Load cascading data for address location if locality exists
      if (data.addressLocality?.district?.stateId) {
        const stateId = data.addressLocality.district.stateId;
        setAddressStateId(stateId);
        
        if (data.addressLocality.districtId) {
          setAddressDistrictId(data.addressLocality.districtId);
        }
      }
    } catch (err) {
      console.error('Error loading employee:', err);
      setError(t('common.errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t('common.errors.invalidFileType'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('common.errors.fileTooLarge'));
        return;
      }

      setPictureFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePicture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPictureFile(null);
    setPicturePreview(null);
    setFormData((prev) => ({ ...prev, pictureId: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lastNameLt?.trim()) newErrors.lastNameLt = t('common.validation.required', { field: t('employee.lastNameLt') });
    if (!formData.firstNameLt?.trim()) newErrors.firstNameLt = t('common.validation.required', { field: t('employee.firstNameLt') });

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError(t('common.errors.validationFailed'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Step 1: Upload picture if selected (using FileService)
      let pictureId = formData.pictureId;
      if (pictureFile) {
        const uploadedFile = await FileService.upload(pictureFile, 'EMPLOYEE_PICTURE');
        pictureId = uploadedFile.id;
      }

      // Step 2: Save/update employee data with pictureId
      const employeeData: EmployeeDTO = {
        ...formData,
        pictureId,
      };

      if (isEditMode && id) {
        await EmployeeService.update(Number(id), employeeData);
      } else {
        await EmployeeService.create(employeeData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/administration/employees');
      }, 800);
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setError(err.response?.data?.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EmployeeDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const formatDateForInput = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              {isEditMode 
                ? t('common.page.editTitle', { entity: t('employee.title') })
                : t('common.page.createTitle', { entity: t('employee.title') })
              }
            </Typography>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/administration/employees')}>
              {t('common.back')}
            </Button>
          </Stack>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {isEditMode ? t('common.messages.updateSuccess') : t('common.messages.createSuccess')}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('common.sections.personalInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Left Column: Picture (spans 3 rows height) */}
              <Grid item xs={12} md={2}>
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={handlePictureChange}
                  id="picture-upload"
                />
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Tooltip title={t('employee.clickToUpload')}>
                    <Avatar
                      src={picturePreview || undefined}
                      sx={{ 
                        width: 140, 
                        height: 140,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          opacity: 0.8,
                        },
                        border: '2px dashed',
                        borderColor: 'divider',
                      }}
                      onClick={handleAvatarClick}
                    >
                      {!picturePreview && (
                        <Box sx={{ textAlign: 'center' }}>
                          <PhotoCameraIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formData.firstNameLt?.[0]?.toUpperCase() || '?'}
                          </Typography>
                        </Box>
                      )}
                    </Avatar>
                  </Tooltip>
                  {picturePreview && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={handleRemovePicture}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={1} textAlign="center">
                  {t('common.validation.maxFileSize', { size: '5MB' })}
                </Typography>
              </Grid>

              {/* Right Column: 3 rows - Arabic Names, Latin Names, Country */}
              <Grid item xs={12} md={10}>
                <Grid container spacing={2}>
                  {/* Row 1: Arabic Names */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('employee.lastNameAr')}
                      value={formData.lastNameAr || ''}
                      onChange={(e) => handleChange('lastNameAr', e.target.value)}
                      inputProps={{ dir: 'rtl' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('employee.firstNameAr')}
                      value={formData.firstNameAr || ''}
                      onChange={(e) => handleChange('firstNameAr', e.target.value)}
                      inputProps={{ dir: 'rtl' }}
                    />
                  </Grid>

                  {/* Row 2: Latin Names (Required) */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label={t('employee.lastNameLt')}
                      value={formData.lastNameLt}
                      onChange={(e) => handleChange('lastNameLt', e.target.value)}
                      error={Boolean(fieldErrors.lastNameLt)}
                      helperText={fieldErrors.lastNameLt}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label={t('employee.firstNameLt')}
                      value={formData.firstNameLt}
                      onChange={(e) => handleChange('firstNameLt', e.target.value)}
                      error={Boolean(fieldErrors.firstNameLt)}
                      helperText={fieldErrors.firstNameLt}
                    />
                  </Grid>

                  {/* Row 3: Country */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>{t('common.fields.country')}</InputLabel>
                      <Select
                        value={formData.countryId || ''}
                        onChange={(e) => handleChange('countryId', e.target.value || undefined)}
                        label={t('common.fields.country')}
                      >
                        <MenuItem value="">
                          <em>{t('common.actions.selectNone')}</em>
                        </MenuItem>
                        {countries.map((country) => (
                          <MenuItem key={country.id} value={country.id}>
                            {getDesignation(country)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* Birth Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {t('common.sections.birthInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Birth Date - Separate row */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('employee.birthDate')}
                  value={formatDateForInput(formData.birthDate)}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Birth Location Cascading: State → District → Locality in ONE ROW */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('common.fields.state')}</InputLabel>
                  <Select
                    value={birthStateId || ''}
                    onChange={(e) => {
                      const stateId = e.target.value ? Number(e.target.value) : undefined;
                      setBirthStateId(stateId);
                      setBirthDistrictId(undefined);
                      handleChange('birthLocalityId', undefined);
                    }}
                    label={t('common.fields.state')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state.id} value={state.id}>
                        {getDesignation(state)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!birthStateId}>
                  <InputLabel>{t('common.fields.district')}</InputLabel>
                  <Select
                    value={birthDistrictId || ''}
                    onChange={(e) => {
                      const districtId = e.target.value ? Number(e.target.value) : undefined;
                      setBirthDistrictId(districtId);
                      handleChange('birthLocalityId', undefined);
                    }}
                    label={t('common.fields.district')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {birthDistricts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {getDesignation(district)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!birthDistrictId}>
                  <InputLabel>{t('employee.birthLocality')}</InputLabel>
                  <Select
                    value={formData.birthLocalityId || ''}
                    onChange={(e) => handleChange('birthLocalityId', e.target.value || undefined)}
                    label={t('employee.birthLocality')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {birthLocalities.map((locality) => (
                      <MenuItem key={locality.id} value={locality.id}>
                        {getDesignation(locality)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Birth Places */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.birthPlaceAr')}
                  value={formData.birthPlaceAr || ''}
                  onChange={(e) => handleChange('birthPlaceAr', e.target.value)}
                  inputProps={{ dir: 'rtl' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.birthPlaceLt')}
                  value={formData.birthPlaceLt || ''}
                  onChange={(e) => handleChange('birthPlaceLt', e.target.value)}
                />
              </Grid>

              {/* Address Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {t('common.sections.addressInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Address Location Cascading: State → District → Locality in ONE ROW */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('common.fields.state')}</InputLabel>
                  <Select
                    value={addressStateId || ''}
                    onChange={(e) => {
                      const stateId = e.target.value ? Number(e.target.value) : undefined;
                      setAddressStateId(stateId);
                      setAddressDistrictId(undefined);
                      handleChange('addressLocalityId', undefined);
                    }}
                    label={t('common.fields.state')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state.id} value={state.id}>
                        {getDesignation(state)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!addressStateId}>
                  <InputLabel>{t('common.fields.district')}</InputLabel>
                  <Select
                    value={addressDistrictId || ''}
                    onChange={(e) => {
                      const districtId = e.target.value ? Number(e.target.value) : undefined;
                      setAddressDistrictId(districtId);
                      handleChange('addressLocalityId', undefined);
                    }}
                    label={t('common.fields.district')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {addressDistricts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {getDesignation(district)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!addressDistrictId}>
                  <InputLabel>{t('employee.addressLocality')}</InputLabel>
                  <Select
                    value={formData.addressLocalityId || ''}
                    onChange={(e) => handleChange('addressLocalityId', e.target.value || undefined)}
                    label={t('employee.addressLocality')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {addressLocalities.map((locality) => (
                      <MenuItem key={locality.id} value={locality.id}>
                        {getDesignation(locality)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Addresses */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.addressAr')}
                  value={formData.addressAr || ''}
                  onChange={(e) => handleChange('addressAr', e.target.value)}
                  inputProps={{ dir: 'rtl' }}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.addressLt')}
                  value={formData.addressLt || ''}
                  onChange={(e) => handleChange('addressLt', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Employment Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {t('common.sections.employmentInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('employee.registrationNumber')}
                  value={formData.registrationNumber || ''}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                />
              </Grid>

              {/* Structure → Job (dependent) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('common.fields.structure')}</InputLabel>
                  <Select
                    value={selectedStructureId || ''}
                    onChange={(e) => {
                      const newStructureId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedStructureId(newStructureId);
                      // reset job when structure changes
                      setFormData((prev) => ({ ...prev, jobId: undefined }));
                    }}
                    label={t('common.fields.structure')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {structures.map((structure) => (
                      <MenuItem key={structure.id} value={structure.id}>
                        {getDesignation(structure)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!selectedStructureId}>
                  <InputLabel>{t('employee.job')}</InputLabel>
                  <Select
                    value={formData.jobId || ''}
                    onChange={(e) => handleChange('jobId', e.target.value || undefined)}
                    label={t('employee.job')}
                  >
                    <MenuItem value="">
                      <em>{t('common.actions.selectNone')}</em>
                    </MenuItem>
                    {jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {getDesignation(job)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button variant="outlined" onClick={() => navigate('/administration/employees')} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeEdit;
