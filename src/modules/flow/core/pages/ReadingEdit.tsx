/**
 * ReadingEdit Page - Flow Reading Entry and Validation
 * 
 * Multi-step form for creating/editing flow readings with:
 * - Pipeline selection (structure-based filtering)
 * - Real-time measurement validation
 * - Threshold comparison and alerts
 * - Validation workflow support
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 01-25-2026 - Fixed: Use UserService.getByUsername() instead of AuthService.getCurrentUser()
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import { PipelineSelection } from './components/PipelineSelection';
import { MeasurementForm } from './components/MeasurementForm';
import { ValidationReview } from './components/ValidationReview';

import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { ValidationStatusService } from '@/modules/flow/common/services/ValidationStatusService';
import UserService from '@/modules/system/security/services/UserService';
import { getUsernameFromToken } from '@/shared/utils/jwtUtils';

import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { ValidationStatusDTO } from '@/modules/flow/common/dto/ValidationStatusDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

interface ReadingFormData {
  pipelineId?: number;
  recordedAt: string;
  pressure?: number;
  temperature?: number;
  flowRate?: number;
  containedVolume?: number;
  notes?: string;
}

interface ReadingEditProps {
  mode: 'create' | 'edit' | 'validate';
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const steps = [
  'Select Pipeline',
  'Enter Measurements',
  'Review & Submit',
];

export const ReadingEdit: React.FC<ReadingEditProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Form state
  const { control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<ReadingFormData>({
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
      pressure: undefined,
      temperature: undefined,
      flowRate: undefined,
      containedVolume: undefined,
      notes: '',
    },
  });
  
  // Component state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode !== 'create');
  const [currentUser, setCurrentUser] = useState<EmployeeDTO | null>(null);
  const [existingReading, setExistingReading] = useState<FlowReadingDTO | null>(null);
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatusDTO[]>([]);
  const [selectedThreshold, setSelectedThreshold] = useState<FlowThresholdDTO | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Watch form changes
  const watchedPipelineId = watch('pipelineId');
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [id]);
  
  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);
  
  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Load current user using JWT token
      const username = getUsernameFromToken();
      if (!username) {
        throw new Error('No username found in token. Please log in again.');
      }
      
      // Fetch user data from backend using /user/username/{username}
      const userData = await UserService.getByUsername(username);
      
      // Extract employee from user data
      if (userData.employee) {
        setCurrentUser(userData.employee);
      } else {
        throw new Error('Employee data not found for current user');
      }
      
      // Load validation statuses
      const statuses = await ValidationStatusService.getAllNoPagination();
      setValidationStatuses(statuses);
      
      // Load existing reading if edit/validate mode
      if ((mode === 'edit' || mode === 'validate') && id) {
        const reading = await FlowReadingService.getById(Number(id));
        setExistingReading(reading);
        
        // Populate form
        setValue('pipelineId', reading.pipelineId);
        setValue('recordedAt', reading.recordedAt);
        setValue('pressure', reading.pressure);
        setValue('temperature', reading.temperature);
        setValue('flowRate', reading.flowRate);
        setValue('containedVolume', reading.containedVolume);
        setValue('notes', reading.notes || '');
        
        // If validation mode, skip to review step
        if (mode === 'validate') {
          setCurrentStep(2);
        }
      }
    } catch (error: any) {
      showNotification(
        error.message || 'Failed to load required data',
        'error'
      );
      // Don't navigate away, let user see the error
    } finally {
      setLoadingData(false);
    }
  };
  
  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };
  
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0 && !watchedPipelineId) {
      showNotification('Please select a pipeline before continuing', 'warning');
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const onSubmit = async (data: ReadingFormData, submitForValidation: boolean = false) => {
    try {
      setLoading(true);
      
      // Validate at least one measurement is provided
      if (!data.pressure && !data.temperature && !data.flowRate && !data.containedVolume) {
        showNotification('Please provide at least one measurement value', 'warning');
        return;
      }
      
      if (!currentUser?.id) {
        showNotification('User information not available', 'error');
        return;
      }
      
      // Get validation status
      const statusCode = submitForValidation ? 'PENDING' : 'DRAFT';
      const validationStatus = validationStatuses.find(s => s.code === statusCode);
      
      if (!validationStatus?.id) {
        throw new Error('Validation status not found');
      }
      
      // Prepare DTO
      const readingDTO: FlowReadingDTO = {
        ...data,
        recordedById: currentUser.id,
        validationStatusId: validationStatus.id,
        pipelineId: data.pipelineId!,
      };
      
      // Save reading
      let savedReading: FlowReadingDTO;
      if (mode === 'edit' && id) {
        savedReading = await FlowReadingService.update(Number(id), readingDTO);
        showNotification('Flow reading has been successfully updated', 'success');
      } else {
        savedReading = await FlowReadingService.create(readingDTO);
        showNotification(
          submitForValidation 
            ? 'Reading saved and submitted for validation'
            : 'Reading saved as draft',
          'success'
        );
      }
      
      setHasUnsavedChanges(false);
      
      // Navigate to list page
      setTimeout(() => {
        navigate('/flow/readings');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error saving reading:', error);
      
      if (error.response?.status === 400) {
        showNotification(
          error.response.data.message || 'Please check your input values',
          'error'
        );
      } else if (error.response?.status === 403) {
        showNotification(
          'You are not authorized to record readings for this pipeline',
          'error'
        );
      } else if (error.response?.status === 409) {
        showNotification(
          'A reading already exists for this pipeline at this time',
          'error'
        );
      } else {
        showNotification(
          error.message || 'An unexpected error occurred',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveDraft = () => {
    handleSubmit((data: ReadingFormData) => onSubmit(data, false))();
  };
  
  const handleSubmitForValidation = () => {
    handleSubmit((data: ReadingFormData) => onSubmit(data, true))();
  };
  
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/flow/readings');
    }
  };
  
  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/flow/readings');
  };
  
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading reading data...</Typography>
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
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {mode === 'create' ? 'New Flow Reading' : mode === 'edit' ? 'Edit Flow Reading' : 'Validate Reading'}
      </Typography>
      
      <Card>
        <CardContent>
          {mode !== 'validate' && (
            <>
              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box sx={{ minHeight: 400 }}>
                {currentStep === 0 && (
                  <PipelineSelection
                    control={control}
                    currentUser={currentUser}
                    selectedPipelineId={watchedPipelineId}
                    onThresholdLoad={setSelectedThreshold}
                  />
                )}
                
                {currentStep === 1 && watchedPipelineId && (
                  <MeasurementForm
                    control={control}
                    errors={errors}
                    pipelineId={watchedPipelineId}
                    threshold={selectedThreshold}
                  />
                )}
                
                {currentStep === 2 && (
                  <ValidationReview
                    formData={watch()}
                    threshold={selectedThreshold}
                    pipelineId={watchedPipelineId}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {currentStep === 2 && (
                    <>
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={handleSaveDraft}
                        disabled={loading}
                        variant="outlined"
                      >
                        Save as Draft
                      </Button>
                      <Button
                        startIcon={<SendIcon />}
                        onClick={handleSubmitForValidation}
                        disabled={loading}
                        variant="contained"
                        color="primary"
                      >
                        Submit for Validation
                      </Button>
                    </>
                  )}
                  
                  {currentStep < 2 && (
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNext}
                      variant="contained"
                      color="primary"
                    >
                      Next
                    </Button>
                  )}
                  
                  <Button onClick={handleCancel} color="error">
                    Cancel
                  </Button>
                </Box>
              </Box>
            </>
          )}
          
          {mode === 'validate' && existingReading && (
            <ValidationReview
              formData={watch()}
              threshold={selectedThreshold}
              pipelineId={watchedPipelineId}
              existingReading={existingReading}
              isValidationMode={true}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Stay</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Leave
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
