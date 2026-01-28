/**
 * ThresholdList Page - Flow Threshold Management
 * 
 * Displays and manages flow thresholds for pipelines.
 * Thresholds define safe operating ranges for pressure, temperature, and flow rates.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
 * @updated 01-28-2026 - Fixed API calls to match backend responses
 */

import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  FilterList as FilterListIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

import { FlowThresholdService } from '../services/FlowThresholdService';
import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { FlowThresholdConstraints } from '../dto/FlowThresholdDTO';

import type { FlowThresholdDTO } from '../dto/FlowThresholdDTO';
import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { Page } from '@/types/pagination';

interface Filters {
  pipelineId?: number;
  activeOnly: boolean;
  search: string;
}

export const ThresholdList: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [thresholds, setThresholds] = useState<FlowThresholdDTO[]>([]);
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<FlowThresholdDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<Filters>({
    search: '',
    activeOnly: false,
  });

  // Load pipelines for filter dropdown
  useEffect(() => {
    loadPipelines();
  }, []);

  // Load thresholds when page or filters change
  useEffect(() => {
    loadThresholds();
  }, [page, rowsPerPage, filters]);

  const loadPipelines = async () => {
    try {
      const data = await PipelineService.getAllNoPagination();
      setPipelines(data);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    }
  };

  const loadThresholds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pageable = {
        page,
        size: rowsPerPage,
        sort: 'id,asc',
      };

      let thresholdsData: FlowThresholdDTO[] = [];
      let total = 0;

      // Apply filters - getByPipeline returns array, others return Page
      if (filters.pipelineId) {
        // Backend returns array for pipeline filter (not paginated)
        const allPipelineThresholds = await FlowThresholdService.getByPipeline(filters.pipelineId);
        
        // Apply active filter if needed
        const filtered = filters.activeOnly 
          ? allPipelineThresholds.filter(t => t.active)
          : allPipelineThresholds;
        
        // Manual pagination for array results
        total = filtered.length;
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        thresholdsData = filtered.slice(startIndex, endIndex);
      } else {
        // Backend returns Page for these endpoints
        let result: Page<FlowThresholdDTO>;
        
        if (filters.activeOnly) {
          result = await FlowThresholdService.getActive(pageable);
        } else if (filters.search) {
          result = await FlowThresholdService.globalSearch(filters.search, pageable);
        } else {
          result = await FlowThresholdService.getAll(pageable);
        }
        
        thresholdsData = result.content;
        total = result.totalElements;
      }

      setThresholds(thresholdsData);
      setTotalElements(total);
    } catch (error: any) {
      console.error('Error loading thresholds:', error);
      setError(error.message || 'Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      activeOnly: false,
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
    navigate('/flow/thresholds/new');
  };

  const handleEdit = (threshold: FlowThresholdDTO) => {
    navigate(`/flow/thresholds/${threshold.id}/edit`);
  };

  const handleDeleteClick = (threshold: FlowThresholdDTO) => {
    setSelectedThreshold(threshold);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedThreshold?.id) return;

    try {
      await FlowThresholdService.delete(selectedThreshold.id);
      setDeleteDialogOpen(false);
      setSelectedThreshold(null);
      setSuccess('Threshold deleted successfully');
      loadThresholds();
    } catch (error: any) {
      setError(`Delete failed: ${error.message}`);
    }
  };

  const handleToggleActive = async (threshold: FlowThresholdDTO) => {
    if (!threshold.id) return;

    try {
      // Note: Backend doesn't have activate/deactivate endpoints
      // We need to update the threshold with toggled active status
      const updatedThreshold = { ...threshold, active: !threshold.active };
      await FlowThresholdService.update(threshold.id, updatedThreshold);
      
      setSuccess(threshold.active ? 'Threshold deactivated' : 'Threshold activated');
      loadThresholds();
    } catch (error: any) {
      setError(`Failed to toggle active status: ${error.message}`);
    }
  };

  const getStatusChip = (active: boolean) => {
    return active ? (
      <Chip
        label="Active"
        size="small"
        color="success"
        icon={<CheckCircleIcon />}
      />
    ) : (
      <Chip
        label="Inactive"
        size="small"
        color="default"
        icon={<CancelIcon />}
      />
    );
  };

  const formatRange = (min: number, max: number, unit: string) => {
    return `${min} - ${max} ${unit}`;
  };

  const hasActiveFilters = filters.pipelineId || filters.search || filters.activeOnly;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Flow Thresholds</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage safe operating ranges for pipeline monitoring
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          New Threshold
        </Button>
      </Box>

      {/* Success/Error Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search thresholds..."
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
            <Grid item xs={12} md={4}>
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

            {/* Active Only Toggle */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.activeOnly}
                      onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                    />
                  }
                  label="Active Only"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Filter Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadThresholds}
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

      {/* Thresholds Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Pipeline</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SpeedIcon fontSize="small" />
                    Pressure Range
                  </Box>
                </TableCell>
                <TableCell>Temperature Range</TableCell>
                <TableCell>Flow Rate Range</TableCell>
                <TableCell>Tolerance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : thresholds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No thresholds found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                thresholds.map((threshold) => (
                  <TableRow key={threshold.id} hover>
                    <TableCell>#{threshold.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {threshold.pipeline?.code || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {threshold.pipeline?.name || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Min: ${threshold.pressureMin}, Max: ${threshold.pressureMax}`}>
                        <Chip
                          label={formatRange(
                            threshold.pressureMin,
                            threshold.pressureMax,
                            FlowThresholdConstraints.pressure.unit
                          )}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Min: ${threshold.temperatureMin}, Max: ${threshold.temperatureMax}`}>
                        <Chip
                          label={formatRange(
                            threshold.temperatureMin,
                            threshold.temperatureMax,
                            FlowThresholdConstraints.temperature.unit
                          )}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Min: ${threshold.flowRateMin}, Max: ${threshold.flowRateMax}`}>
                        <Chip
                          label={formatRange(
                            threshold.flowRateMin,
                            threshold.flowRateMax,
                            FlowThresholdConstraints.flowRate.unit
                          )}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`±${threshold.alertTolerance}%`}
                        size="small"
                        icon={<WarningIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={threshold.active ? 'Click to deactivate' : 'Click to activate'}>
                        <Box
                          onClick={() => handleToggleActive(threshold)}
                          sx={{ cursor: 'pointer', display: 'inline-block' }}
                        >
                          {getStatusChip(threshold.active)}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(threshold)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(threshold)}
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
        title="Delete Threshold"
        message={`Are you sure you want to delete threshold #${selectedThreshold?.id} for pipeline ${selectedThreshold?.pipeline?.code}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedThreshold(null);
        }}
      />
    </Box>
  );
};
