/**
 * Product List Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 * @updated 01-07-2026 - Fixed service imports to use UpperCase static methods
 * @updated 01-10-2026 - Aligned table header design with StructureList
 * @updated 01-10-2026 - Added i18n translations and removed ID column
 * @updated 01-10-2026 - Optimized i18n reactivity following best practices
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { ProductService } from '../services';
import { ProductDTO } from '../dto/ProductDTO';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLanguage = i18n.language || 'en';

  const [rows, setRows] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'code', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(err.message || t('product.errorLoading'));
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('product.confirmDelete'))) {
      try {
        await ProductService.delete(id);
        setSuccess(t('product.deleteSuccess'));
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.message || t('product.deleteError'));
      }
    }
  };

  const handleClear = () => {
    setSearchText('');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Memoize columns with proper dependencies to handle language changes
  const columns: GridColDef[] = useMemo(() => {
    const getDesignation = (product: ProductDTO): string => {
      if (currentLanguage === 'ar') return product.designationAr || product.designationFr || product.designationEn || '-';
      if (currentLanguage === 'en') return product.designationEn || product.designationFr || product.designationAr || '-';
      return product.designationFr || product.designationEn || product.designationAr || '-';
    };

    return [
      {
        field: 'code',
        headerName: t('product.code'),
        width: 150,
        renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />,
      },
      {
        field: 'designation',
        headerName: t('product.designation'),
        minWidth: 300,
        flex: 1,
        valueGetter: (p) => getDesignation(p.row),
      },
      {
        field: 'density',
        headerName: t('product.density'),
        width: 120,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'isHazardous',
        headerName: t('product.isHazardous'),
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={params.value ? t('product.yes') : t('product.no')}
            size="small"
            color={params.value ? 'error' : 'success'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'actions',
        headerName: t('common.actions'),
        width: 130,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('common.edit')}>
              <IconButton
                size="small"
                onClick={() => navigate(`/network/common/products/${params.row.id}/edit`)}
                sx={{
                  color: 'primary.main',
                  '&:hover': { bgcolor: alpha('#2563eb', 0.1) }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton
                size="small"
                onClick={() => handleDelete(params.row.id)}
                sx={{
                  color: 'error.main',
                  '&:hover': { bgcolor: alpha('#dc2626', 0.1) }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];
  }, [currentLanguage, t, navigate]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {t('product.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('product.subtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('product.searchPlaceholder')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleClear} sx={{ whiteSpace: 'nowrap' }}>
              {t('product.clear')}
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/network/common/products/create')}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {t('product.create')}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

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
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 0,
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha('#2563eb', 0.04),
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha('#2563eb', 0.05),
                borderBottom: 2,
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductList;
