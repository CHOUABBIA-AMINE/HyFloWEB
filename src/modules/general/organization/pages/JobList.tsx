/**
 * Job List Page
 * Displays paginated list of jobs with search and CRUD operations
 * 
 * @author CHOUABBIA Amine
 * @created 01-07-2026
 * @updated 01-07-2026 - Created from component, fixed service imports
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Paper,
  Stack,
  Alert,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { JobService } from '../services';
import { JobDTO } from '../dto';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';

const JobList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  const lang = useMemo(() => (i18n.language || 'fr').split('-')[0], [i18n.language]);

  const getDesignation = (job: JobDTO): string => {
    if (lang === 'ar') return job.designationAr || job.designationFr || job.designationEn || '';
    if (lang === 'en') return job.designationEn || job.designationFr || job.designationAr || '';
    return job.designationFr || job.designationEn || job.designationAr || '';
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobService.getAll({ page, size: rowsPerPage });
      setJobs(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(t('common.error', 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchJobs();
      return;
    }
    try {
      setLoading(true);
      const response = await JobService.globalSearch(searchQuery, { page, size: rowsPerPage });
      setJobs(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError(t('common.error', 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    try {
      await JobService.delete(jobToDelete);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(t('common.error', 'Error'));
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              {t('job.title', 'Jobs')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/administration/jobs/create')}
            >
              {t('job.create', 'Create Job')}
            </Button>
          </Stack>

          {/* Search Bar */}
          <Stack direction="row" spacing={2} mb={3}>
            <TextField
              fullWidth
              placeholder={t('job.searchPlaceholder', 'Search...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            <Button variant="outlined" onClick={handleSearch} sx={{ minWidth: '120px' }}>
              {t('common.search', 'Search')}
            </Button>
            <Tooltip title={t('common.refresh', 'Refresh')}>
              <IconButton onClick={fetchJobs}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>{t('job.code', 'Code')}</TableCell>
                  <TableCell>{t('job.designation', 'Designation')}</TableCell>
                  <TableCell>{t('job.structure', 'Structure')}</TableCell>
                  <TableCell align="right">{t('common.actions', 'Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {t('common.loading', 'Loading...')}
                    </TableCell>
                  </TableRow>
                ) : jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {t('common.noData', 'No data')}
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>
                        <Chip label={job.code} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{getDesignation(job)}</TableCell>
                      <TableCell>
                        {job.structure ? (
                          lang === 'ar' ? job.structure.designationAr || job.structure.designationFr :
                          lang === 'en' ? job.structure.designationEn || job.structure.designationFr :
                          job.structure.designationFr
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.edit', 'Edit')}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/administration/jobs/${job.id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete', 'Delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setJobToDelete(job.id!);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('job.delete', 'Delete Job')}
        message={t('job.deleteConfirm', 'Are you sure you want to delete this job?')}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setJobToDelete(null);
        }}
      />
    </Box>
  );
};

export default JobList;
