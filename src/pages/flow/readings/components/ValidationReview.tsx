/**
 * ValidationReview Component
 * 
 * Displays a summary of entered measurements for review before submission.
 * In validation mode, allows validators to approve or reject readings.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { AuthService } from '@/services/AuthService';

import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

interface ValidationReviewProps {
  formData: any;
  threshold?: FlowThresholdDTO;
  pipelineId?: number;
  existingReading?: FlowReadingDTO;
  isValidationMode?: boolean;
}

export const ValidationReview: React.FC<ValidationReviewProps> = ({
  formData,
  threshold,
  pipelineId,
  existingReading,
  isValidationMode = false,
}) => {
  const navigate = useNavigate();
  const [validationNotes, setValidationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const formatValue = (value?: number, unit?: string): string => {
    if (value === undefined || value === null) return 'Not recorded';
    return `${value.toFixed(2)} ${unit || ''}`;
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
  
  const handleValidate = async () => {
    if (!existingReading?.id) return;
    
    try {
      setLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      
      // Update reading with validation notes if provided
      if (validationNotes) {
        await FlowReadingService.update(existingReading.id, {
          ...existingReading,
          notes: existingReading.notes 
            ? `${existingReading.notes}\n\nValidation Notes: ${validationNotes}`
            : `Validation Notes: ${validationNotes}`,
        });
      }
      
      // Validate the reading
      await FlowReadingService.validate(existingReading.id, currentUser.id);
      
      alert('Reading validated successfully');
      navigate('/flow/readings');
    } catch (error: any) {
      alert(`Validation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!existingReading?.id) return;
    if (!validationNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update reading status to REJECTED with notes
      // Note: You'll need to add a REJECTED status and implement the reject method
      await FlowReadingService.update(existingReading.id, {
        ...existingReading,
        notes: existingReading.notes 
          ? `${existingReading.notes}\n\nRejection Reason: ${validationNotes}`
          : `Rejection Reason: ${validationNotes}`,
        validationStatusId: 4, // Assuming 4 is REJECTED status ID
      });
      
      setShowRejectDialog(false);
      alert('Reading rejected successfully');
      navigate('/flow/readings');
    } catch (error: any) {
      alert(`Rejection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const pressureStatus = getValueStatus(formData.pressure, threshold?.pressureMin, threshold?.pressureMax);
  const temperatureStatus = getValueStatus(formData.temperature, threshold?.temperatureMin, threshold?.temperatureMax);
  const flowRateStatus = getValueStatus(formData.flowRate, threshold?.flowRateMin, threshold?.flowRateMax);
  
  const hasAnyBreach = 
    pressureStatus.color === 'error' || 
    temperatureStatus.color === 'error' || 
    flowRateStatus.color === 'error';
  
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
                  {existingReading.recordedBy?.firstName} {existingReading.recordedBy?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Recorded At</Typography>
                <Typography variant="body2">{formatDateTime(existingReading.recordedAt)}</Typography>
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
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Contained Volume
                </Typography>
                <Typography variant="h6">{formatValue(formData.containedVolume, 'm³')}</Typography>
              </Box>
            </Grid>
            
            {/* Recording Time */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Recording Time
              </Typography>
              <Typography variant="body1">{formatDateTime(formData.recordedAt)}</Typography>
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
              label="Validation Notes"
              multiline
              rows={4}
              fullWidth
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder="Add comments about this reading or reasons for rejection..."
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleValidate}
                disabled={loading}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => setShowRejectDialog(true)}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/flow/readings/${existingReading?.id}/edit`)}
              >
                Modify Values
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this reading? 
            {!validationNotes.trim() && ' Please provide a reason for rejection in the notes field.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" disabled={!validationNotes.trim() || loading}>
            Reject Reading
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
