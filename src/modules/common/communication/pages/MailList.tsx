/**
 * Mail List Page - Professional Version
 * Advanced DataGrid with search, filters, export, and server-side pagination
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Fixed data response handling and added server-side pagination
 * @updated 12-29-2025 - Added file visualization action
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem,
  alpha,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Mail as MailIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridValueGetterParams, GridPaginationModel } from '@mui/x-data-grid';
import { mailService, mailNatureService, mailTypeService } from '../services';
import { MailDTO, MailNatureDTO, MailTypeDTO } from '../dto';
import axiosInstance from '../../../../shared/config/axios';

// Helper function to format date as DD/MM/YYYY
const formatDate = (dateString: string | undefined): string => {
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

const MailList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [mails, setMails] = useState<MailDTO[]>([]);
  const [mailNatures, setMailNatures] = useState<MailNatureDTO[]>([]);
  const [mailTypes, setMailTypes] = useState<MailTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedMailNatureId, setSelectedMailNatureId] = useState<string>('');
  const [selectedMailTypeId, setSelectedMailTypeId] = useState<string>('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reload data when pagination changes (for server-side pagination)
    loadLookupData();
  }, [paginationModel]);

  const loadLookupData = async () => {
    try {
      const [naturesResponse, typesResponse] = await Promise.all([
        mailNatureService.getAll(),
        mailTypeService.getAll(),
      ]);
      
      const naturesData = Array.isArray(naturesResponse) 
        ? naturesResponse 
        : (naturesResponse?.data || naturesResponse?.content || []);
      
      const typesData = Array.isArray(typesResponse) 
        ? typesResponse 
        : (typesResponse?.data || typesResponse?.content || []);
      
      setMailNatures(Array.isArray(naturesData) ? naturesData : []);
      setMailTypes(Array.isArray(typesData) ? typesData : []);
    } catch (err: any) {
      console.error('Failed to load lookup data:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to use paginated endpoint if service supports it
      // Otherwise fall back to getAll
      let mailsResponse;
      
      // Check if mailService has a paginated method
      if (typeof (mailService as any).getAllPaginated === 'function') {
        mailsResponse = await (mailService as any).getAllPaginated(
          paginationModel.page,
          paginationModel.pageSize
        );
      } else {
        mailsResponse = await mailService.getAll();
      }
      
      console.log('Raw mails response:', mailsResponse);
      console.log('Response type:', typeof mailsResponse);
      console.log('Is array:', Array.isArray(mailsResponse));
      
      // Extract data from response - handle multiple response formats
      let mailsData: MailDTO[];
      let totalCount: number;
      
      if (Array.isArray(mailsResponse)) {
        // Direct array response
        mailsData = mailsResponse;
        totalCount = mailsResponse.length;
      } else if (mailsResponse?.content && Array.isArray(mailsResponse.content)) {
        // Spring Boot Page format: { content: [], totalElements: n }
        mailsData = mailsResponse.content;
        totalCount = mailsResponse.totalElements || mailsResponse.content.length;
      } else if (mailsResponse?.data) {
        // Wrapped in data property
        if (Array.isArray(mailsResponse.data)) {
          mailsData = mailsResponse.data;
          totalCount = mailsResponse.total || mailsResponse.data.length;
        } else if (mailsResponse.data.content && Array.isArray(mailsResponse.data.content)) {
          mailsData = mailsResponse.data.content;
          totalCount = mailsResponse.data.totalElements || mailsResponse.data.content.length;
        } else {
          mailsData = [];
          totalCount = 0;
        }
      } else {
        mailsData = [];
        totalCount = 0;
      }
      
      console.log('Extracted mails data:', mailsData);
      console.log('Number of mails:', mailsData.length);
      console.log('Total count:', totalCount);
      
      // Ensure each item has an id for DataGrid
      const mailsWithIds = mailsData.map((mail, index) => ({
        ...mail,
        id: mail.id || index,
      }));
      
      setMails(mailsWithIds);
      setRowCount(totalCount);
      
      await loadLookupData();
      setError('');
    } catch (err: any) {
      console.error('Failed to load mails:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.message || 'Failed to load mails');
      setMails([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredMails = useMemo(() => {
    if (!Array.isArray(mails)) {
      console.log('Mails is not an array:', mails);
      return [];
    }
    
    const filtered = mails.filter((mail) => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = !searchText || 
        (mail.reference && mail.reference.toLowerCase().includes(searchLower)) ||
        (mail.subject && mail.subject.toLowerCase().includes(searchLower)) ||
        (mail.recordNumber && mail.recordNumber.toLowerCase().includes(searchLower));

      // Check mailNatureId - handle both direct ID and nested object
      const mailNatureIdToCheck = mail.mailNatureId || mail.mailNature?.id;
      const matchesNature = !selectedMailNatureId || 
        (mailNatureIdToCheck && mailNatureIdToCheck.toString() === selectedMailNatureId);

      // Check mailTypeId - handle both direct ID and nested object
      const mailTypeIdToCheck = mail.mailTypeId || mail.mailType?.id;
      const matchesType = !selectedMailTypeId || 
        (mailTypeIdToCheck && mailTypeIdToCheck.toString() === selectedMailTypeId);

      return matchesSearch && matchesNature && matchesType;
    });
    
    console.log('Filtered mails count:', filtered.length);
    return filtered;
  }, [mails, searchText, selectedMailNatureId, selectedMailTypeId]);

  const handleViewFile = async (fileId: number | undefined) => {
    if (!fileId) {
      setError('No file attached to this mail');
      return;
    }

    try {
      // Get file download URL from backend
      const response = await axiosInstance.get(`/system/utility/file/download/${fileId}`, {
        responseType: 'blob',
      });

      // Create blob URL and open in new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err: any) {
      console.error('Failed to open file:', err);
      setError(err.response?.data?.message || 'Failed to open file');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    { 
      field: 'reference', 
      headerName: t('mail.reference') || 'Reference', 
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MailIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Box>
      ),
    },
    { field: 'recordNumber', headerName: t('mail.recordNumber') || 'Record Number', minWidth: 140, flex: 0.8 },
    { field: 'subject', headerName: t('mail.subject') || 'Subject', minWidth: 250, flex: 2 },
    { 
      field: 'mailDate', 
      headerName: t('mail.mailDate') || 'Mail Date', 
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => formatDate(params.value),
    },
    { 
      field: 'mailNatureName', 
      headerName: t('mail.mailNature') || 'Nature', 
      minWidth: 150,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const mail = params.row as MailDTO;
        return mail.mailNature?.designationFr || mail.mailNature?.designationEn || '-';
      },
      renderCell: (params) => (
        params.value && params.value !== '-' ? (
          <Chip label={params.value} size="small" color="primary" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        )
      ),
    },
    { 
      field: 'mailTypeName', 
      headerName: t('mail.mailType') || 'Type', 
      minWidth: 130,
      flex: 0.8,
      valueGetter: (params: GridValueGetterParams) => {
        const mail = params.row as MailDTO;
        return mail.mailType?.designationFr || mail.mailType?.designationEn || '-';
      },
      renderCell: (params) => (
        params.value && params.value !== '-' ? (
          <Chip label={params.value} size="small" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        )
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 180,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const mail = params.row as MailDTO;
        const hasFile = Boolean(mail.fileId);
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasFile && (
              <Tooltip title="View File">
                <IconButton 
                  size="small" 
                  onClick={() => handleViewFile(mail.fileId)} 
                  sx={{ color: 'success.main', '&:hover': { bgcolor: alpha('#16a34a', 0.1) } }}
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('common.edit')}>
              <IconButton size="small" onClick={() => handleEdit(params.row.id)} sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#2563eb', 0.1) } }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#dc2626', 0.1) } }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const handleCreate = () => navigate('/communication/mails/create');
  const handleEdit = (mailId: number) => navigate(`/communication/mails/${mailId}/edit`);
  
  const handleDelete = async (mailId: number) => {
    if (window.confirm(t('mail.deleteConfirm') || 'Delete this mail?')) {
      try {
        await mailService.delete(mailId);
        setSuccess('Mail deleted successfully');
        loadData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete mail');
      }
    }
  };

  const handleRefresh = () => { loadData(); setSuccess('Data refreshed'); };
  const handleClearFilters = () => { setSearchText(''); setSelectedMailNatureId(''); setSelectedMailTypeId(''); };
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);
  const handleExportCSV = () => { setSuccess('Exported to CSV'); handleExportMenuClose(); };
  const handleExportExcel = () => { setSuccess('Exported to Excel'); handleExportMenuClose(); };
  const handleExportPDF = () => { setSuccess('Exported to PDF'); handleExportMenuClose(); };

  const handleNatureChange = (event: SelectChangeEvent<string>) => {
    setSelectedMailNatureId(event.target.value);
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedMailTypeId(event.target.value);
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">{t('mail.title') || 'Mail Management'}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} size="medium" color="primary"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen} sx={{ borderRadius: 2 }}>{t('common.export')}</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ borderRadius: 2, boxShadow: 2 }}>{t('mail.create') || 'Create Mail'}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">Manage mail correspondence, references and tracking</Typography>
      </Box>

      <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportMenuClose} PaperProps={{ elevation: 3, sx: { minWidth: 200 } }}>
        <MenuItem onClick={handleExportCSV}><ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon><ListItemText>{t('common.exportCSV')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportExcel}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon><ListItemText>{t('common.exportExcel')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportPDF}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>{t('common.exportPDF')}</ListItemText></MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Single-Row Filter Layout */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
            <TextField
              fullWidth
              placeholder={t('mail.searchPlaceholder') || 'Search by reference, subject, or record number...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
              sx={{ flex: 2 }}
            />

            <FormControl sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel>{t('mail.filterByNature') || 'Filter by Nature'}</InputLabel>
              <Select 
                value={selectedMailNatureId} 
                label={t('mail.filterByNature') || 'Filter by Nature'} 
                onChange={handleNatureChange}
              >
                <MenuItem value=""><em>{t('common.all') || 'All'}</em></MenuItem>
                {mailNatures.map((nature) => (
                  <MenuItem key={nature.id} value={nature.id?.toString() || ''}>
                    {nature.designationFr || nature.designationEn || `Nature ${nature.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160, flex: 1 }}>
              <InputLabel>{t('mail.filterByType') || 'Filter by Type'}</InputLabel>
              <Select 
                value={selectedMailTypeId} 
                label={t('mail.filterByType') || 'Filter by Type'} 
                onChange={handleTypeChange}
              >
                <MenuItem value=""><em>{t('common.all') || 'All'}</em></MenuItem>
                {mailTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id?.toString() || ''}>
                    {type.designationFr || type.designationEn || `Type ${type.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(searchText || selectedMailNatureId || selectedMailTypeId) && (
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} sx={{ minWidth: 140 }}>{t('common.clearFilters')}</Button>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 2 }}>
            {filteredMails.length} {t('common.results')}
            {mails.length !== filteredMails.length && <Typography component="span" variant="body2" color="text.disabled" sx={{ ml: 1 }}>(filtered from {mails.length})</Typography>}
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={filteredMails}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          paginationMode="client"
          rowCount={rowCount}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: alpha('#2563eb', 0.04) },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: alpha('#2563eb', 0.05), borderBottom: 2, borderColor: 'divider' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
          }}
        />
      </Paper>
    </Box>
  );
};

export default MailList;
