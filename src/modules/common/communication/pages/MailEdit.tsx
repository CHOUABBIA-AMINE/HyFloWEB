/**
 * Mail Edit/Create Page
 * Form for creating and editing mail records with tabs
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Added Structure select field and PDF upload
 * @updated 12-29-2025 - Updated file upload endpoint to system/utility controller
 * @updated 12-29-2025 - Added tabs and referenced mails management
 * @updated 12-29-2025 - Integrated referenced mails API calls
 */

import { useState, useEffect } from 'react';
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
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { mailService, mailNatureService, mailTypeService } from '../services';
import { MailDTO, MailNatureDTO, MailTypeDTO } from '../dto';
import { structureService } from '../../administration/services';
import { StructureDTO } from '../../administration/dto';
import axiosInstance from '../../../../shared/config/axios';

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
      id={`mail-tabpanel-${index}`}
      aria-labelledby={`mail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to format date as YYYY-MM-DD for input
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// Helper to format date as DD/MM/YYYY for display
const formatDateDisplay = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const MailEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mailNatures, setMailNatures] = useState<MailNatureDTO[]>([]);
  const [mailTypes, setMailTypes] = useState<MailTypeDTO[]>([]);
  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [availableMails, setAvailableMails] = useState<MailDTO[]>([]);
  const [referencedMails, setReferencedMails] = useState<MailDTO[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState<MailDTO>({
    reference: '',
    recordNumber: '',
    subject: '',
    mailDate: formatDateForInput(undefined),
    recordDate: formatDateForInput(undefined),
    mailNatureId: undefined,
    mailTypeId: undefined,
    structureId: undefined,
    fileId: undefined,
  });

  useEffect(() => {
    loadLookupData();
    loadAvailableMails();
    if (isEditMode) {
      loadMail();
    }
  }, [id]);

  const loadLookupData = async () => {
    try {
      const [naturesData, typesData, structuresData] = await Promise.all([
        mailNatureService.getAll(),
        mailTypeService.getAll(),
        structureService.getAll(),
      ]);
      setMailNatures(Array.isArray(naturesData) ? naturesData : []);
      setMailTypes(Array.isArray(typesData) ? typesData : []);
      setStructures(Array.isArray(structuresData) ? structuresData : []);
    } catch (err: any) {
      console.error('Failed to load lookup data:', err);
      setError('Failed to load form data');
    }
  };

  const loadAvailableMails = async () => {
    try {
      const response = await mailService.getAll();
      const mailsData = Array.isArray(response) 
        ? response 
        : (response?.data || response?.content || []);
      setAvailableMails(mailsData);
    } catch (err: any) {
      console.error('Failed to load available mails:', err);
    }
  };

  const loadMail = async () => {
    try {
      setLoading(true);
      const data = await mailService.getById(Number(id));
      setFormData({
        ...data,
        mailDate: formatDateForInput(data.mailDate),
        recordDate: formatDateForInput(data.recordDate),
      });
      
      // Load referenced mails
      try {
        const referenced = await mailService.getReferencedMails(Number(id));
        const referencedData = Array.isArray(referenced) 
          ? referenced 
          : (referenced?.data || referenced?.content || []);
        setReferencedMails(referencedData);
        console.log('Loaded referenced mails:', referencedData);
      } catch (err: any) {
        console.error('Failed to load referenced mails:', err);
        // Don't show error to user, just log it
        setReferencedMails([]);
      }
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load mail');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const uploadFile = async (): Promise<number | undefined> => {
    if (!selectedFile) return undefined;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axiosInstance.post('/system/utility/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setUploading(false);
      return response.data.id;
    } catch (err: any) {
      setUploading(false);
      throw new Error(err.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleAddReferencedMails = (event: any, newValue: MailDTO[]) => {
    // Filter out mails that are already referenced
    const uniqueMails = newValue.filter(
      (mail) => !referencedMails.some((ref) => ref.id === mail.id)
    );
    setReferencedMails([...referencedMails, ...uniqueMails]);
  };

  const handleRemoveReferencedMail = (mailId: number) => {
    setReferencedMails(referencedMails.filter((mail) => mail.id !== mailId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference || !formData.subject || !formData.mailDate || !formData.mailNatureId || !formData.mailTypeId || !formData.structureId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Upload file first if selected
      let fileId = formData.fileId;
      if (selectedFile) {
        fileId = await uploadFile();
        if (!fileId) {
          setError('File upload failed');
          setLoading(false);
          return;
        }
      }

      const mailData = { ...formData, fileId };

      let savedMailId: number;
      if (isEditMode) {
        await mailService.update(Number(id), mailData);
        savedMailId = Number(id);
      } else {
        const result = await mailService.create(mailData);
        savedMailId = result.id || Number(result);
      }

      // Save referenced mails if any exist
      if (referencedMails.length > 0 && savedMailId) {
        try {
          const referencedMailIds = referencedMails
            .map(m => m.id)
            .filter((id): id is number => id !== undefined);
          
          await mailService.updateReferencedMails(savedMailId, referencedMailIds);
          console.log('Referenced mails saved:', referencedMailIds);
        } catch (err: any) {
          console.error('Failed to save referenced mails:', err);
          setError('Mail saved but failed to update references: ' + (err.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      }

      setSuccess(`Mail ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/communication/mails');
      }, 1500);
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} mail`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MailDTO) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading && isEditMode && tabValue === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/communication/mails')} variant="outlined">
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEditMode ? t('mail.edit') || 'Edit Mail' : t('mail.create') || 'Create Mail'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="mail edit tabs">
            <Tab 
              icon={<DescriptionIcon />} 
              iconPosition="start" 
              label="General Information" 
              id="mail-tab-0"
              aria-controls="mail-tabpanel-0"
            />
            <Tab 
              icon={<LinkIcon />} 
              iconPosition="start" 
              label="Referenced Mails" 
              id="mail-tab-1"
              aria-controls="mail-tabpanel-1"
              disabled={!isEditMode}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label={t('mail.reference') || 'Reference'}
                      value={formData.reference}
                      onChange={handleChange('reference')}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('mail.recordNumber') || 'Record Number'}
                      value={formData.recordNumber}
                      onChange={handleChange('recordNumber')}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={3}
                      label={t('mail.subject') || 'Subject'}
                      value={formData.subject}
                      onChange={handleChange('subject')}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label={t('mail.mailDate') || 'Mail Date'}
                      value={formData.mailDate}
                      onChange={handleChange('mailDate')}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label={t('mail.recordDate') || 'Record Date'}
                      value={formData.recordDate}
                      onChange={handleChange('recordDate')}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>{t('mail.mailNature') || 'Mail Nature'}</InputLabel>
                      <Select
                        value={formData.mailNatureId || ''}
                        label={t('mail.mailNature') || 'Mail Nature'}
                        onChange={handleChange('mailNatureId')}
                        disabled={loading}
                      >
                        {mailNatures.map((nature) => (
                          <MenuItem key={nature.id} value={nature.id}>
                            {nature.designationFr || nature.designationEn}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>{t('mail.mailType') || 'Mail Type'}</InputLabel>
                      <Select
                        value={formData.mailTypeId || ''}
                        label={t('mail.mailType') || 'Mail Type'}
                        onChange={handleChange('mailTypeId')}
                        disabled={loading}
                      >
                        {mailTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.designationFr || type.designationEn}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>{t('mail.structure') || 'Structure'}</InputLabel>
                      <Select
                        value={formData.structureId || ''}
                        label={t('mail.structure') || 'Structure'}
                        onChange={handleChange('structureId')}
                        disabled={loading}
                      >
                        {structures.map((structure) => (
                          <MenuItem key={structure.id} value={structure.id}>
                            {structure.designationFr || structure.designationEn || structure.code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* PDF Upload Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {t('mail.attachment') || 'Mail Document (PDF)'}
                    </Typography>
                    
                    {!selectedFile ? (
                      <Paper
                        sx={{
                          p: 3,
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                      >
                        <input
                          id="pdf-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                          disabled={loading || uploading}
                        />
                        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body1" fontWeight={500}>
                          Click to upload PDF file
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Maximum file size: 10MB
                        </Typography>
                      </Paper>
                    ) : (
                      <Paper
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'success.main',
                          borderRadius: 2,
                          bgcolor: 'success.lighter',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatFileSize(selectedFile.size)}
                            </Typography>
                            {uploading && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                                <Typography variant="caption" color="text.secondary">
                                  Uploading: {uploadProgress}%
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <IconButton
                            onClick={handleRemoveFile}
                            disabled={loading || uploading}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Link Related Mails
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select mails that are related to this correspondence
                  </Typography>

                  <Autocomplete
                    multiple
                    options={availableMails.filter((mail) => mail.id !== Number(id))}
                    getOptionLabel={(option) => `${option.reference} - ${option.subject}`}
                    onChange={handleAddReferencedMails}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search and select mails"
                        placeholder="Type to search..."
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {option.reference}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.subject}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    value={[]}
                  />
                </Box>

                {referencedMails.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Referenced Mails ({referencedMails.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha('#2563eb', 0.05) }}>
                            <TableCell><strong>Reference</strong></TableCell>
                            <TableCell><strong>Subject</strong></TableCell>
                            <TableCell><strong>Mail Date</strong></TableCell>
                            <TableCell align="center" width={100}><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {referencedMails.map((mail) => (
                            <TableRow key={mail.id} hover>
                              <TableCell>{mail.reference}</TableCell>
                              <TableCell>{mail.subject}</TableCell>
                              <TableCell>{formatDateDisplay(mail.mailDate)}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveReferencedMail(mail.id!)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {referencedMails.length === 0 && (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'action.hover',
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <LinkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No referenced mails added yet
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Use the search above to link related mails
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </TabPanel>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 3, mt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="outlined" onClick={() => navigate('/communication/mails')} disabled={loading || uploading}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading || uploading}>
                {loading || uploading ? <CircularProgress size={20} /> : (isEditMode ? t('common.update') : t('common.create'))}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MailEdit;
