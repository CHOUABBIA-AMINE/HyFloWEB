/**
 * OperationValidation Page - Flow Operation Validation
 * 
 * Page for validators to approve or reject pending flow operations.
 * Displays operation details for review and provides validation actions.
 * 
 * Workflow:
 * - PENDING → VALIDATED (approve)
 * - PENDING → REJECTED (reject with reason)
 * 
 * @author CHOUABBIA Amine
 * @created 01-30-2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

import { FlowOperationService } from '../services/FlowOperationService';
import UserService from '@/modules/system/security/services/UserService';
import { getUsernameFromToken } from '@/shared/utils/jwtUtils';

import type { FlowOperationDTO } from '../dto/FlowOperationDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const OperationValidation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Component state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentUser, setCurrentUser] = useState<EmployeeDTO | null>(null);
  const [operation, setOperation] = useState<FlowOperationDTO | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Load initial data
  useEffect(() => {
    if (id) {
      loadOperationData();
    }
  }, [id]);

  const loadOperationData = async () => {
    try {
      setLoadingData(true);

      // Load current user
      const username = getUsernameFromToken();
      if (!username) {
        throw new Error('No username found in token. Please log in again.');
      }

      const userData = await UserService.getByUsername(username);
      if (userData.employee) {
        setCurrentUser(userData.employee);
      } else {
        throw new Error('Employee data not found for current user');
      }

      // Load operation
      const operationData = await FlowOperationService.getById(Number(id));
      setOperation(operationData);

      // Check if operation is in PENDING status
      if (operationData.validationStatus?.code !== 'PENDING') {
        showNotification(
          `This operation is already ${operationData.validationStatus?.code || 'processed'}`,
          'warning'
        );
      }
    } catch (error: any) {
      showNotification(
        error.message || 'Failed to load operation data',
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };

  const handleApprove = async () => {
    if (!currentUser?.id || !id) return;

    try {
      setLoading(true);
      await FlowOperationService.validate(Number(id), currentUser.id);
      showNotification('Operation approved successfully', 'success');

      // Navigate back to list after success
      setTimeout(() => {
        navigate('/flow/operations');
      }, 1500);
    } catch (error: any) {
      console.error('Error approving operation:', error);

      if (error.response?.status === 400) {
        showNotification(
          error.response.data.message || 'Cannot approve this operation',
          'error'
        );
      } else if (error.response?.status === 403) {
        showNotification('You are not authorized to validate operations', 'error');
      } else {
        showNotification(
          error.message || 'Failed to approve operation',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!currentUser?.id || !id) return;

    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection', 'warning');
      return;
    }

    try {
      setLoading(true);
      await FlowOperationService.reject(Number(id), currentUser.id, rejectionReason);
      showNotification('Operation rejected', 'success');

      setShowRejectDialog(false);

      // Navigate back to list after success
      setTimeout(() => {
        navigate('/flow/operations');
      }, 1500);
    } catch (error: any) {
      console.error('Error rejecting operation:', error);

      if (error.response?.status === 400) {
        showNotification(
          error.response.data.message || 'Cannot reject this operation',
          'error'
        );
      } else if (error.response?.status === 403) {
        showNotification('You are not authorized to validate operations', 'error');
      } else {
        showNotification(
          error.message || 'Failed to reject operation',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading operation data...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>Unable to load employee information. Please log in again.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!operation) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Operation Not Found</Typography>
          <Typography>The requested operation could not be loaded.</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/flow/operations')}
            sx={{ mt: 2 }}
          >
            Back to Operations
          </Button>
        </Alert>
      </Box>
    );
  }

  const isPending = operation.validationStatus?.code === 'PENDING';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/flow/operations')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Validate Flow Operation
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Operation Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operation Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Infrastructure
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {operation.infrastructure?.code} - {operation.infrastructure?.name}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Product
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {operation.product?.designationFr}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Operation Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {operation.type?.code}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Operation Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(operation.operationDate).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Volume
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {operation.volume} m³
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Recorded By
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {operation.recordedBy?.firstName} {operation.recordedBy?.lastName}
                  </Typography>
                </Grid>

                {operation.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                      <Typography variant="body2">
                        {operation.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Validation Status Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validation Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Chip
                  label={operation.validationStatus?.code || 'UNKNOWN'}
                  color={
                    operation.validationStatus?.code === 'VALIDATED'
                      ? 'success'
                      : operation.validationStatus?.code === 'PENDING'
                      ? 'warning'
                      : operation.validationStatus?.code === 'REJECTED'
                      ? 'error'
                      : 'default'
                  }
                  sx={{ mb: 2 }}
                />

                {operation.validatedBy && operation.validatedAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Validated By
                    </Typography>
                    <Typography variant="body2">
                      {operation.validatedBy.firstName} {operation.validatedBy.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Validated At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(operation.validatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>

              {isPending && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Validation Actions
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={handleApprove}
                    disabled={loading}
                    sx={{ mb: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={handleRejectClick}
                    disabled={loading}
                  >
                    Reject
                  </Button>
                </Box>
              )}

              {!isPending && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This operation has already been {operation.validationStatus?.code?.toLowerCase()}.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => !loading && setShowRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Operation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting this operation. This will be recorded and visible to the operation recorder.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason *"
            placeholder="Explain why this operation is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${rejectionReason.length}/500 characters`}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={loading || !rejectionReason.trim()}
          >
            Confirm Rejection
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
