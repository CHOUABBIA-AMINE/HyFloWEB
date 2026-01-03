/**
 * Structure Type List Page
 * Display and manage structure types (categories/classifications)
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
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
  alpha,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Category as TypeIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { structureTypeService } from '../services';
import { StructureTypeDTO } from '../dto';

const StructureTypeList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Data state
  const [structureTypes, setStructureTypes] = useState<StructureTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter state
  const [searchText, setSearchText] = useState('');

  // Get current language
  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  // Helper to get designation based on current language
  const getDesignation = (item: any): string => {
    if (!item) return '';
    if (lang === 'ar') return item.designationAr || item.designationFr || item.designationEn || '';
    if (lang === 'en') return item.designationEn || item.designationFr || item.designationAr || '';
    return item.designationFr || item.designationEn || item.designationAr || '';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await structureTypeService.getAll();
      
      let typesList: StructureTypeDTO[] = [];
      if (Array.isArray(data)) {
        typesList = data;
      } else if (data && typeof data === 'object') {
        typesList = (data as any).data || (data as any).content || [];
      }
      
      setStructureTypes(typesList);
      setError('');
    } catch (err: any) {
      console.error('Failed to load structure types:', err);
      setError(err.message || 'Failed to load structure types');
      setStructureTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter structure types
  const filteredTypes = useMemo(() => {
    if (!Array.isArray(structureTypes)) return [];
    
    return structureTypes.filter((type) => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = !searchText || 
        (type.code && type.code.toLowerCase().includes(searchLower)) ||
        (type.designationFr && type.designationFr.toLowerCase().includes(searchLower)) ||
        (type.designationEn && type.designationEn.toLowerCase().includes(searchLower)) ||
        (type.designationAr && type.designationAr.toLowerCase().includes(searchLower));

      return matchesSearch;
    });
  }, [structureTypes, searchText]);

  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: 'code', 
      headerName: 'Code', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TypeIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    { 
      field: 'designation', 
      headerName: 'Designation', 
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
      field: 'shortName', 
      headerName: 'Short Name', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      ),
    },
    { 
      field: 'displayOrder', 
      headerName: 'Order', 
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip 
          label={params.value || '-'} 
          size="small" 
          variant="outlined"
        />
      ),
    },
    { 
      field: 'active', 
      headerName: 'Status', 
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          size="small" 
          color={params.value ? 'success' : 'default'}
          variant="outlined"
        />
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

  const handleCreate = () => navigate('/administration/structure-types/create');
  const handleEdit = (typeId: number) => navigate(`/administration/structure-types/${typeId}/edit`);
  
  const handleDelete = async (typeId: number) => {
    if (window.confirm('Delete this structure type?')) {
      try {
        await structureTypeService.delete(typeId);
        setSuccess('Structure type deleted successfully');
        loadData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete structure type');
      }
    }
  };

  const handleRefresh = () => {
    loadData();
    setSuccess('Data refreshed');
  };

  const handleClearFilters = () => {
    setSearchText('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Structure Types
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="medium" color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              Create Type
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage structure type categories and classifications
        </Typography>
      </Box>

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

              {searchText && (
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
                {filteredTypes.length} {t('common.results')}
                {structureTypes.length !== filteredTypes.length && (
                  <Typography component="span" variant="body2" color="text.disabled" sx={{ ml: 1 }}>
                    (filtered from {structureTypes.length})
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
          rows={filteredTypes}
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

export default StructureTypeList;
