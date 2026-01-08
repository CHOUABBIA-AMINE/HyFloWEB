/**
 * Job List Component
 * Can be used standalone or embedded in Structure pages with structureId filter
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Added structureId filter support for embedding
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { JobDTO, StructureDTO } from '../dto';
import { JobService, StructureService } from '../services';
import { Page } from '@/types/pagination';

interface JobListProps {
  structureId?: number;  // Optional: filter by structure
  onEdit?: (job: JobDTO) => void;  // Optional: external edit handler
  onAdd?: () => void;  // Optional: external add handler
  refreshTrigger?: number;  // Optional: trigger to refresh list
}

const JobList = ({ structureId, onEdit, onAdd, refreshTrigger }: JobListProps) => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [structures, setStructures] = useState<StructureDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState(0);
  
  // Dialog states (only used if no external handlers provided)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
    if (!structureId) {
      loadStructures();
    }
  }, [paginationModel, structureId, refreshTrigger]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response: Page<JobDTO> = await JobService.getAll({
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      
      // Filter by structureId if provided
      let filteredJobs = response.content;
      if (structureId) {
        filteredJobs = response.content.filter(job => job.structureId === structureId);
      }
      
      setJobs(filteredJobs);
      setTotalElements(structureId ? filteredJobs.length : response.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadStructures = async () => {
    try {
      const response = await StructureService.getAllNoPagination();
      setStructures(response);
    } catch (err: any) {
      console.error('Failed to load structures:', err);
    }
  };

  const handleCreate = () => {
    if (onAdd) {
      onAdd();
    }
  };

  const handleEdit = (job: JobDTO) => {
    if (onEdit) {
      onEdit(job);
    }
  };

  const handleDeleteClick = (id: number) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setLoading(true);
      await JobService.delete(jobToDelete);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      await loadJobs();
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<JobDTO>[] = [
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'designationFr',
      headerName: 'Designation',
      flex: 2,
      minWidth: 200,
    },
    ...(!structureId ? [{
      field: 'structureId' as const,
      headerName: 'Structure',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params: any) => {
        const structure = structures.find(s => s.id === params.row.structureId);
        return structure?.designationFr || params.row.structureId;
      },
    }] : []),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => params.row.id && handleDeleteClick(params.row.id)}
            disabled={!params.row.id}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {structureId ? 'Jobs in this Structure' : 'Jobs'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {structureId ? 'Manage job positions for this structure' : 'Manage job positions'}
          </Typography>
        </Box>
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            size="medium"
          >
            {t('common.create')}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={jobs}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalElements}
          paginationMode={structureId ? 'client' : 'server'}
          disableRowSelectionOnClick
          sx={{
            border: 1,
            borderColor: 'divider',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobList;
