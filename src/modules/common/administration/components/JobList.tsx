/**
 * Job List Component (Nested)
 * Display and manage jobs within a structure
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as JobIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import jobService from '../services/JobService';
import { JobDTO } from '../dto/JobDTO';

interface JobListProps {
  structureId: number;
  onEdit: (job: JobDTO) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const JobList = ({ structureId, onEdit, onAdd, refreshTrigger }: JobListProps) => {
  const { t } = useTranslation();
  
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadJobs();
  }, [structureId, refreshTrigger]);

  const loadJobs = async () => {
    if (!structureId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await jobService.getByStructure(structureId);
      
      let jobsList: JobDTO[] = [];
      if (Array.isArray(data)) {
        jobsList = data;
      } else if (data && typeof data === 'object') {
        jobsList = (data as any).data || (data as any).content || [];
      }
      
      setJobs(jobsList);
      setError('');
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number) => {
    if (window.confirm('Delete this job?')) {
      try {
        await jobService.delete(jobId);
        setSuccess('Job deleted successfully');
        loadJobs();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.message || 'Failed to delete job');
      }
    }
  };

  if (!structureId) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Please save the structure first to add jobs
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <JobIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Jobs ({jobs.length})
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadJobs} color="primary">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ boxShadow: 1 }}
          >
            Add Job
          </Button>
        </Stack>
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

      {/* Jobs Table */}
      {loading ? (
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Loading jobs...
          </Typography>
        </Paper>
      ) : jobs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No jobs found. Click "Add Job" to create one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#2563eb', 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation (FR)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation (EN)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation (AR)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha('#2563eb', 0.04),
                    },
                  }}
                >
                  <TableCell>
                    <Chip label={job.code} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{job.designationFr}</TableCell>
                  <TableCell>{job.designationEn || '-'}</TableCell>
                  <TableCell dir="rtl">{job.designationAr || '-'}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(job)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { bgcolor: alpha('#2563eb', 0.1) }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(job.id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: alpha('#dc2626', 0.1) }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default JobList;
