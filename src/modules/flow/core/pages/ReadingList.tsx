/**
 * ReadingList Page
 * 
 * Displays a list of all flow readings with filtering, search, and CRUD operations.
 * Supports pagination, date range filtering, status filtering, and slot-based viewing.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 01-28-2026 - Added reading date and slot columns
 * @updated 01-28-2026 - Fixed readings undefined and Select controlled issues
 * @updated 01-28-2026 - Load validation statuses from server
 * @updated 01-28-2026 - Implemented i18n translation keys
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilterList as FilterListIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { FlowReadingService } from '../services/FlowReadingService';
import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { ValidationStatusService } from '@/modules/flow/common/services/ValidationStatusService';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime, formatPressure, formatTemperature, formatFlowRate } from '../utils/formattingUtils';
import { getLocalizedDesignation, formatTimeRange } from '@/modules/flow/common/dto/ReadingSlotDTO';

import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { ValidationStatusDTO } from '@/modules/flow/common/dto/ValidationStatusDTO';
import type { Page } from '@/types/pagination';

interface Filters {
  pipelineId: number | '';
  validationStatusId: number | '';
  startDate: string;
  endDate: string;
  search: string;
}

export const ReadingList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State - Initialize readings as empty array
  const [readings, setReadings] = useState<FlowReadingDTO[]>([]);
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatusDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<FlowReadingDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters - Initialize with controlled values (empty string instead of undefined)
  const [filters, setFilters] = useState<Filters>({
    pipelineId: '',
    validationStatusId: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  // Load pipelines and validation statuses for filter dropdowns
  useEffect(() => {
    loadPipelines();
    loadValidationStatuses();
  }, []);

  // Load readings when page or filters change
  useEffect(() => {
    loadReadings();
  }, [page, rowsPerPage, filters]);

  const loadPipelines = async () => {
    try {
      const data = await PipelineService.getAllNoPagination();
      setPipelines(data);
    } catch (error) {
      console.error(t('flow.readings.errors.loadPipelinesFailed'), error);
    }
  };

  const loadValidationStatuses = async () => {
    try {
      const data = await ValidationStatusService.getAllNoPagination();
      setValidationStatuses(data);
    } catch (error) {
      console.error(t('flow.readings.errors.loadStatusesFailed'), error);
    }
  };

  const loadReadings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pageable = {
        page,
        size: rowsPerPage,
        sort: 'readingDate,desc,recordedAt,desc', // Sort by date first, then submission time
      };

      let result: Page<FlowReadingDTO>;

      // Apply filters
      if (filters.pipelineId) {
        result = await FlowReadingService.getByPipeline(filters.pipelineId as number, pageable);
      } else if (filters.validationStatusId) {
        result = await FlowReadingService.getByValidationStatus(filters.validationStatusId as number, pageable);
      } else if (filters.search) {
        result = await FlowReadingService.globalSearch(filters.search, pageable);
      } else {
        result = await FlowReadingService.getAll(pageable);
      }

      setReadings(result.content || []);
      setTotalElements(result.totalElements || 0);
    } catch (error: any) {
      console.error(t('flow.readings.errors.loadFailed'), error);
      setError(error.message || t('flow.readings.errors.loadFailed'));
      setReadings([]); // Set to empty array on error
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilters({
      pipelineId: '',
      validationStatusId: '',
      search: '',
      startDate: '',
      endDate: '',
    });
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/flow/readings/new');
  };

  const handleEdit = (reading: FlowReadingDTO) => {
    navigate(`/flow/readings/${reading.id}/edit`);
  };

  const handleValidate = (reading: FlowReadingDTO) => {
    navigate(`/flow/readings/${reading.id}/validate`);
  };

  const handleDeleteClick = (reading: FlowReadingDTO) => {
    setSelectedReading(reading);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReading?.id) return;

    try {
      await FlowReadingService.delete(selectedReading.id);
      setDeleteDialogOpen(false);
      setSelectedReading(null);
      loadReadings(); // Reload list
    } catch (error: any) {
      alert(t('flow.readings.delete.error', { error: error.message }));
    }
  };

  const getStatusChip = (reading: FlowReadingDTO) => {
    const status = reading.validationStatus;
    if (!status) return <Chip label={t('flow.readings.notAvailable')} size="small" />;

    const statusConfig: Record<string, { color: 'success' | 'warning' | 'error' | 'default'; icon?: React.ReactElement }> = {
      VALIDATED: { color: 'success', icon: <CheckCircleIcon /> },
      PENDING_VALIDATION: { color: 'warning', icon: <WarningIcon /> },
      REJECTED: { color: 'error', icon: <ErrorIcon /> },
    };

    const config = statusConfig[status.code || ''] || { color: 'default' as const };

    return (
      <Chip
        label={status.designationEn}
        size="small"
        color={config.color}
        icon={config.icon}
      />
    );
  };

  const formatReadingDate = (dateStr: string) => {
    if (!dateStr) return t('flow.readings.notAvailable');
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const hasActiveFilters = filters.pipelineId || filters.validationStatusId || filters.startDate || filters.endDate || filters.search;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('flow.readings.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          {t('flow.readings.newReading')}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{t('flow.readings.filters.title')}</Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label={t('flow.readings.filters.search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={t('flow.readings.filters.searchPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Pipeline Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('flow.readings.filters.pipeline')}</InputLabel>
                <Select
                  value={filters.pipelineId}
                  label={t('flow.readings.filters.pipeline')}
                  onChange={(e) => handleFilterChange('pipelineId', e.target.value)}
                >
                  <MenuItem value="">{t('flow.readings.filters.allPipelines')}</MenuItem>
                  {pipelines.map((pipeline) => (
                    <MenuItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.code} - {pipeline.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter - Now dynamically loaded from server */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('flow.readings.filters.status')}</InputLabel>
                <Select
                  value={filters.validationStatusId}
                  label={t('flow.readings.filters.status')}
                  onChange={(e) => handleFilterChange('validationStatusId', e.target.value)}
                >
                  <MenuItem value="">{t('flow.readings.filters.allStatuses')}</MenuItem>
                  {validationStatuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.designationEn || status.designationFr}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label={t('flow.readings.filters.startDate')}
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label={t('flow.readings.filters.endDate')}
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Filter Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadReadings}
            >
              {t('flow.readings.filters.refresh')}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                {t('flow.readings.filters.clearFilters')}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Readings Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('flow.readings.table.id')}</TableCell>
                <TableCell>{t('flow.readings.table.pipeline')}</TableCell>
                <TableCell>{t('flow.readings.table.readingDate')}</TableCell>
                <TableCell>{t('flow.readings.table.slot')}</TableCell>
                <TableCell>{t('flow.readings.table.pressure')}</TableCell>
                <TableCell>{t('flow.readings.table.temperature')}</TableCell>
                <TableCell>{t('flow.readings.table.flowRate')}</TableCell>
                <TableCell>{t('flow.readings.table.status')}</TableCell>
                <TableCell>{t('flow.readings.table.recordedBy')}</TableCell>
                <TableCell align="right">{t('flow.readings.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !readings || readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {t('flow.readings.table.noData')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id} hover>
                    <TableCell>#{reading.id}</TableCell>
                    <TableCell>
                      {reading.pipeline?.code || t('flow.readings.notAvailable')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {formatReadingDate(reading.readingDate)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {reading.readingSlot ? (
                        <Tooltip title={formatTimeRange(reading.readingSlot)}>
                          <Chip
                            icon={<ScheduleIcon />}
                            label={getLocalizedDesignation(reading.readingSlot, 'en')}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        t('flow.readings.notAvailable')
                      )}
                    </TableCell>
                    <TableCell>{formatPressure(reading.pressure)}</TableCell>
                    <TableCell>{formatTemperature(reading.temperature)}</TableCell>
                    <TableCell>{formatFlowRate(reading.flowRate)}</TableCell>
                    <TableCell>{getStatusChip(reading)}</TableCell>
                    <TableCell>
                      {reading.recordedBy 
                        ? `${reading.recordedBy.firstNameLt} ${reading.recordedBy.lastNameLt}`
                        : t('flow.readings.notAvailable')
                      }
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {reading.validationStatus?.code === 'PENDING_VALIDATION' && (
                          <Tooltip title={t('flow.readings.actions.validate')}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleValidate(reading)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t('flow.readings.actions.edit')}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(reading)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('flow.readings.actions.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(reading)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('flow.readings.delete.title')}
        message={t('flow.readings.delete.message', { id: selectedReading?.id })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedReading(null);
        }}
      />
    </Box>
  );
};
