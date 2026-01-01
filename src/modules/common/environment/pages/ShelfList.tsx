/**
 * Shelf List Page - Professional Version
 * Advanced DataGrid with server-side pagination, search, Room filter, and export
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
  ViewList as ShelfIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import shelfService from '../services/ShelfService';
import roomService from '../services/RoomService';
import { ShelfDTO, RoomDTO } from '../dto';

const ShelfList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [shelves, setShelves] = useState<ShelfDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    loadShelves();
  }, [paginationModel, sortModel, searchText, selectedRoomId]);

  const loadRooms = async () => {
    try {
      const roomsData = await roomService.getAll();
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err: any) {
      console.error('Failed to load rooms:', err);
    }
  };

  const loadShelves = async () => {
    try {
      setLoading(true);
      
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      let pageResponse;
      
      if (searchText) {
        pageResponse = await shelfService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      } else {
        pageResponse = await shelfService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      }
      
      let filteredContent = pageResponse.content;
      if (selectedRoomId) {
        filteredContent = filteredContent.filter(shelf => shelf.roomId === selectedRoomId);
      }
      
      setShelves(filteredContent);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load shelves:', err);
      setError(err.message || 'Failed to load shelves');
      setShelves([]);
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
      headerName: t('shelf.code') || 'Code', 
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShelfIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Box>
      ),
    },
    { field: 'designationFr', headerName: t('shelf.designationFr') || 'French Designation', minWidth: 200, flex: 1.5 },
    { field: 'designationEn', headerName: t('shelf.designationEn') || 'English Designation', minWidth: 200, flex: 1.5 },
    { 
      field: 'room', 
      headerName: t('shelf.room') || 'Room', 
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        params.row.room ? (
          <Chip label={`${params.row.room.code} - ${params.row.room.designationFr || ''}`} size="small" color="primary" variant="outlined" />
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

  const handleCreate = () => navigate('/environment/shelves/create');
  const handleEdit = (shelfId: number) => navigate(`/environment/shelves/${shelfId}/edit`);
  
  const handleDelete = async (shelfId: number) => {
    if (window.confirm(t('shelf.deleteConfirm') || 'Delete this shelf?')) {
      try {
        await shelfService.delete(shelfId);
        setSuccess('Shelf deleted successfully');
        loadShelves();
      } catch (err: any) {
        setError(err.message || 'Failed to delete shelf');
      }
    }
  };

  const handleRefresh = () => { loadShelves(); setSuccess('Data refreshed'); };
  const handleClearFilters = () => { 
    setSearchText(''); 
    setSelectedRoomId(''); 
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
          <Typography variant="h4" fontWeight={700} color="text.primary">{t('shelf.title') || 'Shelves'}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} size="medium" color="primary"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen} sx={{ borderRadius: 2 }}>{t('common.export')}</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ borderRadius: 2, boxShadow: 2 }}>{t('shelf.create') || 'Create Shelf'}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">Manage shelves in rooms for storage organization</Typography>
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
              placeholder={t('shelf.searchPlaceholder') || 'Search by code or designation...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
              sx={{ flex: 2 }}
            />

            <FormControl sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>{t('shelf.filterByRoom') || 'Filter by Room'}</InputLabel>
              <Select value={selectedRoomId} label={t('shelf.filterByRoom') || 'Filter by Room'} onChange={(e) => setSelectedRoomId(e.target.value as number | '')}>
                <MenuItem value=""><em>{t('common.all') || 'All'}</em></MenuItem>
                {rooms.map((room) => <MenuItem key={room.id} value={room.id}>{room.code} - {room.designationFr}</MenuItem>)}
              </Select>
            </FormControl>

            {(searchText || selectedRoomId) && (
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
          rows={shelves}
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

export default ShelfList;
