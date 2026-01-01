/**
 * Pipeline System List Page - SERVER-SIDE PAGINATION
 * 
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, IconButton, Chip, Alert, TextField, InputAdornment, Stack, Paper, Divider } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { pipelineSystemService } from '../services/pipelineSystemService';
import { PipelineSystemDTO } from '../dto/PipelineSystemDTO';

const PipelineSystemList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLanguage = i18n.language || 'en';

  const [pipelineSystems, setPipelineSystems] = useState<PipelineSystemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  const getDesignation = (obj: any): string => {
    if (!obj) return '';
    if (currentLanguage === 'ar') return obj.designationAr || obj.designationFr || obj.designationEn || obj.name || obj.code || '';
    if (currentLanguage === 'en') return obj.designationEn || obj.designationFr || obj.designationAr || obj.name || obj.code || '';
    return obj.designationFr || obj.designationEn || obj.designationAr || obj.name || obj.code || '';
  };

  useEffect(() => {
    loadPipelineSystems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel, searchText]);

  const loadPipelineSystems = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      const pageResponse = searchText
        ? await pipelineSystemService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir)
        : await pipelineSystemService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);

      setPipelineSystems(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load pipeline systems');
      setPipelineSystems([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this pipeline system?')) {
      try {
        await pipelineSystemService.delete(id);
        setSuccess('Deleted');
        loadPipelineSystems();
      } catch (err: any) {
        setError(err.message || 'Failed to delete pipeline system');
      }
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'System Name', minWidth: 220, flex: 1, renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value}</Typography> },
    { field: 'code', headerName: 'Code', width: 130, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> },
    {
      field: 'regionId',
      headerName: 'Region',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineSystemDTO;
        return <>{row.region ? getDesignation(row.region) : row.regionId ?? ''}</>;
      },
    },
    {
      field: 'productId',
      headerName: 'Product',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineSystemDTO;
        return <>{row.product ? getDesignation(row.product) : row.productId ?? ''}</>;
      },
    },
    {
      field: 'operationalStatusId',
      headerName: 'Status',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineSystemDTO;
        return <>{row.operationalStatus ? getDesignation(row.operationalStatus) : row.operationalStatusId ?? ''}</>;
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => navigate(`/network/core/pipeline-systems/${params.row.id}/edit`)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Pipeline Systems</Typography>
        <Stack direction="row" spacing={1.5}>
          <IconButton onClick={loadPipelineSystems} color="primary"><RefreshIcon /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/network/core/pipeline-systems/create')}>Create Pipeline System</Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', p: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth placeholder="Search pipeline systems..." value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 400 }} />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters}>Clear</Button>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary">{totalRows} total</Typography>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid rows={pipelineSystems} columns={columns} loading={loading} rowCount={totalRows} paginationMode="server" sortingMode="server" paginationModel={paginationModel} onPaginationModelChange={handlePaginationChange} sortModel={sortModel} onSortModelChange={handleSortChange} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick autoHeight />
      </Paper>
    </Box>
  );
};

export default PipelineSystemList;
