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
 * @updated 2026-02-07 16:00 - Auto-select and lock slot based on current time for non-admin users
 * @updated 2026-02-07 11:10 - Removed colored row backgrounds for better readability - color only on status badge
 * @updated 2026-02-06 20:30 - Fixed: Approve button now navigates to ReadingEdit with validation mode for notes editing
 * @updated 2026-02-05 - Removed role badges line, format date as dd-mm-yyyy
 * @updated 2026-02-05 - UI improvements: removed monitoring line, centered badges, aligned header fields
 * @updated 2026-02-05 - Changed refresh to icon button matching export button style
 * @updated 2026-02-05 - Fixed return path to /flow/monitoring
 * @updated 2026-02-05 - Fixed disabled Tooltip warning by wrapping IconButton with span
 * @updated 2026-02-05 - Added navigation to reading form from action buttons
 * @updated 2026-02-04 - Improved role detection and messaging
 * @updated 2026-02-04 - Updated to work with nested DTO structure
 * @module flow/core/pages
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Warning as WarningIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/AuthContext';

// Centralized imports from flow/core
import { FlowMonitoringService } from '../services';
import {
  SlotCoverageResponseDTO,
  PipelineCoverageDTO,
} from '../dto';
import {
  formatCompletionPercentage,
  formatSlotTimeRange,
  getStatusColor,
  getStatusLabel,
  getPipelineDisplayName,
  getEmployeeDisplayName,
} from '../utils/monitoringHelpers';
import { getUserStructure, getUserEmployeeId, debugUserStructure } from '../utils/userHelpers';
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
  const navigate = useNavigate();

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
   * Check if user is MONITORING_ADMIN
   * Only admins can change slot selection freely
   */
  const isAdmin = useMemo(() => {
    const hasAdminRole = userRoles.includes('MONITORING_ADMIN');
    console.log('👑 isAdmin:', hasAdminRole);
    return hasAdminRole;
  }, [userRoles]);

  /**
   * Check if user has operator role
   * Operators can create/edit/submit readings
   */
  const isOperator = useMemo(() => {
    const hasOperatorRole = userRoles.includes('MONITORING_ADMIN') || 
                            userRoles.includes('MONITORING_OPERATOR');
    
    console.log('👷 isOperator:', hasOperatorRole);
    return hasOperatorRole;
  }, [userRoles, userPermissions]);

  /**
   * Check if user has validator role
   * Validators can approve/reject submitted readings
   */
  const isValidator = useMemo(() => {
    const hasValidatorRole = userRoles.includes('MONITORING_ADMIN') || 
                             userRoles.includes('MONITORING_VALIDATOR');
    
    console.log('✅ isValidator:', hasValidatorRole);
    return hasValidatorRole;
  }, [userRoles, userPermissions]);

  /**
   * Check if user has any flow-related role
   */
  const hasFlowRole = useMemo(() => {
    return isOperator || isValidator;
  }, [isOperator, isValidator]);

  /**
   * Determine which slot should be selected based on current time
   * Slots are 2-hour periods:
   * Slot 1: 00:00-02:00, Slot 2: 02:00-04:00, ..., Slot 12: 22:00-24:00
   * 
   * Rule: Select the slot whose time range is directly before the current time
   * Example: If current time is 15:30, select Slot 7 (14:00-16:00) because it contains current time
   *          If current time is 16:01, select Slot 8 (16:00-18:00) because it just started
   */
  const getAutoSelectedSlotId = useCallback((): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate slot based on current time
    // Each slot is 2 hours, starting from 00:00
    // Slot 1: 00:00-02:00 (hours 0-1)
    // Slot 2: 02:00-04:00 (hours 2-3)
    // ...
    // Slot 12: 22:00-24:00 (hours 22-23)
    
    // Formula: slotId = floor(currentHour / 2) + 1
    // But we want the slot that is "directly before" current time
    // So if we're in the first minute of a new slot, we select the previous slot
    
    let slotId: number;
    
    if (currentMinute === 0 && currentHour % 2 === 0) {
      // Exactly at the start of a new slot (e.g., 14:00)
      // Select the previous slot
      slotId = Math.floor(currentHour / 2);
      if (slotId === 0) slotId = 12; // Wrap around to slot 12 if at midnight
    } else {
      // Normal case: select the slot that contains current time
      slotId = Math.floor(currentHour / 2) + 1;
    }
    
    console.log('🕐 Auto-selecting slot:', {
      currentTime: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
      calculatedSlotId: slotId,
      slotTimeRange: `${((slotId - 1) * 2).toString().padStart(2, '0')}:00 - ${(slotId * 2).toString().padStart(2, '0')}:00`
    });
    
    return slotId;
  }, []);

  /**
   * Determine if slot selection should be locked
   * Locked for all users except MONITORING_ADMIN
   */
  const isSlotLocked = useMemo(() => {
    return !isAdmin;
  }, [isAdmin]);

  /**
   * Auto-select slot on mount for non-admin users
   */
  useEffect(() => {
    if (isSlotLocked) {
      const autoSlotId = getAutoSelectedSlotId();
      setSelectedSlotId(autoSlotId);
      console.log('🔒 Slot auto-selected and locked:', autoSlotId);
    }
  }, [isSlotLocked, getAutoSelectedSlotId]);

  /**
   * Calculate permissions for a pipeline based on user role and workflow status
   * 
   * @param pipeline - Pipeline coverage data
   * @returns Permission flags for UI actions
   */
  const calculatePipelinePermissions = useCallback((pipeline: PipelineCoverageDTO): PipelinePermissions => {
    const statusCode = pipeline.validationStatus?.code || 'NOT_RECORDED';

    // Default: no permissions
    const permissions: PipelinePermissions = {
      canEdit: false,
      canSubmit: false,
      canValidate: false,
    };

    // OPERATORS: Can edit/submit readings
    if (isOperator) {
      // Can edit if: NOT_RECORDED, DRAFT, or REJECTED
      if (statusCode === 'NOT_RECORDED' || statusCode === 'DRAFT' || statusCode === 'REJECTED') {
        permissions.canEdit = true;
      }

      // Can submit if: DRAFT
      if (statusCode === 'DRAFT') {
        permissions.canSubmit = true;
      }
    }

    // VALIDATORS: Can approve/reject submitted readings
    if (isValidator) {
      // Can validate if: SUBMITTED
      if (statusCode === 'SUBMITTED') {
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
   * Navigates to reading form (create new or edit existing)
   */
  const handleEdit = (pipeline: PipelineCoverageDTO) => {
    const statusCode = pipeline.validationStatus?.code || 'NOT_RECORDED';
    
    console.log('✏️ Edit reading for pipeline:', pipeline.pipelineId, pipeline.pipeline?.code);
    
    // Build route with query parameters for context
    if (statusCode === 'NOT_RECORDED') {
      // CREATE NEW READING
      navigate(`/flow/readings/new`, {
        state: {
          pipelineId: pipeline.pipelineId,
          pipelineCode: pipeline.pipeline?.code,
          pipelineName: pipeline.pipeline?.name,
          readingDate: selectedDate,
          slotId: selectedSlotId,
          structureId: userStructureInfo.structureId,
          returnTo: '/flow/monitoring',
        }
      });
    } else {
      // EDIT EXISTING READING (DRAFT or REJECTED)
      if (pipeline.readingId) {
        navigate(`/flow/readings/${pipeline.readingId}/edit`, {
          state: {
            pipelineId: pipeline.pipelineId,
            pipelineCode: pipeline.pipeline?.code,
            pipelineName: pipeline.pipeline?.name,
            readingDate: selectedDate,
            slotId: selectedSlotId,
            structureId: userStructureInfo.structureId,
            returnTo: '/flow/monitoring',
          }
        });
      } else {
        setError('Cannot edit: reading ID not found');
      }
    }
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
   * Navigate to ReadingEdit in validation mode (readings disabled, notes editable)
   */
  const handleApprove = (pipeline: PipelineCoverageDTO) => {
    if (!pipeline.readingId) {
      setError(t('flow.monitoring.errors.approveMissing', 'Cannot approve: missing reading ID'));
      return;
    }

    console.log('✅ Navigating to validation for pipeline:', pipeline.pipelineId, pipeline.pipeline?.code);
    
    // Navigate to ReadingEdit in validation mode
    navigate(`/flow/readings/${pipeline.readingId}/validate`, {
      state: {
        pipelineId: pipeline.pipelineId,
        pipelineCode: pipeline.pipeline?.code,
        pipelineName: pipeline.pipeline?.name,
        readingDate: selectedDate,
        slotId: selectedSlotId,
        structureId: userStructureInfo.structureId,
        returnTo: '/flow/monitoring',
        isValidation: true, // Flag to indicate validation mode
      }
    });
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
   * Get localized structure name
   */
  const getStructureName = (structure: any): string => {
    if (!structure) return '';
    
    switch (currentLang) {
      case 'ar':
        return structure.designationAr || structure.designationFr || structure.designationEn || structure.code;
      case 'fr':
        return structure.designationFr || structure.designationEn || structure.code;
      case 'en':
      default:
        return structure.designationEn || structure.designationFr || structure.code;
    }
  };

  /**
   * Format date as dd-mm-yyyy
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  /**
   * Render slot header with date + slot info
   */
  const renderSlotHeader = () => {
    if (!coverage) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.structure', 'Structure')}
              </Typography>
              <Typography variant="h6" color="primary">
                {getStructureName(coverage.structure)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.date', 'Date')}
              </Typography>
              <Typography variant="h6">
                {formatDate(coverage.readingDate)}
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
                    coverage.validationCompletionPercentage || 0
                  )}
                  color={coverage.isSlotComplete ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={coverage.validationCompletionPercentage || 0}
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
                  pipeline: pipeline.pipeline?.code,
                  status: pipeline.validationStatus?.code,
                  permissions,
                  isOperator,
                  isValidator,
                });
              }

              return (
                <TableRow key={pipeline.pipelineId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {pipeline.pipeline?.code || `Pipeline ${pipeline.pipelineId}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getPipelineDisplayName(pipeline, currentLang)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatusLabel(pipeline, currentLang)}
                      color={getStatusColor(pipeline)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {getEmployeeDisplayName(pipeline.recordedBy)}
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
                      {getEmployeeDisplayName(pipeline.validatedBy)}
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
                        <Tooltip title={
                          (pipeline.validationStatus?.code || 'NOT_RECORDED') === 'NOT_RECORDED' 
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
                          <Tooltip title={t('flow.monitoring.actions.approve', 'Review & Approve')}>
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
                      
                      {/* Show info if no permissions */}
                      {!permissions.canEdit && !permissions.canSubmit && !permissions.canValidate && (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
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

      {/* Access warning if no flow roles */}
      {!hasFlowRole && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {t('flow.monitoring.warnings.noFlowRole.title', 'Limited Access - No Flow Role Assigned')}
          </Typography>
          <Typography variant="body2">
            {t('flow.monitoring.warnings.noFlowRole.message', 
              'You can view flow monitoring data, but you cannot create, edit, or validate readings. To perform these actions, you need one of the following roles:')}
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li><Typography variant="body2">ROLE_OPERATOR or ROLE_FLOW_OPERATOR (to create/edit readings)</Typography></li>
            <li><Typography variant="body2">ROLE_VALIDATOR, ROLE_FLOW_VALIDATOR, or ROLE_SUPERVISOR (to approve/reject readings)</Typography></li>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t('flow.monitoring.warnings.noFlowRole.contact', 'Contact your administrator to request the appropriate role.')}
          </Typography>
        </Alert>
      )}

      {/* Slot Auto-Selection Info for Non-Admins */}
      {isSlotLocked && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Slot Auto-Selected:</strong> The time slot has been automatically selected based on the current time. 
            Only administrators can change the slot selection.
          </Typography>
        </Alert>
      )}

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
                disabled={isSlotLocked}
                InputProps={{
                  endAdornment: isSlotLocked ? (
                    <Tooltip title="Slot is auto-selected based on current time. Only admins can change it.">
                      <LockIcon sx={{ mr: 1, color: 'action.disabled' }} />
                    </Tooltip>
                  ) : null,
                }}
              >
                {availableSlots.map((slot) => (
                  <MenuItem key={slot.id} value={slot.id}>
                    {slot.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Tooltip title={t('flow.monitoring.actions.refresh', 'Refresh')}>
                  <span>
                    <IconButton 
                      color="primary" 
                      onClick={loadSlotCoverage}
                      disabled={loading}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title={t('flow.monitoring.actions.export', 'Export to Excel')}>
                  <span>
                    <IconButton color="primary" disabled={!coverage}>
                      <DownloadIcon />
                    </IconButton>
                  </span>
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
