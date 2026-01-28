/**
 * ThresholdList Page
 * 
 * Displays a list of all flow thresholds with filtering, search, and CRUD operations.
 * Supports pagination, pipeline filtering, active/inactive status toggle.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
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
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';

import { FlowThresholdService } from '../services/FlowThresholdService';
import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

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
        sort: 'pipeline.code,asc,pressureMin,asc',
      };

      let result: Page<FlowThresholdDTO>;

      // Apply filters
      if (filters.pipelineId) {
        result = await FlowThresholdService.getByPipeline(filters.pipelineId, pageable);
      } else if (filters.search) {
        result = await FlowThresholdService.globalSearch(filters.search, pageable);
      } else {
        result = await FlowThresholdService.getAll(pageable);
      }

      // Filter by active status if needed
      let filteredContent = result.content;
      if (filters.activeOnly) {
        filteredContent = filteredContent.filter(t => t.active);
      }

      setThresholds(filteredContent);
      setTotalElements(filters.activeOnly ? filteredContent.length : result.totalElements);
    } catch (error: any) {
      console.error('Error loading thresholds:', error);
      setError(error.message || 'Failed to load thresholds');
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
      loadThresholds(); // Reload list
    } catch (error: any) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleToggleActive = async (threshold: FlowThresholdDTO) => {
    try {
      if (threshold.active) {
        await FlowThresholdService.deactivate(threshold.id!);
      } else {
        await FlowThresholdService.activate(threshold.id!);
      }
      loadThresholds(); // Reload list
    } catch (error: any) {
      setError(`Failed to ${threshold.active ? 'deactivate' : 'activate'} threshold: ${error.message}`);
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

  const ThresholdRangeCell: React.FC<{
    min: number;
    max: number;
    unit: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ min, max, unit, icon, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography variant="body2">
        {min} - {max} {unit}
      </Typography>
    </Box>
  );

  const hasActiveFilters = filters.pipelineId || filters.activeOnly || filters.search;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Flow Thresholds</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure acceptable ranges for pipeline measurements
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

          <Grid container spacing={2} alignItems="center">
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
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.activeOnly}
                    onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Active Only"
              />
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
                <TableCell>Product</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SpeedIcon fontSize="small" />
                    Pressure Range
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThermostatIcon fontSize="small" />
                    Temperature Range
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WaterDropIcon fontSize="small" />
                    Flow Rate Range
                  </Box>
                </TableCell>
                <TableCell>Tolerance</TableCell>
                <TableCell>Status</TableCell>
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
              ) : thresholds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
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
                      <Typography variant="body2" fontWeight="medium">
                        {threshold.pipeline?.code || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {threshold.pipeline?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {threshold.product?.designationEn || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <ThresholdRangeCell
                        min={threshold.pressureMin}
                        max={threshold.pressureMax}
                        unit="bar"
                        icon={<SpeedIcon fontSize="small" />}
                        color="#1976d2"
                      />
                    </TableCell>
                    <TableCell>
                      <ThresholdRangeCell
                        min={threshold.temperatureMin}
                        max={threshold.temperatureMax}
                        unit="°C"
                        icon={<ThermostatIcon fontSize="small" />}
                        color="#d32f2f"
                      />
                    </TableCell>
                    <TableCell>
                      <ThresholdRangeCell
                        min={threshold.flowRateMin}
                        max={threshold.flowRateMax}
                        unit="m³/h"
                        icon={<WaterDropIcon fontSize="small" />}
                        color="#0288d1"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${threshold.alertTolerance}%`}
                        size="small"
                        icon={<WarningIcon />}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusChip(threshold.active)}
                        <Switch
                          checked={threshold.active}
                          onChange={() => handleToggleActive(threshold)}
                          size="small"
                          color="success"
                        />
                      </Box>
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
        message={`Are you sure you want to delete threshold #${selectedThreshold?.id} for ${selectedThreshold?.pipeline?.code}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedThreshold(null);
        }}
      />
    </Box>
  );
};
