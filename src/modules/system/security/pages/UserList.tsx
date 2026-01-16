/**
 * User List Page - ADVANCED PATTERN with Export & i18n
 * Advanced DataGrid with server-side pagination, search, filters, export, and polished UI
 * 
 * Features:
 * - Server-side pagination (default: 10, options: 5, 10, 15)
 * - Debounced global search
 * - Advanced filters (status, role)
 * - Export to CSV/Excel/PDF
 * - Multi-language support (Fr/En/Ar)
 * - Professional UI/UX
 * - Comprehensive i18n - 100% coverage
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 01-08-2026 - Fixed implicit any types
 * @updated 01-16-2026 - Updated with i18n translation keys aligned with Network Core pattern
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
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF,
  ExportColumn
} from '@/shared/utils/exportUtils';

const UserList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);
  
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
  const [totalRows, setTotalRows] = useState(0);
  const [allRoles, setAllRoles] = useState<string[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    loadUsers();
  }, [paginationModel, sortModel, debouncedSearch, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const sortField = sortModel.length > 0 ? sortModel[0].field : 'id';
      const sortDir = sortModel.length > 0 ? sortModel[0].sort || 'asc' : 'asc';

      let pageResponse;
      
      if (debouncedSearch) {
        pageResponse = await userService.search(debouncedSearch, paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      } else {
        pageResponse = await userService.getPage(paginationModel.page, paginationModel.pageSize, sortField, sortDir);
      }
      
      let filteredContent = pageResponse.content;
      
      if (statusFilter !== 'all') {
        filteredContent = filteredContent.filter((user: UserDTO) => 
          (statusFilter === 'enabled' && user.enabled) ||
          (statusFilter === 'disabled' && !user.enabled)
        );
      }
      
      if (roleFilter !== 'all') {
        filteredContent = filteredContent.filter((user: UserDTO) =>
          user.roles && user.roles.some((role: { id: number; name: string }) => role.name === roleFilter)
        );
      }
      
      setUsers(filteredContent);
      setTotalRows(pageResponse.totalElements);
      
      const roles = new Set<string>();
      pageResponse.content.forEach((user: UserDTO) => {
        if (user.roles && Array.isArray(user.roles)) {
          user.roles.forEach((role: { id: number; name: string }) => roles.add(role.name));
        }
      });
      setAllRoles(Array.from(roles).sort());
      
      setError('');
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || t('message.errorLoading', 'Failed to load data'));
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

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    { 
      field: 'username', 
      headerName: t('list.username', 'Username'), 
      minWidth: 180, 
      flex: 1 
    },
    { 
      field: 'email', 
      headerName: t('list.email', 'Email'), 
      minWidth: 250, 
      flex: 1.5 
    },
    {
      field: 'enabled',
      headerName: t('list.status', 'Status'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.value ? t('user.enabled', 'Enabled') : t('user.disabled', 'Disabled')}
          color={params.value ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'roles',
      headerName: t('list.roles', 'Roles'),
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
      headerName: t('list.actions', 'Actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('action.edit', 'Edit')}>
            <IconButton 
              size="small" 
              onClick={() => handleEdit(params.row.id)} 
              sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#2563eb', 0.1) } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('action.delete', 'Delete')}>
            <IconButton 
              size="small" 
              onClick={() => handleDelete(params.row.id)} 
              sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#dc2626', 0.1) } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [t]);

  const handleCreate = () => navigate('/security/users/create');
  const handleEdit = (userId: number) => navigate(`/security/users/${userId}/edit`);
  
  const handleDelete = async (userId: number) => {
    if (window.confirm(t('action.confirmDelete', 'Are you sure you want to delete this item?'))) {
      try {
        await userService.delete(userId);
        setSuccess(t('message.deleteSuccess', 'Item deleted successfully'));
        loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.message || t('message.deleteError', 'Failed to delete item'));
      }
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setRoleFilter('all');
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const handleRefresh = () => {
    loadUsers();
    setSuccess(t('message.refreshed', 'Data refreshed'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);

  const exportColumns: ExportColumn[] = [
    { header: 'ID', key: 'id', width: 10 },
    { header: t('list.username', 'Username'), key: 'username', width: 20 },
    { header: t('list.email', 'Email'), key: 'email', width: 30 },
    { 
      header: t('list.status', 'Status'), 
      key: 'enabled',
      width: 15,
      transform: (value) => value ? t('user.enabled', 'Enabled') : t('user.disabled', 'Disabled')
    },
    { 
      header: t('list.roles', 'Roles'), 
      key: 'roles',
      width: 25,
      transform: (value) => value && Array.isArray(value) ? value.map((r: any) => r.name).join(', ') : '-'
    }
  ];

  const handleExportCSV = () => {
    exportToCSV(users, {
      filename: 'users-export',
      title: t('user.title', 'Users'),
      columns: exportColumns
    });
    setSuccess(t('message.exportedCSV', 'Exported to CSV'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportExcel = async () => {
    await exportToExcel(users, {
      filename: 'users-export',
      title: t('user.title', 'Users'),
      columns: exportColumns
    });
    setSuccess(t('message.exportedExcel', 'Exported to Excel'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  const handleExportPDF = async () => {
    await exportToPDF(users, {
      filename: 'users-export',
      title: t('user.title', 'Users'),
      columns: exportColumns
    }, t);
    setSuccess(t('message.exportedPDF', 'Exported to PDF'));
    setTimeout(() => setSuccess(''), 2000);
    handleExportMenuClose();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {t('user.title', 'Users')}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('action.refresh', 'Refresh')}>
              <IconButton onClick={handleRefresh} size="medium" color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="outlined" 
              startIcon={<ExportIcon />} 
              onClick={handleExportMenuOpen} 
              sx={{ borderRadius: 2 }}
            >
              {t('action.export', 'Export')}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleCreate} 
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              {t('action.create', 'Create')}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('user.subtitle', 'Manage and organize user accounts')}
        </Typography>
      </Box>

      <Menu 
        anchorEl={exportAnchorEl} 
        open={Boolean(exportAnchorEl)} 
        onClose={handleExportMenuClose} 
        PaperProps={{ elevation: 3, sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('action.exportCSV', 'Export CSV')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>{t('action.exportExcel', 'Export Excel')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('action.exportPDF', 'Export PDF')}</ListItemText>
        </MenuItem>
      </Menu>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                fullWidth
                placeholder={t('user.searchPlaceholder', 'Search by username or email...')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ) 
                }}
                sx={{ maxWidth: { md: 400 } }}
              />

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>{t('user.filterByStatus', 'Filter by Status')}</InputLabel>
                <Select 
                  value={statusFilter} 
                  label={t('user.filterByStatus', 'Filter by Status')} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('list.all', 'All')}</MenuItem>
                  <MenuItem value="enabled">{t('user.enabled', 'Enabled')}</MenuItem>
                  <MenuItem value="disabled">{t('user.disabled', 'Disabled')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>{t('user.filterByRole', 'Filter by Role')}</InputLabel>
                <Select 
                  value={roleFilter} 
                  label={t('user.filterByRole', 'Filter by Role')} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('list.all', 'All')}</MenuItem>
                  {allRoles.map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(searchText || statusFilter !== 'all' || roleFilter !== 'all') && (
                <Button 
                  variant="outlined" 
                  startIcon={<FilterIcon />} 
                  onClick={handleClearFilters} 
                  sx={{ minWidth: 150 }}
                >
                  {t('action.clearFilters', 'Clear Filters')}
                </Button>
              )}
            </Stack>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {totalRows} {t('list.results', 'results')}
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
          pageSizeOptions={[5, 10, 15]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: alpha('#2563eb', 0.04) },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha('#2563eb', 0.05),
              borderBottom: 2,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
          }}
        />
      </Paper>
    </Box>
  );
};

export default UserList;
