/**
 * Slot Monitoring Page
 * 
 * Slot-centric operational dashboard for flow monitoring.
 * Displays pipeline coverage for a specific date + slot.
 * Structure is automatically determined from authenticated user's employee job assignment.
 * 
 * Frontend determines available actions (canEdit, canSubmit, canValidate) based on user roles.
 * Backend enforces permissions via exceptions in submit/validate methods.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Removed structure dropdown, get from user context
 * @updated 2026-02-04 - Get structure from employee.job.structure
 * @updated 2026-02-04 - Added frontend permission calculation based on user roles
 * @updated 2026-02-04 - Added debug logging and fallback for authenticated users
 * @updated 2026-02-04 - Refactored to use centralized imports and user helpers
 * @updated 2026-02-04 - Fixed ReadingSlotDTO field names and added translations
 * @module flow/core/pages
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useAuth } from '@/shared/context/AuthContext';

// Centralized imports from flow/core
import { FlowMonitoringService } from '../services';
import {
  SlotCoverageResponseDTO,
  PipelineCoverageDTO,
} from '../dto';
import { WorkflowStatus } from '../types';
import {
  getStatusColor,
  formatCompletionPercentage,
  formatSlotTimeRange,
  getUserStructure,
  getUserEmployeeId,
  debugUserStructure,
} from '../utils';
import { getLocalizedDesignation } from '../../common/dto/ReadingSlotDTO';

/**
 * Pipeline Permissions Interface
 * Frontend-calculated permissions based on user roles and workflow status
 */
interface PipelinePermissions {
  canEdit: boolean;
  canSubmit: boolean;
  canValidate: boolean;
}

/**
 * SlotMonitoring Component
 * 
 * Main operational console for slot-based monitoring workflow.
 * User's structure is automatically determined from their employee's job assignment.
 */
const SlotMonitoring: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Get current language for localized slot names
  const currentLang = i18n.language as 'ar' | 'en' | 'fr';

  // ==================== STATE ====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<SlotCoverageResponseDTO | null>(null);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);

  // ==================== USER DATA - CENTRALIZED ACCESS ====================
  
  // Get user structure using centralized helper (with fallback)
  const userStructureInfo = useMemo(() => getUserStructure(user), [user]);
  const userEmployeeId = useMemo(() => getUserEmployeeId(user), [user]);

  // User roles and permissions
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  // Debug: Log user structure on mount
  useEffect(() => {
    debugUserStructure(user);
    console.log('🔐 User Roles:', userRoles);
    console.log('🔐 User Permissions:', userPermissions);
  }, [user, userRoles, userPermissions]);

  // Available slots (1-12 for 24h / 2h slots)
  const availableSlots = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: t(`flow.slots.slot${i + 1}`, `Slot ${i + 1}`),
  }));

  // ==================== PERMISSION HELPERS ====================

  /**
   * Check if user has operator role
   * Operators can create/edit/submit readings
   * 
   * FALLBACK: If no specific roles found, allow all authenticated users to act as operators
   */
  const isOperator = useMemo(() => {
    const hasOperatorRole = userRoles.includes('ROLE_OPERATOR') || 
                            userRoles.includes('ROLE_FLOW_OPERATOR') ||
                            userPermissions.includes('FLOW_READING_CREATE') ||
                            userPermissions.includes('FLOW_READING_EDIT');
    
    // Fallback: If no roles/permissions defined yet, allow authenticated users
    const fallback = userRoles.length === 0 && userPermissions.length === 0;
    
    const result = hasOperatorRole || fallback;
    console.log('👷 isOperator:', result, '(hasRole:', hasOperatorRole, ', fallback:', fallback, ')');
    
    return result;
  }, [userRoles, userPermissions]);

  /**
   * Check if user has validator role
   * Validators can approve/reject submitted readings
   */
  const isValidator = useMemo(() => {
    const hasValidatorRole = userRoles.includes('ROLE_VALIDATOR') || 
                             userRoles.includes('ROLE_FLOW_VALIDATOR') ||
                             userRoles.includes('ROLE_SUPERVISOR') ||
                             userPermissions.includes('FLOW_READING_VALIDATE') ||
                             userPermissions.includes('FLOW_READING_APPROVE');
    
    console.log('✅ isValidator:', hasValidatorRole);
    
    return hasValidatorRole;
  }, [userRoles, userPermissions]);

  /**
   * Calculate permissions for a pipeline based on user role and workflow status
   * 
   * @param pipeline - Pipeline coverage data
   * @returns Permission flags for UI actions
   */
  const calculatePipelinePermissions = useCallback((pipeline: PipelineCoverageDTO): PipelinePermissions => {
    const status = pipeline.workflowStatus;

    // Default: no permissions
    const permissions: PipelinePermissions = {
      canEdit: false,
      canSubmit: false,
      canValidate: false,
    };

    // OPERATORS: Can edit/submit readings
    if (isOperator) {
      // Can edit if: NOT_RECORDED, DRAFT, or REJECTED
      if (status === 'NOT_RECORDED' || status === 'DRAFT' || status === 'REJECTED') {
        permissions.canEdit = true;
      }

      // Can submit if: DRAFT
      if (status === 'DRAFT') {
        permissions.canSubmit = true;
      }
    }

    // VALIDATORS: Can approve/reject submitted readings
    if (isValidator) {
      // Can validate if: SUBMITTED
      if (status === 'SUBMITTED') {
        permissions.canValidate = true;
      }
    }

    return permissions;
  }, [isOperator, isValidator]);

  // ==================== DATA LOADING ====================

  /**
   * Load slot coverage from backend
   */
  const loadSlotCoverage = useCallback(async () => {
    // Check if user has structure assigned via job
    if (!userStructureInfo.structureId) {
      setError(
        userStructureInfo.source === 'none'
          ? t('flow.monitoring.errors.noStructure', 'No structure assigned to your profile. Please contact your administrator.')
          : t('flow.monitoring.errors.incompleteStructure', 'Structure information incomplete. Please contact your administrator.')
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await FlowMonitoringService.getSlotCoverage({
        readingDate: selectedDate,
        slotId: selectedSlotId,
        structureId: userStructureInfo.structureId,
      });

      setCoverage(response);
      console.log('📊 Slot coverage loaded:', response.pipelines.length, 'pipelines');
    } catch (err: any) {
      setError(err.message || t('flow.monitoring.errors.loadFailed', 'Failed to load slot coverage'));
      console.error('❌ Error loading slot coverage:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSlotId, userStructureInfo, t]);

  // Auto-load on mount and filter changes
  useEffect(() => {
    if (userStructureInfo.structureId) {
      loadSlotCoverage();
    }
  }, [loadSlotCoverage, userStructureInfo.structureId]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle pipeline edit action
   */
  const handleEdit = (pipeline: PipelineCoverageDTO) => {
    // TODO: Navigate to reading edit page or show edit dialog
    console.log('✏️ Edit reading for pipeline:', pipeline.pipelineId, pipeline.pipelineCode);
    // For NOT_RECORDED status, this would create a new reading
    // For DRAFT/REJECTED status, this would edit the existing reading
  };

  /**
   * Handle pipeline submit action
   */
  const handleSubmit = async (pipeline: PipelineCoverageDTO) => {
    if (!pipeline.readingId || !userEmployeeId) {
      setError(t('flow.monitoring.errors.submitMissing', 'Cannot submit: missing reading ID or employee ID'));
      return;
    }

    try {
      // TODO: Get actual reading data before submit
      // For now, just reload coverage
      console.log('📤 Submit reading for pipeline:', pipeline.pipelineId);
      
      // Reload coverage
      await loadSlotCoverage();
    } catch (err: any) {
      setError(err.message || t('flow.monitoring.errors.submitFailed', 'Failed to submit reading'));
    }
  };

  /**
   * Handle pipeline approve action
   */
  const handleApprove = async (pipeline: PipelineCoverageDTO) => {
    if (!pipeline.readingId || !userEmployeeId) {
      setError(t('flow.monitoring.errors.approveMissing', 'Cannot approve: missing reading ID or employee ID'));
      return;
    }

    try {
      await FlowMonitoringService.validateReading({
        readingId: pipeline.readingId,
        action: 'APPROVE',
        employeeId: userEmployeeId,
      });

      console.log('✅ Reading approved for pipeline:', pipeline.pipelineId);
      
      // Reload coverage
      await loadSlotCoverage();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('flow.monitoring.errors.approveFailed', 'Failed to approve reading'));
    }
  };

  /**
   * Handle pipeline reject action
   */
  const handleReject = async (pipeline: PipelineCoverageDTO) => {
    if (!pipeline.readingId || !userEmployeeId) {
      setError(t('flow.monitoring.errors.rejectMissing', 'Cannot reject: missing reading ID or employee ID'));
      return;
    }

    // TODO: Show dialog to capture rejection comments
    const comments = prompt(t('flow.monitoring.prompts.rejectReason', 'Enter rejection reason:'));
    if (!comments) return;

    try {
      await FlowMonitoringService.validateReading({
        readingId: pipeline.readingId,
        action: 'REJECT',
        employeeId: userEmployeeId,
        comments,
      });

      console.log('❌ Reading rejected for pipeline:', pipeline.pipelineId);
      
      // Reload coverage
      await loadSlotCoverage();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('flow.monitoring.errors.rejectFailed', 'Failed to reject reading'));
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
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.structure', 'Structure')}
              </Typography>
              <Typography variant="h6" color="primary">
                {coverage.structure.designationFr || coverage.structure.code}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {coverage.structure.code}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.date', 'Date')}
              </Typography>
              <Typography variant="h6">
                {new Date(coverage.readingDate).toLocaleDateString(currentLang)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.slot', 'Slot')}
              </Typography>
              <Typography variant="h6">
                {getLocalizedDesignation(coverage.slot, currentLang)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatSlotTimeRange(
                  coverage.slot.startTime,
                  coverage.slot.endTime
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.completion', 'Completion')}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  label={formatCompletionPercentage(
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
      { label: t('flow.monitoring.summary.total', 'Total Pipelines'), value: coverage.totalPipelines, color: 'primary' },
      { label: t('flow.monitoring.summary.recorded', 'Recorded'), value: coverage.recordedCount, color: 'info' },
      { label: t('flow.monitoring.summary.submitted', 'Submitted'), value: coverage.submittedCount, color: 'warning' },
      { label: t('flow.monitoring.summary.approved', 'Approved'), value: coverage.approvedCount, color: 'success' },
      { label: t('flow.monitoring.summary.rejected', 'Rejected'), value: coverage.rejectedCount, color: 'error' },
      { label: t('flow.monitoring.summary.missing', 'Missing'), value: coverage.missingCount, color: 'default' },
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
          {t('flow.monitoring.noPipelines', 'No pipelines found for this structure.')}
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('flow.monitoring.table.pipeline', 'Pipeline')}</TableCell>
              <TableCell>{t('flow.monitoring.table.status', 'Status')}</TableCell>
              <TableCell>{t('flow.monitoring.table.recordedBy', 'Recorded By')}</TableCell>
              <TableCell>{t('flow.monitoring.table.recordedAt', 'Recorded At')}</TableCell>
              <TableCell>{t('flow.monitoring.table.validatedBy', 'Validated By')}</TableCell>
              <TableCell>{t('flow.monitoring.table.validatedAt', 'Validated At')}</TableCell>
              <TableCell align="right">{t('flow.monitoring.table.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coverage.pipelines.map((pipeline) => {
              // Calculate permissions for this pipeline based on user role
              const permissions = calculatePipelinePermissions(pipeline);
              
              // Debug log for first pipeline
              if (coverage.pipelines.indexOf(pipeline) === 0) {
                console.log('🔍 First pipeline permissions:', {
                  pipeline: pipeline.pipelineCode,
                  status: pipeline.workflowStatus,
                  permissions,
                  isOperator,
                  isValidator,
                });
              }

              return (
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
                      color={getStatusColor(pipeline.workflowStatus)}
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
                        ? new Date(pipeline.recordedAt).toLocaleString(currentLang)
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
                        ? new Date(pipeline.validatedAt).toLocaleString(currentLang)
                        : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      {permissions.canEdit && (
                        <Tooltip title={pipeline.workflowStatus === 'NOT_RECORDED' 
                          ? t('flow.monitoring.actions.create', 'Create Reading')
                          : t('flow.monitoring.actions.edit', 'Edit Reading')
                        }>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(pipeline)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {permissions.canSubmit && (
                        <Tooltip title={t('flow.monitoring.actions.submit', 'Submit for Validation')}>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleSubmit(pipeline)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {permissions.canValidate && (
                        <>
                          <Tooltip title={t('flow.monitoring.actions.approve', 'Approve')}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(pipeline)}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('flow.monitoring.actions.reject', 'Reject')}>
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ==================== MAIN RENDER ====================

  // Show error if user has no structure assigned via job
  if (!userStructureInfo.structureId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('flow.monitoring.title', 'Slot Monitoring')}
        </Typography>
        <Alert severity="error">
          {userStructureInfo.source === 'none'
            ? t('flow.monitoring.errors.noStructure', 'No structure assigned to your profile. Please contact your administrator to assign a job with a structure.')
            : t('flow.monitoring.errors.incompleteStructure', 'Structure information incomplete. Please contact your administrator.')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('flow.monitoring.title', 'Slot Monitoring')}
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="body2" color="text.secondary">
          {t('flow.monitoring.monitoringFor', 'Monitoring for')}: <strong>{userStructureInfo.structureName}</strong> ({userStructureInfo.structureCode})
        </Typography>
        
        {/* Role badges */}
        <Box display="flex" gap={1}>
          {isOperator && (
            <Chip label={t('flow.monitoring.roles.operator', 'Operator')} size="small" color="info" />
          )}
          {isValidator && (
            <Chip label={t('flow.monitoring.roles.validator', 'Validator')} size="small" color="success" />
          )}
          {!isOperator && !isValidator && (
            <Chip label={t('flow.monitoring.roles.noRole', 'No Role Assigned')} size="small" color="warning" />
          )}
        </Box>
        
        {/* Structure source indicator */}
        {userStructureInfo.source === 'organizational' && (
          <Chip 
            label={t('flow.monitoring.fallbackStructure', 'Using Fallback Structure')} 
            size="small" 
            color="warning" 
            variant="outlined"
          />
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label={t('flow.monitoring.filters.date', 'Date')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label={t('flow.monitoring.filters.slot', 'Slot')}
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

            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={loadSlotCoverage}
                  disabled={loading}
                >
                  {t('flow.monitoring.actions.refresh', 'Refresh')}
                </Button>

                <Tooltip title={t('flow.monitoring.actions.export', 'Export to Excel')}>
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
