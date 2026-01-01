/**
 * HydrocarbonField List Page - Professional Version
 * Advanced DataGrid with server-side pagination, search, filters, export, and polished UI
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-29-2025
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Divider,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
  LocationOn as LocationIcon,
  Layers as FieldIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { hydrocarbonFieldService } from '../services';
import { HydrocarbonFieldDTO } from '../dto';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';
import { getLocalizedName } from '../utils/localizationUtils';

const HydrocarbonFieldList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLanguage = i18n.language || 'en';
  
  const [fields, setFields] = useState<HydrocarbonFieldDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);
  const [allStatuses, setAllStatuses] = useState<string[]>([]);
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [allVendors, setAllVendors] = useState<string[]>([]);

  useEffect(() => {
    loadFields();
  }, [paginationModel, sortModel, searchText, statusFilter, typeFilter, vendorFilter]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      let pageResponse;
      if (searchText) {
        pageResponse = await hydrocarbonFieldService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      } else {
        pageResponse = await hydrocarbonFieldService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      }
      
      let filteredContent = pageResponse.content;
      
      if (statusFilter !== 'all') {
        filteredContent = filteredContent.filter(field => {
          const statusName = field.operationalStatus ? getLocalizedName(field.operationalStatus, currentLanguage) : field.operationalStatusName;
          return statusName === statusFilter;
        });
      }
      
      if (typeFilter !== 'all') {
        filteredContent = filteredContent.filter(field => {
          const typeName = field.hydrocarbonFieldType ? getLocalizedName(field.hydrocarbonFieldType, currentLanguage) : field.hydrocarbonFieldTypeName;
          return typeName === typeFilter;
        });
      }
      
      if (vendorFilter !== 'all') {
        filteredContent = filteredContent.filter(field => {
          const vendorName = field.vendor?.name || field.vendorName;
          return vendorName === vendorFilter;
        });
      }
      
      setFields(filteredContent);
      setTotalRows(pageResponse.totalElements);
      
      const statuses = new Set<string>();
      const types = new Set<string>();
      const vendors = new Set<string>();
      
      pageResponse.content.forEach(field => {
        if (field.operationalStatus) {
          statuses.add(getLocalizedName(field.operationalStatus, currentLanguage));
        } else if (field.operationalStatusName) {
          statuses.add(field.operationalStatusName);
        }
        
        if (field.hydrocarbonFieldType) {
          types.add(getLocalizedName(field.hydrocarbonFieldType, currentLanguage));
        } else if (field.hydrocarbonFieldTypeName) {
          types.add(field.hydrocarbonFieldTypeName);
        }
        
        const vendorName = field.vendor?.name || field.vendorName;
        if (vendorName) vendors.add(vendorName);
      });
      
      setAllStatuses(Array.from(statuses).sort());
      setAllTypes(Array.from(types).sort());
      setAllVendors(Array.from(vendors).sort());
      setError('');
    } catch (err: any) {
      console.error('Failed to load hydrocarbon fields:', err);
      setError(err.message || 'Failed to load hydrocarbon fields');
      setFields([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    { 
      field: 'name', 
      headerName: 'Field Name', 
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FieldIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
        </Box>
      ),
    },
    { 
      field: 'code', 
      headerName: 'Code', 
      width: 130,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />,
    },
    { 
      field: 'hydrocarbonFieldType', 
      headerName: 'Type', 
      width: 150,
      sortable: false,
      valueGetter: (params) => {
        const field = params.row as HydrocarbonFieldDTO;
        return field.hydrocarbonFieldType ? getLocalizedName(field.hydrocarbonFieldType, currentLanguage) : (field.hydrocarbonFieldTypeName || 'N/A');
      },
      renderCell: (params) => <Chip label={params.value} size="small" color="info" variant="outlined" />,
    },
    { 
      field: 'placeName', 
      headerName: 'Location', 
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">{params.value}</Typography>
        </Box>
      ),
    },
    { 
      field: 'vendor', 
      headerName: 'Vendor', 
      width: 150,
      sortable: false,
      valueGetter: (params) => {
        const field = params.row as HydrocarbonFieldDTO;
        return field.vendor?.name || field.vendorName || '-';
      },
    },
    { 
      field: 'operationalStatus', 
      headerName: 'Status', 
      width: 140,
      sortable: false,
      valueGetter: (params) => {
        const field = params.row as HydrocarbonFieldDTO;
        return field.operationalStatus ? getLocalizedName(field.operationalStatus, currentLanguage) : (field.operationalStatusName || 'Unknown');
      },
      renderCell: (params) => <Chip label={params.value} size="small" color="success" variant="filled" />,
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
      ),
    },
  ];

  const handleCreate = () => navigate('/network/core/hydrocarbon-fields/create');
  const handleEdit = (fieldId: number) => navigate(`/network/core/hydrocarbon-fields/${fieldId}/edit`);
  
  const handleDelete = async (fieldId: number) => {
    if (window.confirm('Delete this hydrocarbon field?')) {
      try {
        await hydrocarbonFieldService.delete(fieldId);
        setSuccess('Hydrocarbon field deleted successfully');
        loadFields();
      } catch (err: any) {
        setError(err.message || 'Failed to delete hydrocarbon field');
      }
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setTypeFilter('all');
    setVendorFilter('all');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handleRefresh = () => { loadFields(); setSuccess('Data refreshed'); };
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);
  const handleExportCSV = () => { exportToCSV(fields, 'hydrocarbon-fields'); setSuccess('Exported to CSV'); handleExportMenuClose(); };
  const handleExportExcel = () => { exportToExcel(fields, 'hydrocarbon-fields'); setSuccess('Exported to Excel'); handleExportMenuClose(); };
  const handleExportPDF = () => { exportToPDF(fields, 'hydrocarbon-fields', t); setSuccess('Exported to PDF'); handleExportMenuClose(); };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">Hydrocarbon Fields</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} size="medium" color="primary"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen} sx={{ borderRadius: 2 }}>{t('common.export')}</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ borderRadius: 2, boxShadow: 2 }}>Create Field</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">Manage oil and gas hydrocarbon fields</Typography>
      </Box>

      <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportMenuClose} PaperProps={{ elevation: 3, sx: { minWidth: 200 } }}>
        <MenuItem onClick={handleExportCSV}><ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon><ListItemText>{t('common.exportCSV')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportExcel}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon><ListItemText>{t('common.exportExcel')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportPDF}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>{t('common.exportPDF')}</ListItemText></MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                fullWidth
                placeholder="Search fields by name, code, type, vendor, or location..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                sx={{ maxWidth: { md: 400 } }}
              />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  {allStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Type</InputLabel>
                <Select value={typeFilter} label="Filter by Type" onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="all">All Types</MenuItem>
                  {allTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Vendor</InputLabel>
                <Select value={vendorFilter} label="Filter by Vendor" onChange={(e) => setVendorFilter(e.target.value)}>
                  <MenuItem value="all">All Vendors</MenuItem>
                  {allVendors.map((vendor) => <MenuItem key={vendor} value={vendor}>{vendor}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters} sx={{ minWidth: 150 }}>{t('common.clearFilters')}</Button>
            </Stack>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>{totalRows} {t('common.results')} total</Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={fields}
          columns={columns}
          loading={loading}
          rowCount={totalRows}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          sortModel={sortModel}
          onSortModelChange={handleSortChange}
          pageSizeOptions={[10, 25, 50, 100]}
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

export default HydrocarbonFieldList;
