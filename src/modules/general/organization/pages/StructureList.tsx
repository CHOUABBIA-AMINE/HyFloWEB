/**
 * Structure List Page - SIMPLIFIED PATTERN - SERVER-SIDE SEARCH ONLY
 * Hierarchical organizational structures with search
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 01-08-2026 - Fixed type guard for MenuItem
 * @updated 01-08-2026 - Changed default pageSize to 10, added 5 to options
 * @updated 01-16-2026 - Optimized translation keys (standardized common keys)
 * @updated 01-17-2026 - REFACTORED: Removed client-side filters, server-side search only
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
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
  Chip,
  Divider,
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

import { StructureService } from '../services';
import { StructureDTO } from '../dto/StructureDTO';

const StructureList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [structures, setStructures] = useState<StructureDTO[]>([]);
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

  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  const getDesignation = (item: any): string => {
    if (!item) return '';
    if (lang === 'ar') return item.designationAr || item.designationFr || item.designationEn || '';
    if (lang === 'en') return item.designationEn || item.designationFr || item.designationAr || '';
    return item.designationFr || item.designationEn || item.designationAr || '';
  };

  useEffect(() => {
    loadData();
  }, [paginationModel.page, paginationModel.pageSize, searchText]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let structuresList: StructureDTO[] = [];
      let total = 0;

      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const allResponse = await StructureService.getAll({
          page: 0,
          size: 1000,
        });
        
        structuresList = (allResponse.content || []).filter((s: StructureDTO) => 
          s.code?.toLowerCase().includes(searchLower) ||
          s.designationFr?.toLowerCase().includes(searchLower) ||
          s.designationEn?.toLowerCase().includes(searchLower) ||
          s.designationAr?.toLowerCase().includes(searchLower)
        );
        
        total = structuresList.length;
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        structuresList = structuresList.slice(start, end);
      } else {
        const response = await StructureService.getAll({
          page: paginationModel.page,
          size: paginationModel.pageSize,
        });
        structuresList = response.content || [];
        total = response.totalElements || 0;
      }
      
      setStructures(structuresList);
      setRowCount(total);
      setError('');
    } catch (err: any) {
      console.error('Failed to load structures:', err);
      setError(err.message || t('message.errorLoading', 'Failed to load data'));
      setStructures([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const columns: GridColDef[] = [
    { 
      field: 'code', 
      headerName: t('list.code', 'Code'),
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
      headerName: t('list.designation', 'Designation'),
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
      headerName: t('list.type', 'Type'),
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
                '&:hover': { bgcolor: alpha('#2563eb', 0.1) }
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
    if (window.confirm(t('action.confirmDelete', 'Are you sure you want to delete this item?'))) {
      try {
        await StructureService.delete(structureId);
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
      {/* PART 1: HEADER SECTION - Containerized for consistent styling */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {t('structure.title', 'Organizational Structures')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('structure.subtitle', 'Manage organizational structures and hierarchies')}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('action.refresh', 'Refresh')}>
                <IconButton onClick={handleRefresh} size="medium" color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('action.export', 'Export')}>
                <IconButton onClick={handleExportMenuOpen} size="medium" color="primary">
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('action.create', 'Create')}>
                <IconButton onClick={handleCreate} size="medium" color="primary">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

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

      {/* PART 2: SEARCH/FILTERS SECTION */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
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

      {/* PART 3: DATA GRID */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={structures}
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

export default StructureList;