/**
 * Vendor List Page - ADVANCED PATTERN - OPTIMIZED TRANSLATION KEYS
 * 
 * Features:
 * - Server-side pagination (default: 10, options: 5, 10, 15)
 * - Debounced global search
 * - Advanced filters with vendor type
 * - Export to CSV/Excel/PDF
 * - Multi-language support (Fr/En/Ar)
 * - Professional UI/UX
 * - Comprehensive i18n
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 01-07-2026 - Fixed service imports
 * @updated 01-10-2026 - Applied i18n, removed ID column, optimized reactivity
 * @updated 01-16-2026 - Upgraded to advanced pattern with export and debounce
 * @updated 01-16-2026 - Optimized translation keys (standardized common keys)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Divider,
  Chip,
  Tooltip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Store as VendorIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { VendorService } from '../services';
import { VendorDTO } from '../dto/VendorDTO';
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF,
  getMultiLangDesignation,
  ExportColumn
} from '@/shared/utils/exportUtils';

const VendorList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  const [rows, setRows] = useState<VendorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'shortName', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    loadData();
  }, [paginationModel, sortModel, debouncedSearch, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'shortName';
      const sortDir = sortModel.length > 0 ? (sortModel[0].sort || 'asc') : 'asc';

      const pageable = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: `${sortField},${sortDir}`
      };

      const pageResponse = debouncedSearch
        ? await VendorService.globalSearch(debouncedSearch, pageable)
        : await VendorService.getAll(pageable);

      let filteredContent = pageResponse.content;
      
      if (typeFilter) {
        filteredContent = filteredContent.filter((vendor: VendorDTO) => 
          vendor.vendorType?.id?.toString() === typeFilter
        );
      }

      setRows(filteredContent);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load vendors:', err);
      setError(err.message || t('message.errorLoading', 'Failed to load data'));
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);
  
  const handleSortChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('action.confirmDelete', 'Are you sure you want to delete this item?'))) {
      try {
        await VendorService.delete(id);
        setSuccess(t('message.deleteSuccess', 'Item deleted successfully'));
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.message || t('message.deleteError', 'Failed to delete item'));
      }
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setTypeFilter('');
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const handleRefresh = () => {
    loadData();
    setSuccess(t('message.refreshed', 'Data refreshed'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setTypeFilter(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => setExportAnchorEl(null);

  const exportColumns: ExportColumn[] = [
    { header: t('vendor.shortName', 'Short Name'), key: 'shortName', width: 15 },
    { header: t('vendor.name', 'Name'), key: 'name', width: 30 },
    { 
      header: t('vendor.type', 'Type'), 
      key: 'vendorType',
      width: 20,
      transform: (value) => getMultiLangDesignation(value, lang)
    },
    { 
      header: t('vendor.country', 'Country'), 
      key: 'country',
      width: 20,
      transform: (value) => getMultiLangDesignation(value, lang)
    }
  ];

  const handleExportCSV = () => {
    exportToCSV(rows, {
      filename: 'vendors-export',
      title: t('vendor.title', 'Vendors'),
      columns: exportColumns
    });
    setSuccess(t('message.exportedCSV', 'Exported to CSV'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportExcel = async () => {
    await exportToExcel(rows, {
      filename: 'vendors-export',
      title: t('vendor.title', 'Vendors'),
      columns: exportColumns
    });
    setSuccess(t('message.exportedExcel', 'Exported to Excel'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportPDF = async () => {
    await exportToPDF(rows, {
      filename: 'vendors-export',
      title: t('vendor.title', 'Vendors'),
      columns: exportColumns
    }, t);
    setSuccess(t('message.exportedPDF', 'Exported to PDF'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'shortName',
      headerName: t('vendor.shortName', 'Short Name'),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VendorIcon fontSize="small" color="action" />
          <Chip label={params.value || '-'} size="small" variant="outlined" 
            sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
        </Box>
      )
    },
    {
      field: 'name',
      headerName: t('vendor.name', 'Name'),
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'vendorType',
      headerName: t('vendor.type', 'Type'),
      minWidth: 180,
      flex: 1,
      valueGetter: (params) => getMultiLangDesignation(params.row.vendorType, lang),
      renderCell: (params) => (
        params.value ? (
          <Chip label={params.value} size="small" color="primary" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        )
      )
    },
    {
      field: 'country',
      headerName: t('vendor.country', 'Country'),
      minWidth: 180,
      flex: 1,
      valueGetter: (params) => getMultiLangDesignation(params.row.country, lang),
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('list.actions', 'Actions'),
      width: 130,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('action.edit', 'Edit')}>
            <IconButton
              size="small"
              onClick={() => navigate(`/network/common/vendors/${params.row.id}/edit`)}
              sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#2563eb', 0.1) } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('action.delete', 'Delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#dc2626', 0.1) } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [lang, t, navigate]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {t('vendor.title', 'Vendors')}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('action.refresh', 'Refresh')}>
              <IconButton onClick={handleRefresh} size="medium" color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportMenuOpen}
              sx={{ borderRadius: 2 }}
            >
              {t('action.export', 'Export')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/network/common/vendors/create')}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              {t('action.create', 'Create')}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('vendor.subtitle', 'Manage vendors and suppliers')}
        </Typography>
      </Box>

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportMenuClose}
        PaperProps={{ elevation: 3, sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('action.exportCSV', 'Export CSV')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>{t('action.exportExcel', 'Export Excel')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('action.exportPDF', 'Export PDF')}</ListItemText>
        </MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder={t('vendor.searchPlaceholder', 'Search by name, short name, or country...')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 300 }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>{t('vendor.filterByType', 'Vendor Type')}</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  label={t('vendor.filterByType', 'Vendor Type')}
                >
                  <MenuItem value="">{t('vendor.allTypes', 'All Types')}</MenuItem>
                </Select>
              </FormControl>

              {(searchText || typeFilter) && (
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleClearFilters}
                  sx={{ minWidth: 140 }}
                >
                  {t('action.clearFilters', 'Clear Filters')}
                </Button>
              )}
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {totalRows} {t('list.results', 'results')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={totalRows}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          sortModel={sortModel}
          onSortModelChange={handleSortChange}
          pageSizeOptions={[5, 10, 15]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: alpha('#2563eb', 0.04) },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha('#2563eb', 0.05),
              borderBottom: 2,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
          }}
        />
      </Paper>
    </Box>
  );
};

export default VendorList;
