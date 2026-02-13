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
 * @updated 2026-02-14 00:35 - Fixed: Use readingId instead of reading.id for validation navigation
 * @updated 2026-02-13 23:46 - Fixed: Force refresh after recording to update pipeline status
 * @updated 2026-02-13 - Fixed: TypeScript errors (null safety, draft→drafts, optional chaining)
 * @updated 2026-02-11 13:20 - Fixed: Use SlotCoverageService and correct DTO imports
 * @updated 2026-02-11 13:00 - Integrate ReadingWorkflowService, replace browser prompt with dialog
 * @updated 2026-02-11 13:00 - Use centralized date formatting from shared/utils
 * @updated 2026-02-07 16:59 - Integrate page title into filter row for compact layout
 * @updated 2026-02-07 16:37 - Hide date and slot filters for non-admin users (auto-selected)
 * @updated 2026-02-07 16:29 - Fixed: Operational day starts at 08:00 (Slot 1), not midnight
 * @updated 2026-02-07 16:25 - Fixed: Correct slot calculation to choose slot directly before current time
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
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

// ✅ FIXED: Use SlotCoverageService (not removed FlowMonitoringService)
import { SlotCoverageService } from '../services';
import { ReadingWorkflowService } from '@/modules/flow/workflow/services';

// ✅ FIXED: Import correct DTOs from SlotCoverageDTO
import type {
  SlotCoverageDTO,
  PipelineCoverageItemDTO,
} from '../dto/SlotCoverageDTO';

import {
  formatCompletionPercentage,
  getStatusColor,
  getStatusLabel,
  getPipelineDisplayName,
  getEmployeeDisplayName,
  calculateCompletionRate,
} from '../utils/monitoringHelpers';
import { getUserStructure, getUserEmployeeId, debugUserStructure } from '../utils/userHelpers';
import { getLocalizedDesignation } from '../../common/dto/ReadingSlotDTO';

// Use centralized date/time utilities
import { formatDate, formatSlotTimeRange } from '@/shared/utils/dateTimeLocal';

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
 * Rejection Dialog State
 */
interface RejectDialogState {
  open: boolean;
  pipeline: PipelineCoverageItemDTO | null;
  reason: string;
}

/**
 * Notification State
 */
interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
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
  const [coverage, setCoverage] = useState<SlotCoverageDTO | null>(null);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);

  // Rejection dialog state
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    open: false,
    pipeline: null,
    reason: '',
  });

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

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
  }, [userRoles]);

  /**
   * Check if user has validator role
   * Validators can approve/reject submitted readings
   */
  const isValidator = useMemo(() => {
    const hasValidatorRole = userRoles.includes('MONITORING_ADMIN') || 
                             userRoles.includes('MONITORING_VALIDATOR');
    
    console.log('✅ isValidator:', hasValidatorRole);
    return hasValidatorRole;
  }, [userRoles]);

  /**
   * Check if user has any flow-related role
   */
  const hasFlowRole = useMemo(() => {
    return isOperator || isValidator;
  }, [isOperator, isValidator]);

  /**
   * Determine which slot should be selected based on current time
   * 
   * IMPORTANT: Operational day starts at 08:00, not midnight!
   * 
   * Slot mapping (24-hour operational day from 08:00 to 08:00 next day):
   * Slot 1:  08:00-10:00  (day starts here)
   * Slot 2:  10:00-12:00
   * Slot 3:  12:00-14:00
   * Slot 4:  14:00-16:00
   * Slot 5:  16:00-18:00
   * Slot 6:  18:00-20:00
   * Slot 7:  20:00-22:00
   * Slot 8:  22:00-24:00 (midnight)
   * Slot 9:  00:00-02:00  (crosses to next calendar day)
   * Slot 10: 02:00-04:00
   * Slot 11: 04:00-06:00
   * Slot 12: 06:00-08:00  (last slot, ends when new operational day starts)
   * 
   * Rule: Select the slot whose time range is DIRECTLY BEFORE the current time
   */
  const getAutoSelectedSlotId = useCallback((): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate slot based on operational day starting at 08:00
    let currentSlot: number;
    
    if (currentHour >= 8) {
      currentSlot = Math.floor((currentHour - 8) / 2) + 1;
    } else {
      currentSlot = Math.floor(currentHour / 2) + 9;
    }
    
    // Select the PREVIOUS slot (the one that ended before current time)
    let selectedSlot = currentSlot - 1;
    
    // Handle wrap-around: if we're in Slot 1, previous slot is Slot 12
    if (selectedSlot === 0) {
      selectedSlot = 12;
    }
    
    console.log('🕐 Auto-selecting slot:', {
      currentTime: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
      currentSlot,
      selectedSlot,
      logic: 'Selecting slot directly BEFORE current time (operational day starts at 08:00)'
    });
    
    return selectedSlot;
  }, []);

  /**
   * Auto-select date and slot on mount for non-admin users
   */
  useEffect(() => {
    if (!isAdmin) {
      const currentDate = new Date().toISOString().split('T')[0];
      setSelectedDate(currentDate);
      
      const autoSlotId = getAutoSelectedSlotId();
      setSelectedSlotId(autoSlotId);
      
      console.log('🔒 Date and Slot auto-selected and locked:', {
        date: currentDate,
        slotId: autoSlotId
      });
    }
  }, [isAdmin, getAutoSelectedSlotId]);

  /**
   * Calculate permissions for a pipeline based on user role and workflow status
   */
  const calculatePipelinePermissions = useCallback((pipeline: PipelineCoverageItemDTO): PipelinePermissions => {
    const status = pipeline.status || 'NOT_RECORDED';

    const permissions: PipelinePermissions = {
      canEdit: false,
      canSubmit: false,
      canValidate: false,
    };

    // OPERATORS: Can edit/submit readings
    if (isOperator) {
      if (status === 'NOT_RECORDED' || status === 'DRAFT' || status === 'REJECTED') {
        permissions.canEdit = true;
      }
      if (status === 'DRAFT') {
        permissions.canSubmit = true;
      }
    }

    // VALIDATORS: Can approve/reject submitted readings
    if (isValidator) {
      if (status === 'SUBMITTED') {
        permissions.canValidate = true;
      }
    }

    return permissions;
  }, [isOperator, isValidator]);

  // ==================== NOTIFICATION HELPER ====================

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };

  // ==================== DATA LOADING ====================

  /**
   * Load slot coverage from backend using SlotCoverageService
   * ✅ FIXED: Clear coverage state before reload to force refresh
   */
  const loadSlotCoverage = useCallback(async (forceRefresh: boolean = false) => {
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
    
    // ✅ Clear coverage to show loading state
    if (forceRefresh) {
      console.log('🔄 Force refresh - clearing coverage state');
      setCoverage(null);
    }

    try {
      console.log('🔄 Loading slot coverage:', { date: selectedDate, slot: selectedSlotId, structure: userStructureInfo.structureId });
      
      // ✅ FIXED: Use SlotCoverageService.getSlotCoverage()
      const response = await SlotCoverageService.getSlotCoverage(
        selectedDate,
        selectedSlotId,
        userStructureInfo.structureId
      );

      console.log('📊 Slot coverage loaded:', {
        pipelines: response.pipelineCoverage.length,
        summary: response.summary,
        pipelineStatuses: response.pipelineCoverage.map(p => ({
          id: p.pipeline?.id,
          code: p.pipeline?.code,
          status: p.status,
          hasReading: !!p.readingId
        }))
      });
      
      setCoverage(response);
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
      loadSlotCoverage(false);
    }
  }, [loadSlotCoverage, userStructureInfo.structureId]);

  // ✅ FIXED: Reload data when window regains focus (after returning from edit form)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - reloading slot coverage');
      if (userStructureInfo.structureId) {
        loadSlotCoverage(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userStructureInfo.structureId, loadSlotCoverage]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle pipeline edit action
   * Navigates to reading form (create new or edit existing)
   */
  const handleEdit = (pipeline: PipelineCoverageItemDTO) => {
    const status = pipeline.status || 'NOT_RECORDED';
    
    console.log('✏️ Edit reading for pipeline:', pipeline.pipeline?.code, 'Status:', status);
    
    if (status === 'NOT_RECORDED') {
      // CREATE NEW READING
      navigate(`/flow/readings/new`, {
        state: {
          pipelineId: pipeline.pipeline?.id,
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
      // ✅ FIXED: Use readingId instead of reading.id
      if (pipeline.readingId) {
        navigate(`/flow/readings/${pipeline.readingId}/edit`, {
          state: {
            pipelineId: pipeline.pipeline?.id,
            pipelineCode: pipeline.pipeline?.code,
            pipelineName: pipeline.pipeline?.name,
            readingDate: selectedDate,
            slotId: selectedSlotId,
            structureId: userStructureInfo.structureId,
            returnTo: '/flow/monitoring',
          }
        });
      } else {
        showNotification('Cannot edit: reading ID not found', 'error');
      }
    }
  };

  /**
   * Handle pipeline submit action
   * Changes status from DRAFT to SUBMITTED using ReadingWorkflowService
   * ✅ FIXED: Force refresh after submit
   */
  const handleSubmit = async (pipeline: PipelineCoverageItemDTO) => {
    // ✅ FIXED: Use readingId instead of reading?.id
    if (!pipeline.readingId || !userEmployeeId) {
      showNotification(t('flow.monitoring.errors.submitMissing', 'Cannot submit: missing reading ID or employee ID'), 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Submitting reading for validation:', { 
        readingId: pipeline.readingId, 
        employeeId: userEmployeeId 
      });
      
      // Use workflow service to change status from DRAFT to SUBMITTED
      await ReadingWorkflowService.validate(pipeline.readingId, userEmployeeId);
      
      showNotification(
        t('flow.monitoring.messages.submitSuccess', 'Reading submitted for validation'),
        'success'
      );
      
      // ✅ Force refresh to show updated status
      await loadSlotCoverage(true);
    } catch (err: any) {
      console.error('❌ Error submitting reading:', err);
      showNotification(
        err.response?.data?.message || err.message || t('flow.monitoring.errors.submitFailed', 'Failed to submit reading'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pipeline approve action
   * Navigate to ReadingEdit in validation mode (readings disabled, notes editable)
   * ✅ FIXED: Use readingId instead of reading?.id
   */
  const handleApprove = (pipeline: PipelineCoverageItemDTO) => {
    // ✅ FIXED: Check readingId directly (not reading.id)
    if (!pipeline.readingId) {
      showNotification(t('flow.monitoring.errors.approveMissing', 'Cannot approve: missing reading ID'), 'error');
      return;
    }

    console.log('✅ Navigating to validation for pipeline:', pipeline.pipeline?.code, 'Reading ID:', pipeline.readingId);
    
    // Navigate to ReadingEdit in validation mode
    navigate(`/flow/readings/${pipeline.readingId}/validate`, {
      state: {
        pipelineId: pipeline.pipeline?.id,
        pipelineCode: pipeline.pipeline?.code,
        pipelineName: pipeline.pipeline?.name,
        readingDate: selectedDate,
        slotId: selectedSlotId,
        structureId: userStructureInfo.structureId,
        returnTo: '/flow/monitoring',
        isValidation: true,
      }
    });
  };

  /**
   * Handle pipeline reject action - Open dialog
   * ✅ FIXED: Use readingId instead of reading?.id
   */
  const handleReject = (pipeline: PipelineCoverageItemDTO) => {
    // ✅ FIXED: Check readingId directly (not reading.id)
    if (!pipeline.readingId || !userEmployeeId) {
      showNotification(t('flow.monitoring.errors.rejectMissing', 'Cannot reject: missing reading ID or employee ID'), 'error');
      return;
    }

    setRejectDialog({
      open: true,
      pipeline,
      reason: '',
    });
  };

  /**
   * Confirm rejection with reason using ReadingWorkflowService
   * ✅ FIXED: Force refresh after reject
   */
  const confirmReject = async () => {
    const { pipeline, reason } = rejectDialog;
    
    // ✅ FIXED: Use readingId instead of reading?.id
    if (!pipeline?.readingId || !userEmployeeId) {
      showNotification('Cannot reject: missing reading ID or employee ID', 'error');
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      showNotification(t('flow.monitoring.errors.rejectReasonRequired', 'Rejection reason must be at least 5 characters'), 'warning');
      return;
    }

    try {
      setLoading(true);
      console.log('❌ Rejecting reading:', { 
        readingId: pipeline.readingId, 
        employeeId: userEmployeeId, 
        reason: reason.trim() 
      });

      // Use workflow service to reject reading
      await ReadingWorkflowService.reject(
        pipeline.readingId,
        userEmployeeId,
        reason.trim()
      );

      showNotification(
        t('flow.monitoring.messages.rejectSuccess', 'Reading rejected'),
        'success'
      );
      
      // Close dialog and reset
      setRejectDialog({ open: false, pipeline: null, reason: '' });
      
      // ✅ Force refresh to show updated status
      await loadSlotCoverage(true);
    } catch (err: any) {
      console.error('❌ Error rejecting reading:', err);
      showNotification(
        err.response?.data?.message || err.message || t('flow.monitoring.errors.rejectFailed', 'Failed to reject reading'),
        'error'
      );
    } finally {
      setLoading(false);
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
                {formatDate(coverage.date, 'dd-MM-yyyy')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.slot', 'Slot')}
              </Typography>
              <Typography variant="h6">
                {coverage.slot ? getLocalizedDesignation(coverage.slot, currentLang) : '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {coverage.slot ? formatSlotTimeRange(coverage.slot.startTime, coverage.slot.endTime) : '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('flow.monitoring.completion', 'Completion')}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  label={formatCompletionPercentage(calculateCompletionRate(coverage))}
                  color={coverage.summary.approved === coverage.summary.totalPipelines ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculateCompletionRate(coverage)}
                sx={{ mt: 1 }}
                color={coverage.summary.approved === coverage.summary.totalPipelines ? 'success' : 'warning'}
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
      { label: t('flow.monitoring.summary.total', 'Total Pipelines'), value: coverage.summary.totalPipelines, color: 'primary' },
      { label: t('flow.monitoring.summary.recorded', 'Draft'), value: coverage.summary.drafts, color: 'info' },
      { label: t('flow.monitoring.summary.submitted', 'Submitted'), value: coverage.summary.submitted, color: 'warning' },
      { label: t('flow.monitoring.summary.approved', 'Approved'), value: coverage.summary.approved, color: 'success' },
      { label: t('flow.monitoring.summary.rejected', 'Rejected'), value: coverage.summary.rejected, color: 'error' },
      { label: t('flow.monitoring.summary.missing', 'Missing'), value: coverage.summary.notRecorded, color: 'default' },
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
    if (!coverage || coverage.pipelineCoverage.length === 0) {
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
              <TableCell align="right">{t('flow.monitoring.table.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coverage.pipelineCoverage.map((pipeline: PipelineCoverageItemDTO) => {
              const permissions = calculatePipelinePermissions(pipeline);

              return (
                <TableRow key={pipeline.pipeline?.id || pipeline.pipelineId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {pipeline.pipeline?.code || `Pipeline ${pipeline.pipeline?.id || pipeline.pipelineId}`}
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
                      {pipeline.recordedBy ? getEmployeeDisplayName(pipeline.recordedBy) : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {pipeline.recordedAt
                        ? new Date(pipeline.recordedAt).toLocaleString(currentLang)
                        : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      {permissions.canEdit && (
                        <Tooltip title={
                          (pipeline.status || 'NOT_RECORDED') === 'NOT_RECORDED' 
                            ? t('flow.monitoring.actions.create', 'Create Reading')
                            : t('flow.monitoring.actions.edit', 'Edit Reading')
                        }>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(pipeline)}
                            disabled={loading}
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
                            disabled={loading}
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
                              disabled={loading}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('flow.monitoring.actions.reject', 'Reject')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(pipeline)}
                              disabled={loading}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
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
      {!hasFlowRole && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {t('flow.monitoring.warnings.noFlowRole.title', 'Limited Access - No Flow Role Assigned')}
          </Typography>
          <Typography variant="body2">
            {t('flow.monitoring.warnings.noFlowRole.message', 
              'You can view flow monitoring data, but you cannot create, edit, or validate readings.')}
          </Typography>
        </Alert>
      )}

      {!isAdmin && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Auto-Selected:</strong> Date and time slot have been automatically selected based on the current time. 
            Only administrators can change the selection.
          </Typography>
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={isAdmin ? 3 : 9}>
              <Typography variant="h4" component="h1">
                {t('flow.monitoring.title', 'Slot Monitoring')}
              </Typography>
            </Grid>

            {isAdmin && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('flow.monitoring.filters.date', 'Date')}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
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
              </>
            )}

            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Tooltip title={t('flow.monitoring.actions.refresh', 'Refresh')}>
                  <span>
                    <IconButton 
                      color="primary" 
                      onClick={() => loadSlotCoverage(true)}
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && coverage && (
        <>
          {renderSlotHeader()}
          {renderSummaryCards()}
          {renderPipelineTable()}
        </>
      )}

      {/* Rejection Dialog */}
      <Dialog 
        open={rejectDialog.open} 
        onClose={() => !loading && setRejectDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('flow.monitoring.dialogs.reject.title', 'Reject Reading')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('flow.monitoring.dialogs.reject.reasonLabel', 'Rejection Reason')}
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
            required
            helperText={t('flow.monitoring.dialogs.reject.reasonHelper', 'Please provide a detailed reason (minimum 5 characters)')}
            error={rejectDialog.reason.trim().length > 0 && rejectDialog.reason.trim().length < 5}
            disabled={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRejectDialog({ open: false, pipeline: null, reason: '' })}
            disabled={loading}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={confirmReject} 
            color="error" 
            variant="contained"
            disabled={loading || rejectDialog.reason.trim().length < 5}
          >
            {loading ? <CircularProgress size={20} /> : t('flow.monitoring.dialogs.reject.confirm', 'Confirm Rejection')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SlotMonitoring;
