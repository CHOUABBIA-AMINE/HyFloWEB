/**
 * Hydrocarbon Field List Page - SERVER-SIDE PAGINATION
 * 
 * @author CHOUABBIA Amine
 * @updated 01-07-2026 - Fixed service imports to use UpperCase static methods
 * @updated 01-10-2026 - Aligned table header design with StructureList
 * @updated 01-10-2026 - Applied i18n translations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, IconButton, Chip, Alert, TextField, InputAdornment, Stack, Paper, Divider, Tooltip, alpha, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { HydrocarbonFieldService } from '../services';
import { HydrocarbonFieldDTO } from '../dto';

const HydrocarbonFieldList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [hydrocarbonFields, setHydrocarbonFields] = useState<HydrocarbonFieldDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadHydrocarbonFields(); }, [paginationModel, sortModel, searchText]);

  const loadHydrocarbonFields = async () => {
    try {
      setLoading(true);
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';
      
      const pageable = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: `${sortField},${sortDir}`
      };

      const pageResponse = searchText 
        ? await HydrocarbonFieldService.globalSearch(searchText, pageable)
        : await HydrocarbonFieldService.getAll(pageable);
        
      setHydrocarbonFields(pageResponse.content);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      setError(err.message || t('hydrocarbonField.errorLoading'));
      setHydrocarbonFields([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = useCallback((model: GridPaginationModel) => setPaginationModel(model), []);
  const handleSortChange = useCallback((model: GridSortModel) => setSortModel(model), []);

  const columns: GridColDef[] = [
    { field: 'code', headerName: t('hydrocarbonField.columns.code'), width: 130, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> },
    { field: 'name', headerName: t('hydrocarbonField.columns.name'), minWidth: 200, flex: 1, renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value}</Typography> },
    { field: 'hydrocarbonFieldType', headerName: t('hydrocarbonField.columns.type'), width: 120 },
    { field: 'placeName', headerName: t('hydrocarbonField.columns.location'), minWidth: 180, flex: 1 },
    { field: 'vendorShortName', headerName: t('hydrocarbonField.columns.vendor'), width: 130 },
    { field: 'operationalStatusName', headerName: t('hydrocarbonField.columns.status'), width: 140, renderCell: (params) => params.value ? <Chip label={params.value} size="small" color="primary" variant="outlined" /> : '-' },
    { field: 'installationDate', headerName: t('hydrocarbonField.columns.installationDate'), width: 150, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-' },
    {
      field: 'actions',
      headerName: t('hydrocarbonField.columns.actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" onClick={() => navigate(`/network/core/hydrocarbon-fields/${params.row.id}/edit`)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" onClick={() => { setFieldToDelete(params.row.id); setDeleteDialogOpen(true); }} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (fieldToDelete === null) return;
    try {
      setDeleting(true);
      await HydrocarbonFieldService.delete(fieldToDelete);
      setSuccess(t('hydrocarbonField.deleteSuccess'));
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
      loadHydrocarbonFields();
    } catch (err: any) {
      setError(err.message || t('hydrocarbonField.deleteError'));
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => { setSearchText(''); setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>{t('hydrocarbonField.title')}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={loadHydrocarbonFields} color="primary"><RefreshIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/network/core/hydrocarbon-fields/create')}>
              {t('hydrocarbonField.create')}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('hydrocarbonField.subtitle')}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', p: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth placeholder={t('hydrocarbonField.searchPlaceholder')} value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 400 }} />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters}>{t('common.clear')}</Button>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary">{totalRows} {t('common.total')}</Typography>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid 
          rows={hydrocarbonFields} 
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('hydrocarbonField.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('hydrocarbonField.confirmDeleteMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? t('hydrocarbonField.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HydrocarbonFieldList;
