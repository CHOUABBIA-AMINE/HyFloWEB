/**
 * ThresholdList Page - Flow Threshold Management
 * 
 * Displays and manages flow thresholds for pipelines.
 * Thresholds define safe operating ranges for pressure, temperature, flow rates, and contained volume.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
 * @updated 01-31-2026 - Added i18n translations
 * @updated 01-28-2026 - Added containedVolume column
 * @updated 02-13-2026 - UI: Containerized header and updated button to IconButton style
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
  Switch,
  FormControlLabel,
  Paper,
  Stack,
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
  const { t } = useTranslation();
  
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
      setError(error.message || t('flow.threshold.alerts.failedToLoad'));
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
      setSuccess(t('flow.threshold.deleteSuccess'));
      loadThresholds();
    } catch (error: any) {
      setError(t('flow.threshold.alerts.failedToDelete') + ' ' + error.message);
    }
  };

  const handleToggleActive = async (threshold: FlowThresholdDTO) => {
    if (!threshold.id) return;

    try {
      const updatedThreshold = { ...threshold, active: !threshold.active };
      await FlowThresholdService.update(threshold.id, updatedThreshold);
      
      setSuccess(threshold.active ? t('flow.threshold.deactivated') : t('flow.threshold.activated'));
      loadThresholds();
    } catch (error: any) {
      setError(t('flow.threshold.alerts.failedToToggle') + ' ' + error.message);
    }
  };

  const getStatusChip = (active: boolean) => {
    return active ? (
      <Chip
        label={t('flow.threshold.fields.active')}
        size="small"
        color="success"
        icon={<CheckCircleIcon />}
      />
    ) : (
      <Chip
        label={t('flow.threshold.fields.inactive')}
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
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {t('flow.threshold.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('flow.threshold.subtitle')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('action.refresh', 'Refresh')}>
                <IconButton onClick={loadThresholds} size="medium" color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('flow.threshold.new')}>
                <IconButton onClick={handleCreate} size="medium" color="primary">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

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
            <Typography variant="h6">{t('flow.threshold.filters.title')}</Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('flow.threshold.filters.search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={t('flow.threshold.filters.searchPlaceholder')}
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
                <InputLabel>{t('flow.threshold.filters.pipeline')}</InputLabel>
                <Select
                  value={filters.pipelineId || ''}
                  label={t('flow.threshold.filters.pipeline')}
                  onChange={(e) => handleFilterChange('pipelineId', e.target.value || undefined)}
                >
                  <MenuItem value="">{t('flow.threshold.filters.allPipelines')}</MenuItem>
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
                  label={t('flow.threshold.filters.activeOnly')}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Filter Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                {t('flow.threshold.filters.clear')}
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
                <TableCell>{t('flow.threshold.fields.id')}</TableCell>
                <TableCell>{t('flow.threshold.fields.pipeline')}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SpeedIcon fontSize="small" />
                    {t('flow.threshold.fields.pressure')}
                  </Box>
                </TableCell>
                <TableCell>{t('flow.threshold.fields.temperature')}</TableCell>
                <TableCell>{t('flow.threshold.fields.flowRate')}</TableCell>
                <TableCell>{t('flow.threshold.fields.containedVolume')}</TableCell>
                <TableCell>{t('flow.threshold.fields.tolerance')}</TableCell>
                <TableCell>{t('flow.threshold.fields.status')}</TableCell>
                <TableCell align="right">{t('flow.threshold.fields.actions')}</TableCell>
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
                      {t('flow.threshold.noThresholds')}
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
                      <Tooltip title={t('flow.threshold.tooltips.minMax', { min: threshold.pressureMin, max: threshold.pressureMax })}>
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
                      <Tooltip title={t('flow.threshold.tooltips.minMax', { min: threshold.temperatureMin, max: threshold.temperatureMax })}>
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
                      <Tooltip title={t('flow.threshold.tooltips.minMax', { min: threshold.flowRateMin, max: threshold.flowRateMax })}>
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
                      <Tooltip title={t('flow.threshold.tooltips.minMax', { min: threshold.containedVolumeMin, max: threshold.containedVolumeMax })}>
                        <Chip
                          label={formatRange(
                            threshold.containedVolumeMin,
                            threshold.containedVolumeMax,
                            FlowThresholdConstraints.containedVolume.unit
                          )}
                          size="small"
                          variant="outlined"
                          color="info"
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
                      <Tooltip title={threshold.active ? t('flow.threshold.tooltips.clickToDeactivate') : t('flow.threshold.tooltips.clickToActivate')}>
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
                        <Tooltip title={t('flow.threshold.tooltips.edit')}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(threshold)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('flow.threshold.tooltips.delete')}>
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
        title={t('flow.threshold.delete')}
        message={t('flow.threshold.deleteConfirm', { id: selectedThreshold?.id, code: selectedThreshold?.pipeline?.code })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedThreshold(null);
        }}
      />
    </Box>
  );
};
