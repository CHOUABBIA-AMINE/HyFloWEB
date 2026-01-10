/**
 * Station List Page - SERVER-SIDE PAGINATION
 * 
 * @author CHOUABBIA Amine
 * @updated 01-07-2026 - Fixed service imports to use UpperCase static methods
 * @updated 01-10-2026 - Aligned table header design with StructureList
 * @updated 01-10-2026 - Removed ID column and applied i18n translations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, IconButton, Chip, Alert, TextField, InputAdornment, Stack, Paper, Divider, Tooltip, alpha } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StationService } from '../services';
import { StationDTO } from '../dto';

const StationList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [stations, setStations] = useState<StationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => { loadStations(); }, [paginationModel, sortModel, searchText]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'name';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';
      
      const pageable = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: `${sortField},${sortDir}`
      };

      const pageResponse = searchText 
        ? await StationService.globalSearch(searchText, pageable)
        : await StationService.getAll(pageable);
        
      setStations(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      setError(err.message || t('station.errorLoading'));
      setStations([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const columns: GridColDef[] = [
    { field: 'code', headerName: t('station.code'), width: 130, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> },
    { field: 'name', headerName: t('station.name'), minWidth: 200, flex: 1, renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value}</Typography> },
    { field: 'placeName', headerName: t('station.location'), minWidth: 180, flex: 1 },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" onClick={() => navigate(`/network/core/stations/${params.row.id}/edit`)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm(t('station.confirmDelete'))) {
      try { 
        await StationService.delete(id); 
        setSuccess(t('station.deleteSuccess')); 
        loadStations(); 
      } catch (err: any) { 
        setError(err.message || t('station.deleteError')); 
      }
    }
  };

  const handleClearFilters = () => { setSearchText(''); setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>{t('station.title')}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={loadStations} color="primary"><RefreshIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/network/core/stations/create')}>{t('station.create')}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('station.subtitle')}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', p: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth placeholder={t('station.searchPlaceholder')} value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 400 }} />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters}>{t('common.clear')}</Button>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary">{totalRows} {t('common.total')}</Typography>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid 
          rows={stations} 
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
      </Paper>
    </Box>
  );
};

export default StationList;
