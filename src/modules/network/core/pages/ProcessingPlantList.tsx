/**
 * ProcessingPlant List Page - SERVER-SIDE PAGINATION
 * 
 * @author CHOUABBIA Amine
 * @created 01-15-2026
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, IconButton, Chip, Alert, TextField, InputAdornment, Stack, Paper, Divider, Tooltip, alpha } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { ProcessingPlantService } from '../services';
import { ProcessingPlantDTO } from '../dto';

const ProcessingPlantList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [plants, setPlants] = useState<ProcessingPlantDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'code', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => { loadPlants(); }, [paginationModel, sortModel, searchText]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'code';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';
      
      const pageable = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: `${sortField},${sortDir}`
      };

      const pageResponse = searchText 
        ? await ProcessingPlantService.globalSearch(searchText, pageable)
        : await ProcessingPlantService.getAll(pageable);
        
      setPlants(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load processing plants');
      setPlants([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 130, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> },
    { field: 'name', headerName: 'Name', minWidth: 250, flex: 1, renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value}</Typography> },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" onClick={() => navigate(`/network/core/processing-plants/${params.row.id}/edit`)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this processing plant?')) {
      try { 
        await ProcessingPlantService.delete(id); 
        setSuccess('Processing plant deleted successfully'); 
        loadPlants(); 
      } catch (err: any) { 
        setError(err.message || 'Failed to delete processing plant'); 
      }
    }
  };

  const handleClearFilters = () => { setSearchText(''); setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>Processing Plants</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={loadPlants} color="primary"><RefreshIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/network/core/processing-plants/create')}>
              Create Processing Plant
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage hydrocarbon processing facilities
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', p: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth placeholder="Search processing plants..." value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 400 }} />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters}>{t('common.clear')}</Button>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary">{totalRows} {t('common.total')}</Typography>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid 
          rows={plants} 
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

export default ProcessingPlantList;