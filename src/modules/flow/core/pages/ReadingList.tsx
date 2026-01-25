/**
 * ReadingList Page
 * 
 * Displays a list of all flow readings with filtering, search, and CRUD operations.
 * Supports pagination, date range filtering, and status filtering.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { FlowReadingService } from '../services/FlowReadingService';
import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime, formatPressure, formatTemperature, formatFlowRate } from '../utils/formattingUtils';

import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { Page } from '@/types/pagination';

interface Filters {
  pipelineId?: number;
  validationStatusId?: number;
  startDate?: Date | null;
  endDate?: Date | null;
  search: string;
}

export const ReadingList: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [readings, setReadings] = useState<FlowReadingDTO[]>([]);
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<FlowReadingDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<Filters>({
    search: '',
    startDate: null,
    endDate: null,
  });

  // Load pipelines for filter dropdown
  useEffect(() => {
    loadPipelines();
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
      console.error('Error loading pipelines:', error);
    }
  };

  const loadReadings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pageable = {
        page,
        size: rowsPerPage,
        sort: 'recordedAt,desc',
      };

      let result: Page<FlowReadingDTO>;

      // Apply filters
      if (filters.pipelineId) {
        result = await FlowReadingService.getByPipeline(filters.pipelineId, pageable);
      } else if (filters.validationStatusId) {
        result = await FlowReadingService.getByValidationStatus(filters.validationStatusId, pageable);
      } else if (filters.search) {
        result = await FlowReadingService.globalSearch(filters.search, pageable);
      } else {
        result = await FlowReadingService.getAll(pageable);
      }

      setReadings(result.content);
      setTotalElements(result.totalElements);
    } catch (error: any) {
      console.error('Error loading readings:', error);
      setError(error.message || 'Failed to load readings');
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
      search: '',
      startDate: null,
      endDate: null,
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
      alert(`Delete failed: ${error.message}`);
    }
  };

  const getStatusChip = (reading: FlowReadingDTO) => {
    const status = reading.validationStatus;
    if (!status) return <Chip label="Unknown" size="small" />;

    const statusConfig: Record<string, { color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
      VALIDATED: { color: 'success', icon: <CheckCircleIcon /> },
      PENDING_VALIDATION: { color: 'warning', icon: <WarningIcon /> },
      REJECTED: { color: 'error', icon: <ErrorIcon /> },
    };

    const config = statusConfig[status.code || ''] || { color: 'default' as const, icon: null };

    return (
      <Chip
        label={status.designationEn}
        size="small"
        color={config.color}
        icon={config.icon}
      />
    );
  };

  const hasActiveFilters = filters.pipelineId || filters.validationStatusId || filters.startDate || filters.endDate || filters.search;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Flow Readings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          New Reading
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
            <Typography variant="h6">Filters</Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search readings..."
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
                <InputLabel>Pipeline</InputLabel>
                <Select
                  value={filters.pipelineId || ''}
                  label="Pipeline"
                  onChange={(e) => handleFilterChange('pipelineId', e.target.value || undefined)}
                >
                  <MenuItem value="">All Pipelines</MenuItem>
                  {pipelines.map((pipeline) => (
                    <MenuItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.code} - {pipeline.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.validationStatusId || ''}
                  label="Status"
                  onChange={(e) => handleFilterChange('validationStatusId', e.target.value || undefined)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={1}>Validated</MenuItem>
                  <MenuItem value={2}>Pending</MenuItem>
                  <MenuItem value={3}>Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
          </Grid>

          {/* Filter Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadReadings}
            >
              Refresh
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Clear Filters
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
                <TableCell>ID</TableCell>
                <TableCell>Pipeline</TableCell>
                <TableCell>Recorded At</TableCell>
                <TableCell>Pressure</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Flow Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recorded By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No readings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id} hover>
                    <TableCell>#{reading.id}</TableCell>
                    <TableCell>
                      {reading.pipeline?.code || 'N/A'}
                    </TableCell>
                    <TableCell>{formatDateTime(reading.recordedAt)}</TableCell>
                    <TableCell>{formatPressure(reading.pressure)}</TableCell>
                    <TableCell>{formatTemperature(reading.temperature)}</TableCell>
                    <TableCell>{formatFlowRate(reading.flowRate)}</TableCell>
                    <TableCell>{getStatusChip(reading)}</TableCell>
                    <TableCell>
                      {reading.recordedBy 
                        ? `${reading.recordedBy.firstNameLt} ${reading.recordedBy.lastNameLt}`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {reading.validationStatus?.code === 'PENDING_VALIDATION' && (
                          <Tooltip title="Validate">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleValidate(reading)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(reading)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
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
        title="Delete Reading"
        message={`Are you sure you want to delete reading #${selectedReading?.id}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedReading(null);
        }}
      />
    </Box>
  );
};
