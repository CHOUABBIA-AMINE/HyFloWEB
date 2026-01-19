/**
 * Job List Component
 * Can be used standalone or embedded in Structure pages with structureId filter
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Aligned translation keys with translation files
 * @updated 01-19-2026 - Fixed translation keys to use proper namespaces without fallback text
 * @updated 01-09-2026 - Matched DataGrid column header styling with StructureList
 * @updated 01-09-2026 - Aligned header styling with StructureList
 * @updated 01-08-2026 - Added multilanguage support for designations
 * @updated 01-08-2026 - Added structureId filter support for embedding
 * @created 01-06-2026
 */

import { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as JobIcon,
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
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
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

  /**
   * Get localized designation based on current language
   * Falls back to French -> English -> Arabic if current language not available
   */
  const getLocalizedDesignation = (item: JobDTO | StructureDTO): string => {
    if (!item) return '';
    
    if (currentLanguage === 'ar') {
      return item.designationAr || item.designationFr || item.designationEn || '-';
    }
    if (currentLanguage === 'en') {
      return item.designationEn || item.designationFr || item.designationAr || '-';
    }
    // Default to French
    return item.designationFr || item.designationEn || item.designationAr || '-';
  };

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
      setError(err.message || t('common.errors.loadingFailed'));
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
      setError(err.response?.data?.message || err.message || t('message.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<JobDTO>[] = [
    {
      field: 'code',
      headerName: t('list.code'),
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'designation',
      headerName: t('list.designation'),
      flex: 2,
      minWidth: 200,
      valueGetter: (params: any) => getLocalizedDesignation(params.row),
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    ...(!structureId ? [{
      field: 'structureId' as const,
      headerName: t('list.structure'),
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params: any) => {
        const structure = structures.find(s => s.id === params.row.structureId);
        return structure ? getLocalizedDesignation(structure) : params.row.structureId;
      },
      renderCell: (params: any) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    }] : []),
    {
      field: 'actions',
      headerName: t('list.actions'),
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
            title={t('action.edit')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => params.row.id && handleDeleteClick(params.row.id)}
            disabled={!params.row.id}
            title={t('action.delete')}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header - Aligned with StructureList styling */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <JobIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {structureId 
                ? t('job.titleInStructure') 
                : t('job.title')}
            </Typography>
          </Box>
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              {t('action.create')}
            </Button>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {structureId 
            ? t('job.subtitleInStructure') 
            : t('job.subtitle')}
        </Typography>
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('action.delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('action.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('action.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('action.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobList;