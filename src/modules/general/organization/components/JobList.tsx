/**
 * Job List Component
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed type safety for delete operation
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
import JobEditDialog from './JobEditDialog';

const JobList = () => {
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
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDTO | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
    loadStructures();
  }, [paginationModel]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response: Page<JobDTO> = await JobService.getAll({
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      setJobs(response.content);
      setTotalElements(response.totalElements);
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
    setSelectedJob(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (job: JobDTO) => {
    setSelectedJob(job);
    setEditDialogOpen(true);
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

  const handleSave = async () => {
    await loadJobs();
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
    {
      field: 'structureId',
      headerName: 'Structure',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) => {
        const structure = structures.find(s => s.id === params.row.structureId);
        return structure?.designationFr || params.row.structureId;
      },
    },
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
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Jobs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage job positions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
        >
          {t('common.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={jobs}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalElements}
          paginationMode="server"
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

      <JobEditDialog
        open={editDialogOpen}
        job={selectedJob}
        structures={structures}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSave}
      />

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
