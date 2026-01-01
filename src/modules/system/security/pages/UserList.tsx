/**
 * User List Page - Professional Version
 * Advanced DataGrid with server-side pagination, search, filters, export, and polished UI
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-29-2025
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Divider,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { userService } from '../services';
import { UserDTO } from '../dto';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';

const UserList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);
  const [allRoles, setAllRoles] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, [paginationModel, sortModel, searchText, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      let pageResponse;
      
      if (searchText) {
        pageResponse = await userService.search(searchText, paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      } else {
        pageResponse = await userService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      }
      
      let filteredContent = pageResponse.content;
      
      if (statusFilter !== 'all') {
        filteredContent = filteredContent.filter(user => 
          (statusFilter === 'enabled' && user.enabled) ||
          (statusFilter === 'disabled' && !user.enabled)
        );
      }
      
      if (roleFilter !== 'all') {
        filteredContent = filteredContent.filter(user =>
          user.roles && user.roles.some(role => role.name === roleFilter)
        );
      }
      
      setUsers(filteredContent);
      setTotalRows(pageResponse.totalElements);
      
      const roles = new Set<string>();
      pageResponse.content.forEach(user => {
        if (user.roles && Array.isArray(user.roles)) {
          user.roles.forEach(role => roles.add(role.name));
        }
      });
      setAllRoles(Array.from(roles).sort());
      
      setError('');
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
      setUsers([]);
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
    { field: 'username', headerName: t('user.username'), minWidth: 180, flex: 1 },
    { field: 'email', headerName: t('user.email'), minWidth: 250, flex: 1.5 },
    {
      field: 'enabled',
      headerName: t('user.status'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.value ? t('user.enabled') : t('user.disabled')}
          color={params.value ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'roles',
      headerName: t('user.roles'),
      minWidth: 220,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
          {params.value && Array.isArray(params.value) && params.value.map((role: any) => (
            <Chip key={role.id} label={role.name} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
          ))}
        </Box>
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

  const handleCreate = () => navigate('/security/users/create');
  const handleEdit = (userId: number) => navigate(`/security/users/${userId}/edit`);
  
  const handleDelete = async (userId: number) => {
    if (window.confirm(t('user.deleteUser') + '?')) {
      try {
        await userService.delete(userId);
        setSuccess('User deleted successfully');
        loadUsers();
      } catch (err: any) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setRoleFilter('all');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handleRefresh = () => { loadUsers(); setSuccess('Data refreshed'); };
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);
  const handleExportCSV = () => { exportToCSV(users, 'users'); setSuccess('Exported to CSV'); handleExportMenuClose(); };
  const handleExportExcel = () => { exportToExcel(users, 'users'); setSuccess('Exported to Excel'); handleExportMenuClose(); };
  const handleExportPDF = () => { exportToPDF(users, 'users', t); setSuccess('Exported to PDF'); handleExportMenuClose(); };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">{t('user.title')}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} size="medium" color="primary"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen} sx={{ borderRadius: 2 }}>{t('common.export')}</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ borderRadius: 2, boxShadow: 2 }}>{t('user.createUser')}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">Manage and organize user accounts</Typography>
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
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                fullWidth
                placeholder={t('user.searchUsers')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                sx={{ maxWidth: { md: 400 } }}
              />

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>{t('user.filterByStatus')}</InputLabel>
                <Select value={statusFilter} label={t('user.filterByStatus')} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">{t('user.allStatuses')}</MenuItem>
                  <MenuItem value="enabled">{t('user.enabled')}</MenuItem>
                  <MenuItem value="disabled">{t('user.disabled')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>{t('user.filterByRole')}</InputLabel>
                <Select value={roleFilter} label={t('user.filterByRole')} onChange={(e) => setRoleFilter(e.target.value)}>
                  <MenuItem value="all">{t('user.allRoles')}</MenuItem>
                  {allRoles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </Select>
              </FormControl>

              <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleClearFilters} sx={{ minWidth: 150 }}>{t('common.clearFilters')}</Button>
            </Stack>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {totalRows} {t('common.results')} total
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={users}
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

export default UserList;
