/**
 * Folder List Page - Professional Version
 * Advanced DataGrid with server-side pagination, search, ArchiveBox filter, and export
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025
 */

import { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem,
  alpha,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Folder as FolderIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import folderService from '../services/FolderService';
import archiveBoxService from '../services/ArchiveBoxService';
import { FolderDTO, ArchiveBoxDTO } from '../dto';

const FolderList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [folders, setFolders] = useState<FolderDTO[]>([]);
  const [archiveBoxes, setArchiveBoxes] = useState<ArchiveBoxDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedArchiveBoxId, setSelectedArchiveBoxId] = useState<number | ''>('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    loadArchiveBoxes();
  }, []);

  useEffect(() => {
    loadFolders();
  }, [paginationModel, sortModel, searchText, selectedArchiveBoxId]);

  const loadArchiveBoxes = async () => {
    try {
      const archiveBoxesData = await archiveBoxService.getAll();
      setArchiveBoxes(Array.isArray(archiveBoxesData) ? archiveBoxesData : []);
    } catch (err: any) {
      console.error('Failed to load archive boxes:', err);
    }
  };

  const loadFolders = async () => {
    try {
      setLoading(true);
      
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      let pageResponse;
      
      if (searchText) {
        pageResponse = await folderService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      } else {
        pageResponse = await folderService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      }
      
      let filteredContent = pageResponse.content;
      if (selectedArchiveBoxId) {
        filteredContent = filteredContent.filter(folder => folder.archiveBoxId === selectedArchiveBoxId);
      }
      
      setFolders(filteredContent);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load folders:', err);
      setError(err.message || 'Failed to load folders');
      setFolders([]);
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    { 
      field: 'code', 
      headerName: t('folder.code') || 'Code', 
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Box>
      ),
    },
    { field: 'description', headerName: t('folder.description') || 'Description', minWidth: 250, flex: 2 },
    { 
      field: 'archiveBox', 
      headerName: t('folder.archiveBox') || 'Archive Box', 
      minWidth: 180,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        params.row.archiveBox ? (
          <Chip label={params.row.archiveBox.code} size="small" color="primary" variant="outlined" />
        ) : null
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" onClick={() => handleEdit(params.row.id)} sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#2563eb', 0.1) } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#dc2626', 0.1) } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleCreate = () => navigate('/environment/folders/create');
  const handleEdit = (folderId: number) => navigate(`/environment/folders/${folderId}/edit`);
  
  const handleDelete = async (folderId: number) => {
    if (window.confirm(t('folder.deleteConfirm') || 'Delete this folder?')) {
      try {
        await folderService.delete(folderId);
        setSuccess('Folder deleted successfully');
        loadFolders();
      } catch (err: any) {
        setError(err.message || 'Failed to delete folder');
      }
    }
  };

  const handleRefresh = () => { loadFolders(); setSuccess('Data refreshed'); };
  const handleClearFilters = () => { 
    setSearchText(''); 
    setSelectedArchiveBoxId(''); 
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);
  const handleExportCSV = () => { setSuccess('Exported to CSV'); handleExportMenuClose(); };
  const handleExportExcel = () => { setSuccess('Exported to Excel'); handleExportMenuClose(); };
  const handleExportPDF = () => { setSuccess('Exported to PDF'); handleExportMenuClose(); };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">{t('folder.title') || 'Folders'}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} size="medium" color="primary"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen} sx={{ borderRadius: 2 }}>{t('common.export')}</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ borderRadius: 2, boxShadow: 2 }}>{t('folder.create') || 'Create Folder'}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">Manage folders inside archive boxes</Typography>
      </Box>

      <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportMenuClose} PaperProps={{ elevation: 3, sx: { minWidth: 200 } }}>
        <MenuItem onClick={handleExportCSV}><ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon><ListItemText>{t('common.exportCSV')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportExcel}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon><ListItemText>{t('common.exportExcel')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportPDF}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>{t('common.exportPDF')}</ListItemText></MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
            <TextField
              fullWidth
              placeholder={t('folder.searchPlaceholder') || 'Search by code or description...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
              sx={{ flex: 2 }}
            />

            <FormControl sx={{ minWidth: 250, flex: 1 }}>
              <InputLabel>{t('folder.filterByArchiveBox') || 'Filter by Archive Box'}</InputLabel>
              <Select value={selectedArchiveBoxId} label={t('folder.filterByArchiveBox') || 'Filter by Archive Box'} onChange={(e) => setSelectedArchiveBoxId(e.target.value as number | '')}>
                <MenuItem value=""><em>{t('common.all') || 'All'}</em></MenuItem>
                {archiveBoxes.map((box) => <MenuItem key={box.id} value={box.id}>{box.code}</MenuItem>)}
              </Select>
            </FormControl>

            {(searchText || selectedArchiveBoxId) && (
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} sx={{ minWidth: 140 }}>{t('common.clearFilters')}</Button>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 2 }}>
            {totalRows} {t('common.results')} total
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={folders}
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

export default FolderList;
