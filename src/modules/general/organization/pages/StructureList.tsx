/**
 * Structure List Page
 * Hierarchical organizational structures with search and filters
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 01-08-2026 - Fixed type guard for MenuItem
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
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
  AccountTree as StructureIcon,
  Business as OrganizationIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';

// Import from correct modules aligned with backend architecture
import { StructureService } from '../services';
import { StructureTypeService } from '../../type/services';
import { StructureDTO } from '../dto/StructureDTO';
import { StructureTypeDTO } from '../../type/dto';

const StructureList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Data state
  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [structureTypes, setStructureTypes] = useState<StructureTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [rowCount, setRowCount] = useState(0);
  
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Export menu
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Get current language
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  // Helper to get designation based on current language
  const getDesignation = (item: any): string => {
    if (!item) return '';
    if (lang === 'ar') return item.designationAr || item.designationFr || item.designationEn || '';
    if (lang === 'en') return item.designationEn || item.designationFr || item.designationAr || '';
    return item.designationFr || item.designationEn || item.designationAr || '';
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    loadStructureTypes();
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch, selectedTypeId]);

  const loadStructureTypes = async () => {
    try {
      const typesList = await StructureTypeService.getAllNoPagination();
      setStructureTypes(typesList);
    } catch (err: any) {
      console.error('Failed to load structure types:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const response = await StructureService.getAll({
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      
      let structuresList = response.content || [];
      
      // Apply client-side filtering if search or type filter is active
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        structuresList = structuresList.filter((s: StructureDTO) => 
          s.code?.toLowerCase().includes(searchLower) ||
          s.designationFr?.toLowerCase().includes(searchLower) ||
          s.designationEn?.toLowerCase().includes(searchLower) ||
          s.designationAr?.toLowerCase().includes(searchLower)
        );
      }
      
      if (selectedTypeId) {
        structuresList = structuresList.filter((s: StructureDTO) => 
          s.structureTypeId === Number(selectedTypeId)
        );
      }
      
      setStructures(structuresList);
      setRowCount(response.totalElements || 0);
      setError('');
    } catch (err: any) {
      console.error('Failed to load structures:', err);
      setError(err.message || t('structure.errorLoading', 'Failed to load structures'));
      setStructures([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: 'code', 
      headerName: t('structure.code', 'Code'),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StructureIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    { 
      field: 'designation', 
      headerName: t('structure.designation', 'Designation'),
      minWidth: 300,
      flex: 3,
      valueGetter: (params: any) => getDesignation(params.row),
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'structureType', 
      headerName: t('structure.type', 'Type'),
      width: 180,
      valueGetter: (params: any) => getDesignation(params.row.structureType),
      renderCell: (params) => {
        return params.value ? (
          <Chip 
            label={params.value} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        ) : null;
      },
    },
    { 
      field: 'parentStructure', 
      headerName: t('structure.parentStructure', 'Parent Structure'),
      width: 220,
      flex: 1,
      valueGetter: (params: any) => getDesignation(params.row.parentStructure) || params.row.parentStructure?.code,
      renderCell: (params) => {
        const parent = params.row.parentStructure;
        return parent ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <OrganizationIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
          </Box>
        ) : (
          <Chip label={t('structure.root', 'Root')} size="small" color="success" variant="outlined" />
        );
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions', 'Actions'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common.edit', 'Edit')}>
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row.id)}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#2563eb', 0.1) }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete', 'Delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: alpha('#dc2626', 0.1) }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleCreate = () => navigate('/administration/structures/create');
  const handleEdit = (structureId: number) => navigate(`/administration/structures/${structureId}/edit`);
  
  const handleDelete = async (structureId: number) => {
    if (window.confirm(t('structure.confirmDelete', 'Delete this structure?'))) {
      try {
        await StructureService.delete(structureId);
        setSuccess(t('structure.deleteSuccess', 'Structure deleted successfully'));
        loadData();
      } catch (err: any) {
        setError(err.message || t('structure.deleteError', 'Failed to delete structure'));
      }
    }
  };

  const handleRefresh = () => {
    loadData();
    setSuccess(t('common.refreshed', 'Data refreshed'));
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedTypeId(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedTypeId('');
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Export handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    setSuccess(t('common.exportedCSV', 'Exported to CSV'));
    handleExportMenuClose();
  };

  const handleExportExcel = () => {
    setSuccess(t('common.exportedExcel', 'Exported to Excel'));
    handleExportMenuClose();
  };

  const handleExportPDF = () => {
    setSuccess(t('common.exportedPDF', 'Exported to PDF'));
    handleExportMenuClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {t('structure.title', 'Organizational Structures')}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={t('common.refresh', 'Refresh')}>
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
              {t('common.export', 'Export')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              {t('structure.create', 'Create Structure')}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('structure.subtitle', 'Manage organizational structures and hierarchies')}
        </Typography>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.exportCSV', 'Export CSV')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>{t('common.exportExcel', 'Export Excel')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PdfIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('common.exportPDF', 'Export PDF')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Alerts */}
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

      {/* Filters */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder={t('structure.searchPlaceholder', 'Search by code or designation...')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 300 }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>{t('structure.filterByType', 'Structure Type')}</InputLabel>
                <Select
                  value={selectedTypeId}
                  onChange={handleTypeFilterChange}
                  label={t('structure.filterByType', 'Structure Type')}
                >
                  <MenuItem value="">
                    {t('structure.allTypes', 'All Types')}
                  </MenuItem>
                  {structureTypes
                    .filter(type => type.id !== undefined)
                    .map((type) => (
                      <MenuItem key={type.id} value={type.id!.toString()}>
                        {getDesignation(type)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {(searchText || selectedTypeId) && (
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{ minWidth: 120 }}
                >
                  {t('common.clearFilters', 'Clear Filters')}
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {rowCount} {t('common.results', 'results')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* DataGrid */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={structures}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          pageSizeOptions={[10, 25, 50, 100]}
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

export default StructureList;
