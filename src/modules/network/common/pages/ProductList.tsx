/**
 * Product List Page - SIMPLIFIED PATTERN - SERVER-SIDE SEARCH ONLY
 * 
 * Features:
 * - Server-side pagination (default: 10, options: 5, 10, 15)
 * - Server-side global search (no debounce needed)
 * - Export to CSV/Excel/PDF
 * - Multi-language support (Fr/En/Ar)
 * - Professional UI/UX
 * - Comprehensive i18n
 * 
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 * @updated 01-07-2026 - Fixed service imports
 * @updated 01-10-2026 - Applied i18n, removed ID column, optimized reactivity
 * @updated 01-16-2026 - Upgraded to advanced pattern with export and debounce
 * @updated 01-16-2026 - Fixed export transform signature
 * @updated 01-16-2026 - Optimized translation keys (standardized common keys)
 * @updated 01-17-2026 - REFACTORED: Removed client-side filters, server-side search only
 * @updated 01-17-2026 - Fixed: Added missing MenuItem import
 * @updated 01-18-2026 - Fixed translation keys to use common.yes/no and product.fields pattern
 * @updated 02-13-2026 - UI: Containerized header section for consistent styling
 * @updated 02-13-2026 - UI: Updated export/create buttons to IconButton + Tooltip style
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { ProductService } from '../services';
import { ProductDTO } from '../dto/ProductDTO';
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF,
  ExportColumn
} from '@/shared/utils/exportUtils';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  const [rows, setRows] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'code', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    loadData();
  }, [paginationModel, sortModel, searchText]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'code';
      const sortDir = sortModel.length > 0 ? (sortModel[0].sort || 'asc') : 'asc';

      const pageable = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: `${sortField},${sortDir}`
      };

      const pageResponse = searchText
        ? await ProductService.globalSearch(searchText, pageable)
        : await ProductService.getAll(pageable);

      setRows(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load products:', err);
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
        await ProductService.delete(id);
        setSuccess(t('message.deleteSuccess', 'Item deleted successfully'));
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.message || t('message.deleteError', 'Failed to delete item'));
      }
    }
  };

  const handleRefresh = () => {
    loadData();
    setSuccess(t('message.refreshed', 'Data refreshed'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => setExportAnchorEl(null);

  const getDesignation = (product: ProductDTO): string => {
    if (lang === 'ar') return product.designationAr || product.designationFr || product.designationEn || '-';
    if (lang === 'en') return product.designationEn || product.designationFr || product.designationAr || '-';
    return product.designationFr || product.designationEn || product.designationAr || '-';
  };

  const handleExportCSV = () => {
    const exportData = rows.map(row => ({
      ...row,
      designation: getDesignation(row)
    }));

    const exportColumns: ExportColumn[] = [
      { header: t('list.code', 'Code'), key: 'code', width: 15 },
      { header: t('list.designation', 'Designation'), key: 'designation', width: 35 },
      { 
        header: t('product.fields.density', 'Density'), 
        key: 'density',
        width: 15,
        transform: (value: any) => value ? `${value}` : '-'
      },
      { 
        header: t('product.fields.isHazardous', 'Hazardous'), 
        key: 'isHazardous',
        width: 15,
        transform: (value: any) => value ? t('common.yes', 'Yes') : t('common.no', 'No')
      }
    ];

    exportToCSV(exportData, {
      filename: 'products-export',
      title: t('product.title', 'Products'),
      columns: exportColumns
    });
    setSuccess(t('message.exportedCSV', 'Exported to CSV'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportExcel = async () => {
    const exportData = rows.map(row => ({
      ...row,
      designation: getDesignation(row)
    }));

    const exportColumns: ExportColumn[] = [
      { header: t('list.code', 'Code'), key: 'code', width: 15 },
      { header: t('list.designation', 'Designation'), key: 'designation', width: 35 },
      { 
        header: t('product.fields.density', 'Density'), 
        key: 'density',
        width: 15,
        transform: (value: any) => value ? `${value}` : '-'
      },
      { 
        header: t('product.fields.isHazardous', 'Hazardous'), 
        key: 'isHazardous',
        width: 15,
        transform: (value: any) => value ? t('common.yes', 'Yes') : t('common.no', 'No')
      }
    ];

    await exportToExcel(exportData, {
      filename: 'products-export',
      title: t('product.title', 'Products'),
      columns: exportColumns
    });
    setSuccess(t('message.exportedExcel', 'Exported to Excel'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportPDF = async () => {
    const exportData = rows.map(row => ({
      ...row,
      designation: getDesignation(row)
    }));

    const exportColumns: ExportColumn[] = [
      { header: t('list.code', 'Code'), key: 'code', width: 15 },
      { header: t('list.designation', 'Designation'), key: 'designation', width: 35 },
      { 
        header: t('product.fields.density', 'Density'), 
        key: 'density',
        width: 15,
        transform: (value: any) => value ? `${value}` : '-'
      },
      { 
        header: t('product.fields.isHazardous', 'Hazardous'), 
        key: 'isHazardous',
        width: 15,
        transform: (value: any) => value ? t('common.yes', 'Yes') : t('common.no', 'No')
      }
    ];

    await exportToPDF(exportData, {
      filename: 'products-export',
      title: t('product.title', 'Products'),
      columns: exportColumns
    }, t);
    setSuccess(t('message.exportedPDF', 'Exported to PDF'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'code',
      headerName: t('list.code', 'Code'),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProductIcon fontSize="small" color="action" />
          <Chip label={params.value} size="small" variant="outlined" 
            sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
        </Box>
      )
    },
    {
      field: 'designation',
      headerName: t('list.designation', 'Designation'),
      minWidth: 300,
      flex: 1,
      valueGetter: (params) => getDesignation(params.row),
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'density',
      headerName: t('product.fields.density', 'Density'),
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'isHazardous',
      headerName: t('product.fields.isHazardous', 'Hazardous'),
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? t('common.yes', 'Yes') : t('common.no', 'No')}
          size="small"
          color={params.value ? 'error' : 'success'}
          variant="outlined"
        />
      ),
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
              onClick={() => navigate(`/network/common/products/${params.row.id}/edit`)}
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
      {/* PART 1: HEADER SECTION - Containerized for consistent styling */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {t('product.title', 'Products')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('product.subtitle', 'Manage hydrocarbon products and materials')}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('action.refresh', 'Refresh')}>
                <IconButton onClick={handleRefresh} size="medium" color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('action.export', 'Export')}>
                <IconButton onClick={handleExportMenuOpen} size="medium" color="primary">
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('action.create', 'Create')}>
                <IconButton 
                  onClick={() => navigate('/network/common/products/create')} 
                  size="medium" 
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

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

      {/* PART 2: SEARCH/FILTERS SECTION */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              placeholder={t('product.searchPlaceholder', 'Search by code or designation...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {totalRows} {t('list.results', 'results')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* PART 3: DATA GRID */}
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

export default ProductList;