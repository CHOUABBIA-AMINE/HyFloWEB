/**
 * Employee List Page - SIMPLIFIED PATTERN - SERVER-SIDE SEARCH ONLY
 * Displays paginated list of employees with search and CRUD operations
 * 
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 * @updated 01-01-2026 - Align routes and translation keys
 * @updated 01-07-2026 - Fixed service imports to use UpperCase static methods
 * @updated 01-09-2026 - Redesigned to match StructureList styling with DataGrid
 * @updated 01-16-2026 - Optimized translation keys (standardized common keys)
 * @updated 01-17-2026 - REFACTORED: Removed debounce, server-side search only
 * @updated 01-20-2026 - Combined name columns with language-based display (ar->ar, fr/en->lt)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  Divider,
  Avatar,
  Popover,
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
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { EmployeeService } from '../services';
import { FileService } from '../../../system/utility/services';
import { EmployeeDTO } from '../dto';

const EmployeeList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const [searchText, setSearchText] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Store blob URLs for employee pictures
  const [pictureBlobUrls, setPictureBlobUrls] = useState<Record<number, string>>({});

  // Hover popover state
  const [hoverAnchorEl, setHoverAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredImageUrl, setHoveredImageUrl] = useState<string>('');
  const [hoveredEmployeeName, setHoveredEmployeeName] = useState<string>('');

  // Get current language
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  useEffect(() => {
    loadData();
  }, [paginationModel.page, paginationModel.pageSize, searchText]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(pictureBlobUrls).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [pictureBlobUrls]);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = searchText
        ? await EmployeeService.globalSearch(searchText, {
            page: paginationModel.page,
            size: paginationModel.pageSize,
          })
        : await EmployeeService.getAll({
            page: paginationModel.page,
            size: paginationModel.pageSize,
          });

      setEmployees(response.content || []);
      setRowCount(response.totalElements || 0);
      setError('');

      // Load pictures for employees that have them
      await loadEmployeePictures(response.content || []);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      setError(err.message || t('message.errorLoading', 'Failed to load data'));
      setEmployees([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeePictures = async (employeeList: EmployeeDTO[]) => {
    // Clean up old blob URLs
    Object.values(pictureBlobUrls).forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    const newBlobUrls: Record<number, string> = {};

    // Load pictures in parallel
    await Promise.all(
      employeeList.map(async (employee) => {
        if (employee.picture?.id) {
          try {
            const blobUrl = await FileService.getFileBlob(employee.picture.id);
            newBlobUrls[employee.id!] = blobUrl;
          } catch (err) {
            console.error(`Failed to load picture for employee ${employee.id}:`, err);
            // Continue without picture - non-critical error
          }
        }
      })
    );

    setPictureBlobUrls(newBlobUrls);
  };

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return '-';
    }
  };

  const getAvatarText = (firstName: string | undefined, lastName: string | undefined): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'E';
  };

  const getEmployeeName = (employee: EmployeeDTO): string => {
    if (lang === 'ar') {
      // For Arabic, use Arabic names if available, otherwise fall back to Latin
      const firstName = employee.firstNameAr || employee.firstNameLt || '';
      const lastName = employee.lastNameAr || employee.lastNameLt || '';
      return `${firstName} ${lastName}`.trim() || '-';
    } else {
      // For French/English, use Latin names
      const firstName = employee.firstNameLt || '';
      const lastName = employee.lastNameLt || '';
      return `${firstName} ${lastName}`.trim() || '-';
    }
  };

  const handleAvatarMouseEnter = (event: React.MouseEvent<HTMLElement>, imageUrl: string, employeeName: string) => {
    if (imageUrl) {
      setHoverAnchorEl(event.currentTarget);
      setHoveredImageUrl(imageUrl);
      setHoveredEmployeeName(employeeName);
    }
  };

  const handleAvatarMouseLeave = () => {
    setHoverAnchorEl(null);
    setHoveredImageUrl('');
    setHoveredEmployeeName('');
  };

  const columns: GridColDef[] = [
    {
      field: 'picture',
      headerName: t('employee.picture', 'Photo'),
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={pictureBlobUrls[params.row.id] || undefined}
          alt={getEmployeeName(params.row)}
          onMouseEnter={(e) =>
            handleAvatarMouseEnter(
              e,
              pictureBlobUrls[params.row.id],
              getEmployeeName(params.row)
            )
          }
          onMouseLeave={handleAvatarMouseLeave}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: pictureBlobUrls[params.row.id] ? 'pointer' : 'default',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: pictureBlobUrls[params.row.id] ? 'scale(1.1)' : 'none',
            },
          }}
        >
          {getAvatarText(params.row.firstNameLt, params.row.lastNameLt)}
        </Avatar>
      ),
    },
    {
      field: 'registrationNumber',
      headerName: t('employee.registrationNumber', 'Registration Number'),
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: t('employee.name', 'Name'),
      flex: 1,
      minWidth: 200,
      valueGetter: (params: any) => getEmployeeName(params.row),
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            direction: lang === 'ar' ? 'rtl' : 'ltr',
            textAlign: lang === 'ar' ? 'right' : 'left',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'birthDate',
      headerName: t('employee.birthDate', 'Birth Date'),
      width: 130,
      valueFormatter: (params: any) => formatDate(params.value),
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
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#2563eb', 0.1) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('action.delete', 'Delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: alpha('#dc2626', 0.1) },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleCreate = () => navigate('/administration/employees/create');
  const handleEdit = (employeeId: number) => navigate(`/administration/employees/${employeeId}/edit`);

  const handleDelete = async (employeeId: number) => {
    if (window.confirm(t('action.confirmDelete', 'Are you sure you want to delete this item?'))) {
      try {
        await EmployeeService.delete(employeeId);
        setSuccess(t('message.deleteSuccess', 'Item deleted successfully'));
        loadData();
      } catch (err: any) {
        setError(err.message || t('message.deleteError', 'Failed to delete item'));
      }
    }
  };

  const handleRefresh = () => {
    loadData();
    setSuccess(t('message.refreshed', 'Data refreshed'));
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    setSuccess(t('message.exportedCSV', 'Exported to CSV'));
    handleExportMenuClose();
  };

  const handleExportExcel = () => {
    setSuccess(t('message.exportedExcel', 'Exported to Excel'));
    handleExportMenuClose();
  };

  const handleExportPDF = () => {
    setSuccess(t('message.exportedPDF', 'Exported to PDF'));
    handleExportMenuClose();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {t('employee.title', 'Employees')}
            </Typography>
          </Box>
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
          {t('employee.subtitle', 'Manage employee records and information')}
        </Typography>
      </Box>

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 },
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('action.exportCSV', 'Export CSV')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>{t('action.exportExcel', 'Export Excel')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PdfIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('action.exportPDF', 'Export PDF')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hover Popover for enlarged image */}
      <Popover
        open={Boolean(hoverAnchorEl)}
        anchorEl={hoverAnchorEl}
        onClose={handleAvatarMouseLeave}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
        }}
        PaperProps={{
          sx: {
            p: 1,
            boxShadow: 3,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            src={hoveredImageUrl}
            alt={hoveredEmployeeName}
            sx={{
              width: 200,
              height: 200,
              bgcolor: 'primary.main',
              fontSize: '3rem',
              fontWeight: 600,
            }}
          >
            {hoveredEmployeeName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {hoveredEmployeeName}
          </Typography>
        </Box>
      </Popover>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              placeholder={t('employee.searchPlaceholder', 'Search by registration number or name...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {rowCount} {t('list.results', 'results')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={employees}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          pageSizeOptions={[5, 10, 15]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={handlePaginationModelChange}
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

export default EmployeeList;