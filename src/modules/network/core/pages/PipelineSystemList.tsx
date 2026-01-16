/**
 * Pipeline System List Page - ADVANCED PATTERN
 * 
 * Features:
 * - Server-side pagination (default: 10, options: 5, 10, 15)
 * - Debounced global search
 * - Advanced filters with status
 * - Export to CSV/Excel/PDF
 * - Multi-language support (Fr/En/Ar)
 * - Professional UI/UX
 * - Comprehensive i18n
 * 
 * @author CHOUABBIA Amine
 * @updated 01-07-2026 - Fixed service imports
 * @updated 01-10-2026 - Applied i18n, removed ID column
 * @updated 01-16-2026 - Upgraded to advanced pattern
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  AccountTree as SystemIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { PipelineSystemService } from '../services';
import { PipelineSystemDTO } from '../dto';
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF,
  getMultiLangDesignation,
  ExportColumn
} from '@/shared/utils/exportUtils';

const PipelineSystemList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);
  
  const [pipelineSystems, setPipelineSystems] = useState<PipelineSystemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'code', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    loadData();
  }, [paginationModel, sortModel, debouncedSearch, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'code';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';
      
      const pageable = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: `${sortField},${sortDir}`
      };

      const pageResponse = debouncedSearch 
        ? await PipelineSystemService.globalSearch(debouncedSearch, pageable)
        : await PipelineSystemService.getAll(pageable);
      
      let filteredContent = pageResponse.content;
      
      if (statusFilter) {
        filteredContent = filteredContent.filter((system: PipelineSystemDTO) => 
          system.operationalStatusName?.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      setPipelineSystems(filteredContent);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load pipeline systems:', err);
      setError(err.message || t('pipelineSystem.errorLoading', 'Failed to load pipeline systems'));
      setPipelineSystems([]);
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
    if (window.confirm(t('pipelineSystem.confirmDelete', 'Delete this pipeline system?'))) {
      try { 
        await PipelineSystemService.delete(id); 
        setSuccess(t('pipelineSystem.deleteSuccess', 'Pipeline system deleted successfully')); 
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) { 
        setError(err.message || t('pipelineSystem.deleteError', 'Failed to delete pipeline system')); 
      }
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const handleRefresh = () => {
    loadData();
    setSuccess(t('common.refreshed', 'Data refreshed'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => setExportAnchorEl(null);

  const exportColumns: ExportColumn[] = [
    { header: t('pipelineSystem.columns.code', 'Code'), key: 'code', width: 15 },
    { header: t('pipelineSystem.columns.name', 'Name'), key: 'name', width: 25 },
    { header: t('pipelineSystem.columns.structure', 'Structure'), key: 'structureCode', width: 15 },
    { header: t('pipelineSystem.columns.product', 'Product'), key: 'productName', width: 20 },
    { header: t('pipelineSystem.columns.status', 'Status'), key: 'operationalStatusName', width: 15 }
  ];

  const handleExportCSV = () => {
    exportToCSV(pipelineSystems, {
      filename: 'pipeline-systems-export',
      title: t('pipelineSystem.title', 'Pipeline Systems'),
      columns: exportColumns
    });
    setSuccess(t('common.exportedCSV', 'Exported to CSV'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportExcel = async () => {
    await exportToExcel(pipelineSystems, {
      filename: 'pipeline-systems-export',
      title: t('pipelineSystem.title', 'Pipeline Systems'),
      columns: exportColumns
    });
    setSuccess(t('common.exportedExcel', 'Exported to Excel'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportPDF = async () => {
    await exportToPDF(pipelineSystems, {
      filename: 'pipeline-systems-export',
      title: t('pipelineSystem.title', 'Pipeline Systems'),
      columns: exportColumns
    }, t);
    setSuccess(t('common.exportedPDF', 'Exported to PDF'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'code', 
      headerName: t('pipelineSystem.columns.code', 'Code'),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SystemIcon fontSize="small" color="action" />
          <Chip label={params.value} size="small" variant="outlined" 
            sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
        </Box>
      )
    },
    { 
      field: 'name', 
      headerName: t('pipelineSystem.columns.name', 'Name'),
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'structureCode', 
      headerName: t('pipelineSystem.columns.structure', 'Structure'),
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      )
    },
    { 
      field: 'productName', 
      headerName: t('pipelineSystem.columns.product', 'Product'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      )
    },
    { 
      field: 'operationalStatusName', 
      headerName: t('pipelineSystem.columns.status', 'Status'),
      width: 140,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      ) : (
        <Typography variant="body2" color="text.disabled">-</Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('common.actions', 'Actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common.edit', 'Edit')}>
            <IconButton
              size="small"
              onClick={() => navigate(`/network/core/pipeline-systems/${params.row.id}/edit`)}
              sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#2563eb', 0.1) } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete', 'Delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#dc2626', 0.1) } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [lang, t, navigate]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {t('pipelineSystem.title', 'Pipeline Systems')}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('common.refresh', 'Refresh')}>
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
              {t('common.export', 'Export')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/network/core/pipeline-systems/create')}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              {t('pipelineSystem.create', 'Create Pipeline System')}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('pipelineSystem.subtitle', 'Manage integrated pipeline networks and systems')}
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
          <ListItemText>{t('common.exportCSV', 'Export CSV')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>{t('common.exportExcel', 'Export Excel')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('common.exportPDF', 'Export PDF')}</ListItemText>
        </MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder={t('pipelineSystem.searchPlaceholder', 'Search by code, name, or product...')}
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
                <InputLabel>{t('pipelineSystem.filterByStatus', 'Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label={t('pipelineSystem.filterByStatus', 'Status')}
                >
                  <MenuItem value="">{t('pipelineSystem.allStatuses', 'All Statuses')}</MenuItem>
                </Select>
              </FormControl>

              {(searchText || statusFilter) && (
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleClearFilters}
                  sx={{ minWidth: 140 }}
                >
                  {t('common.clearFilters', 'Clear Filters')}
                </Button>
              )}
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {totalRows} {t('common.results', 'results')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={pipelineSystems}
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

export default PipelineSystemList;