/**
 * Pipeline List Page - SERVER-SIDE PAGINATION
 * 
 * @author CHOUABBIA Amine
 * @updated 12-29-2025
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, IconButton, Chip, Alert, TextField, InputAdornment, Stack, Paper, Divider, Tooltip, alpha } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { pipelineService } from '../services';
import { PipelineDTO } from '../dto';

const PipelineList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => { loadPipelines(); }, [paginationModel, sortModel, searchText]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';
      const pageResponse = searchText 
        ? await pipelineService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir)
        : await pipelineService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      setPipelines(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load pipelines');
      setPipelines([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Pipeline Name', minWidth: 200, flex: 1, renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value}</Typography> },
    { field: 'code', headerName: 'Code', width: 130, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> },
    { field: 'length', headerName: 'Length (km)', width: 130, align: 'right', valueFormatter: (params) => params.value ? `${params.value.toFixed(2)} km` : '-' },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => navigate(`/network/core/pipelines/${params.row.id}/edit`)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this pipeline?')) {
      try { await pipelineService.delete(id); setSuccess('Deleted'); loadPipelines(); } catch (err: any) { setError(err.message); }
    }
  };

  const handleClearFilters = () => { setSearchText(''); setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Pipelines</Typography>
        <Stack direction="row" spacing={1.5}>
          <IconButton onClick={loadPipelines} color="primary"><RefreshIcon /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/network/core/pipelines/create')}>Create Pipeline</Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', p: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth placeholder="Search pipelines..." value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 400 }} />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters}>Clear</Button>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary">{totalRows} total</Typography>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid rows={pipelines} columns={columns} loading={loading} rowCount={totalRows} paginationMode="server" sortingMode="server" paginationModel={paginationModel} onPaginationModelChange={handlePaginationChange} sortModel={sortModel} onSortModelChange={handleSortChange} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick autoHeight />
      </Paper>
    </Box>
  );
};

export default PipelineList;
