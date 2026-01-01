/**
 * Region List Page - SERVER-SIDE PAGINATION
 */

import { useState, useEffect, useCallback } from 'react';
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
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { regionService } from '../services/regionService';
import { RegionDTO } from '../dto/RegionDTO';

const RegionList = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLanguage = i18n.language || 'en';

  const [rows, setRows] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  const getDesignation = (obj: any): string => {
    if (!obj) return '';
    if (currentLanguage === 'ar') return obj.designationAr || obj.designationFr || obj.designationEn || '';
    if (currentLanguage === 'en') return obj.designationEn || obj.designationFr || obj.designationAr || '';
    return obj.designationFr || obj.designationEn || obj.designationAr || '';
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel, searchText]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      const pageResponse = searchText
        ? await regionService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir)
        : await regionService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);

      setRows(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load regions');
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this region?')) {
      try {
        await regionService.delete(id);
        setSuccess('Deleted');
        loadData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete region');
      }
    }
  };

  const handleClear = () => {
    setSearchText('');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    {
      field: 'code',
      headerName: 'Code',
      width: 130,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />,
    },
    {
      field: 'designationFr',
      headerName: 'Designation',
      minWidth: 240,
      flex: 1,
      valueGetter: (params) => getDesignation(params.row as RegionDTO),
    },
    {
      field: 'zone',
      headerName: 'Zone',
      minWidth: 200,
      flex: 1,
      valueGetter: (params) => getDesignation((params.row as any).zone),
    },
    {
      field: 'activity',
      headerName: 'Activity',
      minWidth: 200,
      flex: 1,
      valueGetter: (params) => getDesignation((params.row as any).activity),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => navigate(`/network/common/regions/${params.row.id}/edit`)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Regions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage regions (server-side pagination).
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
              placeholder="Search..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleClear} sx={{ whiteSpace: 'nowrap' }}>
              Clear
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/network/common/regions/create')}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Create
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
            sx={{ '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' } }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default RegionList;
