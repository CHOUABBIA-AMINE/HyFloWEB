/**
 * Coordinate List Component
 * Embedded in Pipeline Edit page for managing pipeline route coordinates
 * Pattern: Same as JobList in Structure module
 * 
 * @author CHOUABBIA Amine
 * @created 02-06-2026
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MyLocation as CoordinateIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CoordinateDTO } from '@/modules/general/localization/dto/CoordinateDTO';
import { CoordinateService } from '@/modules/general/localization/services';

interface CoordinateListProps {
  pipelineId?: number;  // Optional: filter by pipeline
  coordinateIds: number[];  // Selected coordinate IDs
  onEdit?: (coordinate: CoordinateDTO) => void;  // External edit handler
  onAdd?: () => void;  // External add handler
  onSelectionChange?: (coordinateIds: number[]) => void;  // Notify parent of selection changes
  refreshTrigger?: number;  // Trigger to refresh list
}

const CoordinateList = ({ 
  pipelineId, 
  coordinateIds, 
  onEdit, 
  onAdd, 
  onSelectionChange,
  refreshTrigger 
}: CoordinateListProps) => {
  const { t } = useTranslation();
  
  const [coordinates, setCoordinates] = useState<CoordinateDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coordinateToDelete, setCoordinateToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadCoordinates();
  }, [pipelineId, refreshTrigger]);

  const loadCoordinates = async () => {
    try {
      setLoading(true);
      let allCoordinates: CoordinateDTO[];
      
      if (pipelineId) {
        // Load coordinates for specific pipeline
        allCoordinates = await CoordinateService.getByInfrastructure(pipelineId);
      } else {
        // Load all coordinates
        allCoordinates = await CoordinateService.getAllNoPagination();
      }
      
      setCoordinates(allCoordinates);
      setError('');
    } catch (err: any) {
      console.error('Failed to load coordinates:', err);
      setError(err.message || t('common.errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (onAdd) {
      onAdd();
    }
  };

  const handleEdit = (coordinate: CoordinateDTO) => {
    if (onEdit) {
      onEdit(coordinate);
    }
  };

  const handleDeleteClick = (id: number) => {
    setCoordinateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!coordinateToDelete) return;

    try {
      setLoading(true);
      await CoordinateService.delete(coordinateToDelete);
      setDeleteDialogOpen(false);
      setCoordinateToDelete(null);
      
      // Remove from selection if it was selected
      if (coordinateIds.includes(coordinateToDelete) && onSelectionChange) {
        onSelectionChange(coordinateIds.filter(id => id !== coordinateToDelete));
      }
      
      await loadCoordinates();
    } catch (err: any) {
      console.error('Failed to delete coordinate:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.deleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Add sequence number to selected coordinates
  const getSequenceNumber = (coordinateId: number): number | null => {
    const index = coordinateIds.indexOf(coordinateId);
    return index >= 0 ? index + 1 : null;
  };

  const columns: GridColDef<CoordinateDTO>[] = [
    {
      field: 'sequence',
      headerName: 'Seq',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const seq = getSequenceNumber(params.row.id!);
        return seq ? (
          <Chip 
            label={seq} 
            color="primary" 
            size="small" 
            sx={{ fontWeight: 600 }}
          />
        ) : null;
      },
    },
    {
      field: 'latitude',
      headerName: t('coordinate.fields.latitude'),
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value?.toFixed(6)}
        </Typography>
      ),
    },
    {
      field: 'longitude',
      headerName: t('coordinate.fields.longitude'),
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value?.toFixed(6)}
        </Typography>
      ),
    },
    {
      field: 'altitude',
      headerName: t('coordinate.fields.altitude'),
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value.toFixed(2)} m` : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('common.fields.actions'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title={t('common.actions.edit')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => params.row.id && handleDeleteClick(params.row.id)}
            disabled={!params.row.id}
            title={t('common.actions.delete')}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Filter to show only selected coordinates if in pipeline context
  const displayCoordinates = pipelineId 
    ? coordinates.filter(coord => coord.id && coordinateIds.includes(coord.id))
    : coordinates;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CoordinateIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {t('pipeline.sections.pipelinePath')}
            </Typography>
          </Box>
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              {t('common.actions.create')}
            </Button>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('pipeline.coordinatesList.subtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={displayCoordinates}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 1,
            borderColor: 'divider',
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
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>{t('pipeline.coordinatesList.info.title')}:</strong> {t('pipeline.coordinatesList.info.description')}
        </Typography>
      </Alert>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('common.actions.delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('common.messages.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('common.actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinateList;