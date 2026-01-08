/**
 * HydrocarbonField List Page with DataGrid Pro
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-08-2026 - Removed deprecated field name properties
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  DataGridPro,
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid-pro';
import { HydrocarbonFieldService } from '../services';
import { HydrocarbonFieldDTO } from '../dto';
import { getLocalizedName } from '../utils/localizationUtils';
import { DeleteConfirmationDialog } from '@/shared/components';

const HydrocarbonFieldList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [fields, setFields] = useState<HydrocarbonFieldDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Get current language
  const currentLanguage = i18n.language || 'en';

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await HydrocarbonFieldService.getAllNoPagination();
      setFields(data || []);
    } catch (err: any) {
      console.error('Failed to load hydrocarbon fields:', err);
      setError(err.message || 'Failed to load hydrocarbon fields');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/network/core/hydrocarbon-fields/new');
  };

  const handleEdit = (id: number) => {
    navigate(`/network/core/hydrocarbon-fields/${id}/edit`);
  };

  const handleView = (id: number) => {
    navigate(`/network/core/hydrocarbon-fields/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setFieldToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fieldToDelete) return;

    try {
      setDeleting(true);
      await HydrocarbonFieldService.delete(fieldToDelete);
      await loadFields();
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete hydrocarbon field:', err);
      setError(err.message || 'Failed to delete hydrocarbon field');
    } finally {
      setDeleting(false);
    }
  };

  // Extract unique values for filter options
  const { statusOptions, typeOptions, vendorOptions } = useMemo(() => {
    const statuses = new Set<string>();
    const types = new Set<string>();
    const vendors = new Set<string>();

    fields.forEach(field => {
      // Status
      if (field.operationalStatus) {
        const statusName = getLocalizedName(field.operationalStatus, currentLanguage);
        statuses.add(statusName);
      }

      // Type
      if (field.hydrocarbonFieldType) {
        const typeName = getLocalizedName(field.hydrocarbonFieldType, currentLanguage);
        types.add(typeName);
      }

      // Vendor
      const vendorName = field.vendor?.name;
      if (vendorName) {
        vendors.add(vendorName);
      }
    });

    return {
      statusOptions: Array.from(statuses).sort(),
      typeOptions: Array.from(types).sort(),
      vendorOptions: Array.from(vendors).sort(),
    };
  }, [fields, currentLanguage]);

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          variant="contained"
        >
          {t('common.add')}
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef<HydrocarbonFieldDTO>[] = [
    {
      field: 'code',
      headerName: 'Code',
      width: 120,
      filterable: true,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      filterable: true,
      sortable: true,
    },
    {
      field: 'hydrocarbonFieldType',
      headerName: 'Type',
      width: 150,
      filterable: true,
      sortable: true,
      type: 'singleSelect',
      valueOptions: typeOptions,
      valueGetter: (params: any, row: HydrocarbonFieldDTO) => {
        return field.hydrocarbonFieldType ? getLocalizedName(row.hydrocarbonFieldType, currentLanguage) : 'N/A';
      },
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      filterable: false,
      sortable: false,
      valueGetter: (params: any, row: HydrocarbonFieldDTO) => {
        if (row.location?.placeName) {
          return row.location.placeName;
        }
        if (row.location?.latitude && row.location?.longitude) {
          return `${row.location.latitude.toFixed(4)}, ${row.location.longitude.toFixed(4)}`;
        }
        return '-';
      },
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      width: 180,
      filterable: true,
      sortable: true,
      type: 'singleSelect',
      valueOptions: vendorOptions,
      valueGetter: (params: any, row: HydrocarbonFieldDTO) => {
        return row.vendor?.name || '-';
      },
    },
    {
      field: 'operationalStatus',
      headerName: 'Status',
      width: 150,
      filterable: true,
      sortable: true,
      type: 'singleSelect',
      valueOptions: statusOptions,
      valueGetter: (params: any, row: HydrocarbonFieldDTO) => {
        return row.operationalStatus ? getLocalizedName(row.operationalStatus, currentLanguage) : 'Unknown';
      },
      renderCell: (params) => {
        const status = params.row.operationalStatus;
        if (!status) return null;
        
        return (
          <Chip
            label={getLocalizedName(status, currentLanguage)}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'installationDate',
      headerName: 'Installation Date',
      width: 150,
      type: 'date',
      valueGetter: (params: any, row: HydrocarbonFieldDTO) => {
        return row.installationDate ? new Date(row.installationDate) : null;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams<HydrocarbonFieldDTO>) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.row.id!)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row.id!)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row.id!)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Hydrocarbon Fields
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage hydrocarbon field infrastructure
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGridPro
          rows={fields}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
          onRowClick={(params) => handleView(params.row.id!)}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Hydrocarbon Field"
        content="Are you sure you want to delete this hydrocarbon field? This action cannot be undone."
        loading={deleting}
      />
    </Box>
  );
};

export default HydrocarbonFieldList;