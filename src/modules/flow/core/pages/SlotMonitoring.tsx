/**
 * Slot Monitoring Page
 * 
 * Slot-centric operational dashboard for flow monitoring.
 * Displays pipeline coverage for a specific date + slot + structure.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @module flow/core/pages
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import FlowMonitoringService, {
  SlotCoverageResponseDTO,
  PipelineCoverageDTO,
} from '../services/FlowMonitoringService';

/**
 * SlotMonitoring Component
 * 
 * Main operational console for slot-based monitoring workflow.
 */
const SlotMonitoring: React.FC = () => {
  const { t } = useTranslation();

  // ==================== STATE ====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<SlotCoverageResponseDTO | null>(null);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [selectedStructureId, setSelectedStructureId] = useState<number>(1);

  // Available slots (1-12 for 24h / 2h slots)
  const availableSlots = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: `Slot ${i + 1}`,
  }));

  // Mock structures (replace with API call)
  const availableStructures = [
    { id: 1, name: 'Structure A' },
    { id: 2, name: 'Structure B' },
    { id: 3, name: 'Structure C' },
  ];

  // ==================== DATA LOADING ====================

  /**
   * Load slot coverage from backend
   */
  const loadSlotCoverage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await FlowMonitoringService.getSlotCoverage({
        readingDate: selectedDate,
        slotId: selectedSlotId,
        structureId: selectedStructureId,
      });

      setCoverage(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load slot coverage');
      console.error('Error loading slot coverage:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSlotId, selectedStructureId]);

  // Auto-load on mount and filter changes
  useEffect(() => {
    loadSlotCoverage();
  }, [loadSlotCoverage]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle pipeline edit action
   */
  const handleEdit = (pipeline: PipelineCoverageDTO) => {
    // TODO: Navigate to reading edit page
    console.log('Edit reading for pipeline:', pipeline.pipelineId);
  };

  /**
   * Handle pipeline submit action
   */
  const handleSubmit = async (pipeline: PipelineCoverageDTO) => {
    // TODO: Implement reading submit
    console.log('Submit reading for pipeline:', pipeline.pipelineId);
  };

  /**
   * Handle pipeline approve action
   */
  const handleApprove = async (pipeline: PipelineCoverageDTO) => {
    if (!pipeline.readingId) return;

    try {
      await FlowMonitoringService.validateReading({
        readingId: pipeline.readingId,
        action: 'APPROVE',
        employeeId: 1, // TODO: Get from auth context
      });

      // Reload coverage
      loadSlotCoverage();
    } catch (err: any) {
      setError(err.message || 'Failed to approve reading');
    }
  };

  /**
   * Handle pipeline reject action
   */
  const handleReject = async (pipeline: PipelineCoverageDTO) => {
    if (!pipeline.readingId) return;

    // TODO: Show dialog to capture rejection comments
    const comments = prompt('Enter rejection reason:');
    if (!comments) return;

    try {
      await FlowMonitoringService.validateReading({
        readingId: pipeline.readingId,
        action: 'REJECT',
        employeeId: 1, // TODO: Get from auth context
        comments,
      });

      // Reload coverage
      loadSlotCoverage();
    } catch (err: any) {
      setError(err.message || 'Failed to reject reading');
    }
  };

  // ==================== RENDERING ====================

  /**
   * Render slot header with date + slot info
   */
  const renderSlotHeader = () => {
    if (!coverage) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h6" color="primary">
                {coverage.structure.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {coverage.structure.code}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="h6">
                {new Date(coverage.readingDate).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Slot
              </Typography>
              <Typography variant="h6">
                {coverage.slot.slotName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {FlowMonitoringService.formatSlotTimeRange(
                  coverage.slot.startTime,
                  coverage.slot.endTime
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Chip
                  label={FlowMonitoringService.formatCompletionPercentage(
                    coverage.completionPercentage
                  )}
                  color={coverage.isSlotComplete ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={coverage.completionPercentage}
                sx={{ mt: 1 }}
                color={coverage.isSlotComplete ? 'success' : 'warning'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render coverage summary cards
   */
  const renderSummaryCards = () => {
    if (!coverage) return null;

    const summaryItems = [
      { label: 'Total Pipelines', value: coverage.totalPipelines, color: 'primary' },
      { label: 'Recorded', value: coverage.recordedCount, color: 'info' },
      { label: 'Submitted', value: coverage.submittedCount, color: 'warning' },
      { label: 'Approved', value: coverage.approvedCount, color: 'success' },
      { label: 'Rejected', value: coverage.rejectedCount, color: 'error' },
      { label: 'Missing', value: coverage.missingCount, color: 'default' },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryItems.map((item) => (
          <Grid item xs={6} md={2} key={item.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="h4" color={`${item.color}.main`}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  /**
   * Render pipeline coverage table
   */
  const renderPipelineTable = () => {
    if (!coverage || coverage.pipelines.length === 0) {
      return (
        <Alert severity="info">
          No pipelines found for this structure.
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pipeline</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Recorded By</TableCell>
              <TableCell>Recorded At</TableCell>
              <TableCell>Validated By</TableCell>
              <TableCell>Validated At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coverage.pipelines.map((pipeline) => (
              <TableRow
                key={pipeline.pipelineId}
                sx={{
                  backgroundColor: pipeline.isOverdue ? 'error.light' : 'inherit',
                  opacity: pipeline.isOverdue ? 0.7 : 1,
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {pipeline.pipelineCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pipeline.pipelineName}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={pipeline.workflowStatusDisplay}
                    color={FlowMonitoringService.getStatusColor(pipeline.workflowStatus)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {pipeline.recordedByName || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {pipeline.recordedAt
                      ? new Date(pipeline.recordedAt).toLocaleString()
                      : '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {pipeline.validatedByName || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {pipeline.validatedAt
                      ? new Date(pipeline.validatedAt).toLocaleString()
                      : '-'}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Box display="flex" gap={0.5} justifyContent="flex-end">
                    {pipeline.canEdit && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(pipeline)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {pipeline.canSubmit && (
                      <Tooltip title="Submit">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleSubmit(pipeline)}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {pipeline.canValidate && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(pipeline)}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(pipeline)}
                          >
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Slot Monitoring
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Slot"
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(Number(e.target.value))}
              >
                {availableSlots.map((slot) => (
                  <MenuItem key={slot.id} value={slot.id}>
                    {slot.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Structure"
                value={selectedStructureId}
                onChange={(e) => setSelectedStructureId(Number(e.target.value))}
              >
                {availableStructures.map((structure) => (
                  <MenuItem key={structure.id} value={structure.id}>
                    {structure.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={loadSlotCoverage}
                  disabled={loading}
                >
                  Refresh
                </Button>

                <Tooltip title="Export to Excel">
                  <IconButton color="primary" disabled={!coverage}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Coverage Display */}
      {!loading && coverage && (
        <>
          {renderSlotHeader()}
          {renderSummaryCards()}
          {renderPipelineTable()}
        </>
      )}
    </Box>
  );
};

export default SlotMonitoring;
