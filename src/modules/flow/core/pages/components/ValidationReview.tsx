/**
 * ValidationReview Component
 * 
 * Displays a summary of entered measurements for review before submission.
 * In validation mode, allows validators to approve or reject readings.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 02-11-2026 13:10 - Fixed: validate() only accepts 2 parameters
 * @updated 02-11-2026 13:00 - Replace FlowMonitoringService with ReadingWorkflowService
 * @updated 02-11-2026 13:00 - Use centralized date/time formatting from shared/utils
 * @updated 02-06-2026 22:40 - Fixed: Use FlowMonitoringService.validateReading() instead of FlowReadingService.validate()
 * @updated 01-27-2026 - Fixed: Use UserService.getByUsername() instead of AuthService.getCurrentUser()
 * @updated 01-28-2026 - Added threshold validation for contained volume
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import { ReadingWorkflowService } from '@/modules/flow/workflow/services';
import { formatDateTime } from '@/shared/utils/dateTimeLocal';

import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

interface ValidationReviewProps {
  formData: any;
  threshold?: FlowThresholdDTO;
  pipelineId?: number;
  existingReading?: FlowReadingDTO;
  isValidationMode?: boolean;
  onApprove?: () => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  currentEmployeeId?: number;
  isLoading?: boolean;
  onNavigateToEdit?: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const ValidationReview: React.FC<ValidationReviewProps> = ({
  formData,
  threshold,
  pipelineId,
  existingReading,
  isValidationMode = false,
  onApprove,
  onReject,
  currentEmployeeId,
  isLoading = false,
  onNavigateToEdit,
}) => {
  const [validationNotes, setValidationNotes] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  const formatValue = (value?: number, unit?: string): string => {
    if (value === undefined || value === null) return 'Not recorded';
    return `${value.toFixed(2)} ${unit || ''}`;
  };
  
  const getEmployeeName = (employee?: { firstNameLt: string; lastNameLt: string }): string => {
    if (!employee) return 'N/A';
    return `${employee.firstNameLt} ${employee.lastNameLt}`;
  };
  
  const getValueStatus = (
    value: number | undefined,
    min?: number,
    max?: number
  ): { color: 'success' | 'warning' | 'error'; icon: React.ReactNode; text: string } => {
    if (value === undefined || value === null) {
      return { color: 'warning', icon: <WarningIcon />, text: 'Not recorded' };
    }
    
    if (min !== undefined && max !== undefined) {
      if (value < min || value > max) {
        return { color: 'error', icon: <ErrorIcon />, text: 'Out of range' };
      }
      return { color: 'success', icon: <CheckCircleIcon />, text: 'Within range' };
    }
    
    return { color: 'success', icon: <CheckCircleIcon />, text: 'Recorded' };
  };

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };
  
  const handleValidate = async () => {
    // If parent provides onApprove handler, use it
    if (onApprove) {
      try {
        await onApprove();
      } catch (error: any) {
        showNotification(error.message || 'Approval failed', 'error');
      }
      return;
    }

    // Fallback: Direct workflow service call (if parent doesn't provide handler)
    if (!existingReading?.id || !currentEmployeeId) {
      showNotification('Reading ID or employee ID is missing', 'error');
      return;
    }
    
    try {
      setLocalLoading(true);
      
      // ✅ FIXED: validate() only accepts 2 parameters (id, validatedById)
      // Validation notes are NOT supported by backend validate endpoint
      await ReadingWorkflowService.validate(
        existingReading.id,
        currentEmployeeId
      );
      
      showNotification('Reading approved successfully', 'success');
      
      // Give time for notification before navigation
      setTimeout(() => {
        window.location.href = '/flow/monitoring';
      }, 1500);
    } catch (error: any) {
      console.error('Validation failed:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Validation failed',
        'error'
      );
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!validationNotes.trim() || validationNotes.trim().length < 5) {
      showNotification('Please provide a reason for rejection (minimum 5 characters)', 'warning');
      return;
    }

    // If parent provides onReject handler, use it
    if (onReject) {
      try {
        await onReject(validationNotes.trim());
        setShowRejectDialog(false);
      } catch (error: any) {
        showNotification(error.message || 'Rejection failed', 'error');
      }
      return;
    }

    // Fallback: Direct workflow service call (if parent doesn't provide handler)
    if (!existingReading?.id || !currentEmployeeId) {
      showNotification('Reading ID or employee ID is missing', 'error');
      return;
    }
    
    try {
      setLocalLoading(true);
      
      await ReadingWorkflowService.reject(
        existingReading.id,
        currentEmployeeId,
        validationNotes.trim()
      );
      
      setShowRejectDialog(false);
      showNotification('Reading rejected successfully', 'success');
      
      // Give time for notification before navigation
      setTimeout(() => {
        window.location.href = '/flow/monitoring';
      }, 1500);
    } catch (error: any) {
      console.error('Rejection failed:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Rejection failed',
        'error'
      );
    } finally {
      setLocalLoading(false);
    }
  };
  
  const pressureStatus = getValueStatus(formData.pressure, threshold?.pressureMin, threshold?.pressureMax);
  const temperatureStatus = getValueStatus(formData.temperature, threshold?.temperatureMin, threshold?.temperatureMax);
  const flowRateStatus = getValueStatus(formData.flowRate, threshold?.flowRateMin, threshold?.flowRateMax);
  const containedVolumeStatus = getValueStatus(formData.containedVolume, threshold?.containedVolumeMin, threshold?.containedVolumeMax);
  
  const hasAnyBreach = 
    pressureStatus.color === 'error' || 
    temperatureStatus.color === 'error' || 
    flowRateStatus.color === 'error' ||
    containedVolumeStatus.color === 'error';
  
  const loading = isLoading || localLoading;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isValidationMode ? 'Validate Reading' : 'Review & Submit'}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {isValidationMode 
          ? 'Review the reading details and approve or reject.'
          : 'Please review all entered values before submitting.'}
      </Typography>
      
      {hasAnyBreach && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Threshold Breach Detected</AlertTitle>
          One or more values are outside the configured threshold range. This will trigger an automatic alert.
          Please verify the readings are accurate before submitting.
        </Alert>
      )}
      
      {/* Reading Information */}
      {existingReading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Reading Information</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Reading ID</Typography>
                <Typography variant="body2">#{existingReading.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip 
                  label={existingReading.validationStatus?.designationEn || 'Unknown'} 
                  size="small"
                  color={existingReading.validationStatus?.code === 'VALIDATED' ? 'success' : 'warning'}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Recorded By</Typography>
                <Typography variant="body2">
                  {getEmployeeName(existingReading.recordedBy)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Recorded At</Typography>
                <Typography variant="body2">
                  {formatDateTime(existingReading.recordedAt || new Date())}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Measurement Values */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Measurements</Typography>
          <Divider sx={{ my: 1 }} />
          
          <Grid container spacing={3}>
            {/* Pressure */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    Pressure
                  </Typography>
                  <Box sx={{ color: `${pressureStatus.color}.main` }}>
                    {pressureStatus.icon}
                  </Box>
                </Box>
                <Typography variant="h6">{formatValue(formData.pressure, 'bar')}</Typography>
                {threshold && (
                  <Typography variant="caption" color="text.secondary">
                    Range: {threshold.pressureMin} - {threshold.pressureMax} bar
                  </Typography>
                )}
                <Chip 
                  label={pressureStatus.text} 
                  size="small" 
                  color={pressureStatus.color}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            {/* Temperature */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    Temperature
                  </Typography>
                  <Box sx={{ color: `${temperatureStatus.color}.main` }}>
                    {temperatureStatus.icon}
                  </Box>
                </Box>
                <Typography variant="h6">{formatValue(formData.temperature, '°C')}</Typography>
                {threshold && (
                  <Typography variant="caption" color="text.secondary">
                    Range: {threshold.temperatureMin} - {threshold.temperatureMax} °C
                  </Typography>
                )}
                <Chip 
                  label={temperatureStatus.text} 
                  size="small" 
                  color={temperatureStatus.color}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            {/* Flow Rate */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    Flow Rate
                  </Typography>
                  <Box sx={{ color: `${flowRateStatus.color}.main` }}>
                    {flowRateStatus.icon}
                  </Box>
                </Box>
                <Typography variant="h6">{formatValue(formData.flowRate, 'm³/h')}</Typography>
                {threshold && (
                  <Typography variant="caption" color="text.secondary">
                    Range: {threshold.flowRateMin} - {threshold.flowRateMax} m³/h
                  </Typography>
                )}
                <Chip 
                  label={flowRateStatus.text} 
                  size="small" 
                  color={flowRateStatus.color}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            {/* Contained Volume */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    Contained Volume
                  </Typography>
                  <Box sx={{ color: `${containedVolumeStatus.color}.main` }}>
                    {containedVolumeStatus.icon}
                  </Box>
                </Box>
                <Typography variant="h6">{formatValue(formData.containedVolume, 'm³')}</Typography>
                {threshold && (
                  <Typography variant="caption" color="text.secondary">
                    Range: {threshold.containedVolumeMin} - {threshold.containedVolumeMax} m³
                  </Typography>
                )}
                <Chip 
                  label={containedVolumeStatus.text} 
                  size="small" 
                  color={containedVolumeStatus.color}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            {/* Recording Time */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Recording Time
              </Typography>
              <Typography variant="body1">
                {formatDateTime(formData.recordedAt || new Date())}
              </Typography>
            </Grid>
            
            {/* Notes */}
            {formData.notes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formData.notes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      {/* Validation Actions (only in validation mode) */}
      {isValidationMode && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Validation Decision</Typography>
            <Divider sx={{ my: 1 }} />
            
            <TextField
              label="Validation Notes (Optional for approval, required for rejection)"
              multiline
              rows={4}
              fullWidth
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder="Add comments about this reading or reasons for rejection..."
              helperText="Minimum 5 characters required for rejection"
              disabled={loading}
              error={showRejectDialog && validationNotes.trim().length > 0 && validationNotes.trim().length < 5}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                onClick={handleValidate}
                disabled={loading}
                size="large"
              >
                Approve Reading
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => setShowRejectDialog(true)}
                disabled={loading}
                size="large"
              >
                Reject Reading
              </Button>
              {onNavigateToEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onNavigateToEdit}
                  disabled={loading}
                >
                  Modify Values
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Reject Confirmation Dialog */}
      <Dialog 
        open={showRejectDialog} 
        onClose={() => !loading && setShowRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this reading?
            {!validationNotes.trim() && ' Please provide a reason for rejection in the notes field.'}
            {validationNotes.trim().length > 0 && validationNotes.trim().length < 5 && ' Reason must be at least 5 characters.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowRejectDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={validationNotes.trim().length < 5 || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            Reject Reading
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