/**
 * Structure List Page
 * Hierarchical organizational structures with search and filters
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { useState, useEffect, useMemo } from 'react';
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
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import structureService from '../services/StructureService';
import structureTypeService from '../services/StructureTypeService';
import { StructureDTO } from '../dto/StructureDTO';
import { StructureTypeDTO } from '../dto/StructureTypeDTO';

const StructureList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Data state
  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [structureTypes, setStructureTypes] = useState<StructureTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  
  // Export menu
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [structuresData, typesData] = await Promise.all([
        structureService.getAll(),
        structureTypeService.getAll()
      ]);
      
      let structuresList: StructureDTO[] = [];
      if (Array.isArray(structuresData)) {
        structuresList = structuresData;
      } else if (structuresData && typeof structuresData === 'object') {
        structuresList = (structuresData as any).data || (structuresData as any).content || [];
      }
      
      let typesList: StructureTypeDTO[] = [];
      if (Array.isArray(typesData)) {
        typesList = typesData;
      } else if (typesData && typeof typesData === 'object') {
        typesList = (typesData as any).data || (typesData as any).content || [];
      }
      
      setStructures(structuresList);
      setStructureTypes(typesList);
      setError('');
    } catch (err: any) {
      console.error('Failed to load structures:', err);
      setError(err.message || 'Failed to load structures');
      setStructures([]);
      setStructureTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter structures
  const filteredStructures = useMemo(() => {
    if (!Array.isArray(structures)) return [];
    
    return structures.filter((structure) => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = !searchText || 
        (structure.code && structure.code.toLowerCase().includes(searchLower)) ||
        (structure.designationFr && structure.designationFr.toLowerCase().includes(searchLower)) ||
        (structure.designationEn && structure.designationEn.toLowerCase().includes(searchLower)) ||
        (structure.designationAr && structure.designationAr.toLowerCase().includes(searchLower));

      const matchesType = !selectedTypeId || 
        (structure.structureTypeId && structure.structureTypeId.toString() === selectedTypeId);

      return matchesSearch && matchesType;
    });
  }, [structures, searchText, selectedTypeId]);

  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    { 
      field: 'code', 
      headerName: 'Code', 
      width: 120,
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
      field: 'designationFr', 
      headerName: 'Designation (FR)', 
      minWidth: 250,
      flex: 2,
    },
    { 
      field: 'designationEn', 
      headerName: 'Designation (EN)', 
      minWidth: 200,
      flex: 1.5,
    },
    { 
      field: 'structureType', 
      headerName: 'Type', 
      width: 150,
      renderCell: (params) => {
        const type = params.row.structureType;
        return type ? (
          <Chip 
            label={type.designationFr || type.designationEn} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        ) : null;
      },
    },
    { 
      field: 'parentStructure', 
      headerName: 'Organization', 
      width: 180,
      renderCell: (params) => {
        const parent = params.row.parentStructure;
        return parent ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <OrganizationIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {parent.designationFr || parent.code}
            </Typography>
          </Box>
        ) : (
          <Chip label="Root" size="small" color="success" variant="outlined" />
        );
      },
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
          <Tooltip title={t('common.delete')}>
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
    if (window.confirm('Delete this structure?')) {
      try {
        await structureService.delete(structureId);
        setSuccess('Structure deleted successfully');
        loadData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete structure');
      }
    }
  };

  const handleRefresh = () => {
    loadData();
    setSuccess('Data refreshed');
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedTypeId(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedTypeId('');
  };

  // Export handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    setSuccess('Exported to CSV');
    handleExportMenuClose();
  };

  const handleExportExcel = () => {
    setSuccess('Exported to Excel');
    handleExportMenuClose();
  };

  const handleExportPDF = () => {
    setSuccess('Exported to PDF');
    handleExportMenuClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Organizational Structures
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh">
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
              {t('common.export')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              Create Structure
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage organizational structures and hierarchies
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
          <ListItemText>{t('common.exportCSV')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>{t('common.exportExcel')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PdfIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('common.exportPDF')}</ListItemText>
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
                placeholder="Search by code or designation..."
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
                <InputLabel>Structure Type</InputLabel>
                <Select
                  value={selectedTypeId}
                  onChange={handleTypeFilterChange}
                  label="Structure Type"
                >
                  <MenuItem value="">
                    <em>All Types</em>
                  </MenuItem>
                  {structureTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id.toString()}>
                      {type.designationFr || type.designationEn}
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
                  {t('common.clearFilters')}
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {filteredStructures.length} {t('common.results')}
                {structures.length !== filteredStructures.length && (
                  <Typography component="span" variant="body2" color="text.disabled" sx={{ ml: 1 }}>
                    (filtered from {structures.length})
                  </Typography>
                )}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* DataGrid */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <DataGrid
          rows={filteredStructures}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
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
