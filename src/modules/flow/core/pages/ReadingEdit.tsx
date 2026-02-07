/**
 * ReadingEdit Page - Flow Reading Entry and Validation
 * 
 * Multi-step form for creating/editing flow readings with:
 * - Pipeline selection (structure-based filtering)
 * - Reading date and slot selection
 * - Real-time measurement validation
 * - Threshold comparison and alerts
 * - Validation workflow support
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 02-07-2026 16:30 - Aligned form types with FlowReadingDTO for better type safety
 * @updated 02-07-2026 15:10 - Changed default return path to /flow/monitoring (SlotMonitoring is now primary interface)
 * @updated 02-06-2026 - Fixed: Use designationFr instead of name in ValidationStatusDTO
 * @updated 02-05-2026 - Pass isFromMonitoring flag to MeasurementForm for read-only context
 * @updated 02-05-2026 - Fixed: Use SUBMITTED instead of PENDING for validation status
 * @updated 02-05-2026 - Improved validation status loading and error handling
 * @updated 02-05-2026 - Fixed threshold loading when auto-populating from SlotMonitoring
 * @updated 02-05-2026 - Auto-populate pipeline and context from SlotMonitoring navigation
 * @updated 02-02-2026 - Fixed employee data extraction to work with new UserProfile structure
 * @updated 01-25-2026 - Fixed: Use UserService.getByUsername() instead of AuthService.getCurrentUser()
 * @updated 01-28-2026 - Added reading date and slot support
 * @updated 01-29-2026 - Fixed: Use getCurrentLocalDateTime for correct timezone display
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import { PipelineSelection } from './components/PipelineSelection';
import { MeasurementForm } from './components/MeasurementForm';
import { ValidationReview } from './components/ValidationReview';

import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { FlowThresholdService } from '@/modules/flow/core/services/FlowThresholdService';
import { ValidationStatusService } from '@/modules/flow/common/services/ValidationStatusService';
import UserService from '@/modules/system/security/services/UserService';
import { useAuth } from '@/shared/context/AuthContext';
import { getCurrentLocalDateTime, isoToLocalDateTimeString } from '@/shared/utils/dateTimeLocal';

import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { ValidationStatusDTO } from '@/modules/flow/common/dto/ValidationStatusDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

/**
 * Form data type - Uses FlowReadingDTO as base with form-specific modifications
 * Makes creation fields optional while maintaining DTO structure
 */
type ReadingFormData = Omit<FlowReadingDTO, 'id' | 'recordedById' | 'validationStatusId' | 'recordedBy' | 'validatedBy' | 'validationStatus' | 'pipeline' | 'readingSlot'> & {
  pipelineId: number;
  readingSlotId: number;
  recordedById?: number; // Optional for form, required on submit
  validationStatusId?: number; // Set during submit
};

interface ReadingEditProps {
  mode: 'create' | 'edit' | 'validate';
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Navigation state from SlotMonitoring
 */
interface NavigationState {
  pipelineId?: number;
  pipelineCode?: string;
  pipelineName?: string;
  readingDate?: string;
  slotId?: number;
  structureId?: number;
  returnTo?: string;
}

const steps = [
  'Select Pipeline',
  'Enter Measurements',
  'Review & Submit',
];

export const ReadingEdit: React.FC<ReadingEditProps> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // Use AuthContext to get current user
  
  // Get navigation state from SlotMonitoring
  const navigationState = location.state as NavigationState | undefined;
  const isFromSlotMonitoring = !!navigationState?.pipelineId;
  
  // Form state with DTO-aligned default values
  const { control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<ReadingFormData>({
    defaultValues: {
      pipelineId: undefined as any, // Will be set from navigation or selection
      readingDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
      readingSlotId: undefined as any, // Will be set from slot selection
      recordedAt: getCurrentLocalDateTime(),
      pressure: undefined,
      temperature: undefined,
      flowRate: undefined,
      containedVolume: undefined,
      notes: '',
      validatedAt: undefined,
      validatedById: undefined,
    },
  });
  
  // Component state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode !== 'create');
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeDTO | null>(null);
  const [existingReading, setExistingReading] = useState<FlowReadingDTO | null>(null);
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatusDTO[]>([]);
  const [selectedThreshold, setSelectedThreshold] = useState<FlowThresholdDTO | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Watch form changes
  const watchedPipelineId = watch('pipelineId');
  const watchedReadingSlotId = watch('readingSlotId');
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [id, user]);
  
  // Auto-populate from navigation state (SlotMonitoring context)
  useEffect(() => {
    if (isFromSlotMonitoring && navigationState && mode === 'create') {
      console.log('📍 Auto-populating from SlotMonitoring:', navigationState);
      
      // Set pipeline and context fields
      if (navigationState.pipelineId) {
        setValue('pipelineId', navigationState.pipelineId);
        // Load threshold for the pre-selected pipeline
        loadThreshold(navigationState.pipelineId);
      }
      if (navigationState.readingDate) {
        setValue('readingDate', navigationState.readingDate);
      }
      if (navigationState.slotId) {
        setValue('readingSlotId', navigationState.slotId);
      }
      
      // Skip to measurement step since pipeline is already selected
      setCurrentStep(1);
      
      showNotification(
        `Pipeline ${navigationState.pipelineCode || navigationState.pipelineId} pre-selected from monitoring dashboard`,
        'info'
      );
    }
  }, [isFromSlotMonitoring, navigationState, mode, setValue]);
  
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
      setAuthError(null);
      
      // Check if user is authenticated
      if (!user) {
        setAuthError('Not authenticated. Please log in.');
        setLoadingData(false);
        return;
      }
      
      console.log('Current user from AuthContext:', user);
      
      // Extract employee from user (now embedded in UserProfile)
      if (user.employee) {
        console.log('Employee found:', user.employee);
        setCurrentEmployee(user.employee);
      } else {
        console.warn('No employee associated with user:', user.username);
        setAuthError(
          `Your user account (${user.username}) is not linked to an employee profile. ` +
          'Please contact an administrator to link your account to an employee.'
        );
        setLoadingData(false);
        return;
      }
      
      // Load validation statuses
      console.log('🔄 Loading validation statuses...');
      const statuses = await ValidationStatusService.getAllNoPagination();
      console.log('✅ Validation statuses loaded:', statuses);
      setValidationStatuses(statuses);
      
      // Verify required statuses exist
      const draftStatus = statuses.find(s => s.code === 'DRAFT');
      const submittedStatus = statuses.find(s => s.code === 'SUBMITTED');
      
      if (!draftStatus || !submittedStatus) {
        console.error('❌ Missing required validation statuses:', {
          draft: draftStatus,
          submitted: submittedStatus,
          allStatuses: statuses
        });
        throw new Error(
          'Required validation statuses (DRAFT, SUBMITTED) not found in the system. ' +
          'Please contact an administrator.'
        );
      }
      
      // Load existing reading if edit/validate mode
      if ((mode === 'edit' || mode === 'validate') && id) {
        const reading = await FlowReadingService.getById(Number(id));
        setExistingReading(reading);
        
        // Populate form with existing data (DTO fields match form fields)
        setValue('pipelineId', reading.pipelineId);
        setValue('readingDate', reading.readingDate);
        setValue('readingSlotId', reading.readingSlotId);
        setValue('recordedAt', isoToLocalDateTimeString(reading.recordedAt));
        setValue('pressure', reading.pressure);
        setValue('temperature', reading.temperature);
        setValue('flowRate', reading.flowRate);
        setValue('containedVolume', reading.containedVolume);
        setValue('notes', reading.notes || '');
        setValue('validatedAt', reading.validatedAt || undefined);
        setValue('validatedById', reading.validatedById || undefined);
        
        // Load threshold for existing reading's pipeline
        loadThreshold(reading.pipelineId);
        
        // If validation mode, skip to review step
        if (mode === 'validate') {
          setCurrentStep(2);
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading initial data:', error);
      showNotification(
        error.message || 'Failed to load required data',
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  };
  
  /**
   * Load threshold configuration for a pipeline
   * Called when pipeline is auto-populated from SlotMonitoring
   */
  const loadThreshold = async (pipelineId: number) => {
    try {
      console.log('🎯 Loading threshold for pipeline:', pipelineId);
      
      // Get all thresholds for this pipeline (returns array)
      const thresholds = await FlowThresholdService.getByPipeline(pipelineId);
      
      // Filter for active thresholds and get the first one
      const activeThresholds = thresholds.filter(t => t.active);
      
      if (activeThresholds.length > 0) {
        console.log('✅ Active threshold found:', activeThresholds[0]);
        setSelectedThreshold(activeThresholds[0]);
      } else {
        console.log('⚠️ No active threshold found for pipeline:', pipelineId);
        setSelectedThreshold(undefined);
      }
    } catch (error) {
      console.error('❌ Error loading threshold:', error);
      setSelectedThreshold(undefined);
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
    // Don't allow going back to pipeline selection if coming from SlotMonitoring
    if (currentStep === 1 && isFromSlotMonitoring) {
      showNotification('Pipeline is pre-selected from monitoring dashboard', 'info');
      return;
    }
    
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const onSubmit = async (data: ReadingFormData, submitForValidation: boolean = false) => {
    try {
      setLoading(true);
      
      console.log('💾 Submitting reading data:', { data, submitForValidation });
      
      // Validate required fields
      if (!data.readingDate) {
        showNotification('Reading date is required', 'warning');
        return;
      }
      
      if (!data.readingSlotId) {
        showNotification('Reading slot is required', 'warning');
        return;
      }
      
      // Validate at least one measurement is provided
      if (!data.pressure && !data.temperature && !data.flowRate && !data.containedVolume) {
        showNotification('Please provide at least one measurement value', 'warning');
        return;
      }
      
      if (!currentEmployee?.id) {
        showNotification('Employee information not available', 'error');
        return;
      }
      
      // Get validation status
      // SUBMITTED = ready for validation, DRAFT = work in progress
      const statusCode = submitForValidation ? 'SUBMITTED' : 'DRAFT';
      console.log(`🔍 Looking for validation status: ${statusCode}`);
      console.log('📋 Available statuses:', validationStatuses);
      
      const validationStatus = validationStatuses.find(s => s.code === statusCode);
      
      if (!validationStatus?.id) {
        console.error('❌ Validation status not found:', {
          requestedCode: statusCode,
          availableStatuses: validationStatuses.map(s => ({ 
            id: s.id, 
            code: s.code, 
            designation: s.designationFr // Use designationFr instead of name
          }))
        });
        
        throw new Error(
          `Validation status '${statusCode}' not found. Available statuses: ${validationStatuses.map(s => s.code).join(', ')}. ` +
          'Please refresh the page or contact an administrator.'
        );
      }
      
      console.log('✅ Using validation status:', validationStatus);
      
      // Prepare DTO - all fields from form are DTO-compatible
      const readingDTO: FlowReadingDTO = {
        ...data,
        recordedById: currentEmployee.id,
        validationStatusId: validationStatus.id,
        pipelineId: data.pipelineId,
        readingDate: data.readingDate,
        readingSlotId: data.readingSlotId,
      };
      
      console.log('📦 Prepared DTO:', readingDTO);
      
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
      
      console.log('✅ Reading saved:', savedReading);
      
      setHasUnsavedChanges(false);
      
      // Navigate to return path or default to SlotMonitoring
      setTimeout(() => {
        const returnTo = navigationState?.returnTo || '/flow/monitoring';
        navigate(returnTo);
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Error saving reading:', error);
      
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
          'A reading already exists for this pipeline on this date/slot',
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
      // Return to SlotMonitoring or specified return path
      const returnTo = navigationState?.returnTo || '/flow/monitoring';
      navigate(returnTo);
    }
  };
  
  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    const returnTo = navigationState?.returnTo || '/flow/monitoring';
    navigate(returnTo);
  };
  
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading reading data...</Typography>
      </Box>
    );
  }
  
  // Show authentication error
  if (authError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>Authentication Required</Typography>
          <Typography paragraph>{authError}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/flow/monitoring')}
            >
              Back to Slot Monitoring
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }
  
  // Show error if no employee
  if (!currentEmployee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>Employee Profile Required</Typography>
          <Typography paragraph>
            Your user account is not linked to an employee profile. 
            Readings must be associated with an employee.
          </Typography>
          <Typography paragraph>
            Please contact an administrator to link your account to an employee profile.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/flow/monitoring')}
            sx={{ mt: 1 }}
          >
            Back to Slot Monitoring
          </Button>
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          {mode === 'create' ? 'New Flow Reading' : mode === 'edit' ? 'Edit Flow Reading' : 'Validate Reading'}
        </Typography>
        
        {/* Show context chip if coming from SlotMonitoring */}
        {isFromSlotMonitoring && navigationState && (
          <Chip
            icon={<CheckCircleIcon />}
            label={`Pipeline: ${navigationState.pipelineCode || navigationState.pipelineId}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
      
      <Card>
        <CardContent>
          {mode !== 'validate' && (
            <>
              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      {index === 0 && isFromSlotMonitoring ? `${label} ✓` : label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box sx={{ minHeight: 400 }}>
                {currentStep === 0 && (
                  <PipelineSelection
                    control={control}
                    currentUser={currentEmployee}
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
                    isFromMonitoring={isFromSlotMonitoring}
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
                  disabled={currentStep === 0 || (currentStep === 1 && isFromSlotMonitoring)}
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
