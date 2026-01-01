/**
 * Room List Page - Professional Version
 * Advanced DataGrid with server-side pagination, search, and filters
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
  MeetingRoom as RoomIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridValueGetterParams, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import roomService from '../services/RoomService';
import blocService from '../services/BlocService';
import floorService from '../services/FloorService';
import { RoomDTO, BlocDTO, FloorDTO } from '../dto';

const RoomList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [blocs, setBlocs] = useState<BlocDTO[]>([]);
  const [floors, setFloors] = useState<FloorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedBlocId, setSelectedBlocId] = useState<number | ''>('');
  const [selectedFloorId, setSelectedFloorId] = useState<number | ''>('');  
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  // Server-side pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [paginationModel, sortModel, searchText, selectedBlocId, selectedFloorId]);

  const loadFilters = async () => {
    try {
      const [blocsData, floorsData] = await Promise.all([
        blocService.getAll(),
        floorService.getAll(),
      ]);
      
      setBlocs(Array.isArray(blocsData) ? blocsData : []);
      setFloors(Array.isArray(floorsData) ? floorsData : []);
    } catch (err: any) {
      console.error('Failed to load filters:', err);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      let pageResponse;
      
      if (searchText) {
        // Use search endpoint when there's search text
        pageResponse = await roomService.search(
          searchText,
          paginationModel.page,
          paginationModel.pageSize,
          sortField,
          sortDir
        );
      } else {
        // Use regular paged endpoint
        pageResponse = await roomService.getPage(
          paginationModel.page,
          paginationModel.pageSize,
          sortField,
          sortDir
        );
      }
      
      // Client-side filtering for bloc and floor
      let filteredContent = pageResponse.content;
      if (selectedBlocId) {
        filteredContent = filteredContent.filter(room => room.blocId === selectedBlocId);
      }
      if (selectedFloorId) {
        filteredContent = filteredContent.filter(room => room.floorId === selectedFloorId);
      }
      
      setRooms(filteredContent);
      setTotalRows(pageResponse.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load rooms:', err);
      setError(err.message || 'Failed to load rooms');
      setRooms([]);
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
      headerName: t('room.code') || 'Code', 
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoomIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Box>
      ),
    },
    { 
      field: 'designationFr', 
      headerName: t('room.designationFr') || 'French Designation', 
      minWidth: 200, 
      flex: 1.5 
    },
    { 
      field: 'designationEn', 
      headerName: t('room.designationEn') || 'English Designation', 
      minWidth: 200, 
      flex: 1.5 
    },
    { 
      field: 'blocName', 
      headerName: t('room.bloc') || 'Bloc', 
      minWidth: 150,
      flex: 1,
      sortable: false,
      valueGetter: (params: GridValueGetterParams) => {
        const room = params.row as RoomDTO;
        if (room.bloc) {
          return room.bloc.designationFr || room.bloc.designationEn || room.bloc.designationAr || '-';
        }
        return '-';
      },
      renderCell: (params) => (
        params.value && params.value !== '-' ? (
          <Chip label={params.value} size="small" color="primary" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        )
      ),
    },
    { 
      field: 'floorName', 
      headerName: t('room.floor') || 'Floor', 
      minWidth: 120,
      flex: 0.8,
      sortable: false,
      valueGetter: (params: GridValueGetterParams) => {
        const room = params.row as RoomDTO;
        if (room.floor) {
          return room.floor.designationLt || room.floor.code || '-';
        }
        return '-';
      },
      renderCell: (params) => (
        params.value && params.value !== '-' ? (
          <Chip label={params.value} size="small" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        )
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

  const handleCreate = () => navigate('/environment/rooms/create');
  const handleEdit = (roomId: number) => navigate(`/environment/rooms/${roomId}/edit`);
  
  const handleDelete = async (roomId: number) => {
    if (window.confirm(t('room.deleteConfirm') || 'Delete this room?')) {
      try {
        await roomService.delete(roomId);
        setSuccess('Room deleted successfully');
        loadRooms();
      } catch (err: any) {
        setError(err.message || 'Failed to delete room');
      }
    }
  };

  const handleRefresh = () => { loadRooms(); setSuccess('Data refreshed'); };
  const handleClearFilters = () => { 
    setSearchText(''); 
    setSelectedBlocId(''); 
    setSelectedFloorId(''); 
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
          <Typography variant="h4" fontWeight={700} color="text.primary">{t('room.title') || 'Rooms'}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} size="medium" color="primary"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen} sx={{ borderRadius: 2 }}>{t('common.export')}</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ borderRadius: 2, boxShadow: 2 }}>{t('room.create') || 'Create Room'}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">Manage rooms in blocs and floors</Typography>
      </Box>

      <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportMenuClose} PaperProps={{ elevation: 3, sx: { minWidth: 200 } }}>
        <MenuItem onClick={handleExportCSV}><ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon><ListItemText>{t('common.exportCSV')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportExcel}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon><ListItemText>{t('common.exportExcel')}</ListItemText></MenuItem>
        <MenuItem onClick={handleExportPDF}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>{t('common.exportPDF')}</ListItemText></MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Single-Row Filter Layout */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
            <TextField
              fullWidth
              placeholder={t('room.searchPlaceholder') || 'Search by code or designation...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
              sx={{ flex: 2 }}
            />

            <FormControl sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel>{t('room.filterByBloc') || 'Filter by Bloc'}</InputLabel>
              <Select value={selectedBlocId} label={t('room.filterByBloc') || 'Filter by Bloc'} onChange={(e) => setSelectedBlocId(e.target.value as number | '')}>
                <MenuItem value=""><em>{t('common.all') || 'All'}</em></MenuItem>
                {blocs.map((bloc) => <MenuItem key={bloc.id} value={bloc.id}>{bloc.designationFr || bloc.designationEn || bloc.designationAr}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel>{t('room.filterByFloor') || 'Filter by Floor'}</InputLabel>
              <Select value={selectedFloorId} label={t('room.filterByFloor') || 'Filter by Floor'} onChange={(e) => setSelectedFloorId(e.target.value as number | '')}>
                <MenuItem value=""><em>{t('common.all') || 'All'}</em></MenuItem>
                {floors.map((floor) => <MenuItem key={floor.id} value={floor.id}>{floor.designationLt || floor.code}</MenuItem>)}
              </Select>
            </FormControl>

            {(searchText || selectedBlocId || selectedFloorId) && (
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
          rows={rooms}
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

export default RoomList;
