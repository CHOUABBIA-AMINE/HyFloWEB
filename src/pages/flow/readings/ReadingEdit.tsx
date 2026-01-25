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
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Card,
  Steps,
  Button,
  Space,
  notification,
  Spin,
  Result,
  Modal,
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

import { PipelineSelection } from './components/PipelineSelection';
import { MeasurementForm } from './components/MeasurementForm';
import { ValidationReview } from './components/ValidationReview';

import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { ValidationStatusService } from '@/modules/flow/common/services/ValidationStatusService';
import { AuthService } from '@/services/AuthService';

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

const { Step } = Steps;

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
  const [currentUser, setCurrentUser] = useState<EmployeeDTO>();
  const [existingReading, setExistingReading] = useState<FlowReadingDTO>();
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatusDTO[]>([]);
  const [selectedThreshold, setSelectedThreshold] = useState<FlowThresholdDTO>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
      
      // Load current user
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
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
      notification.error({
        message: 'Error Loading Data',
        description: error.message || 'Failed to load required data',
      });
      navigate('/flow/readings');
    } finally {
      setLoadingData(false);
    }
  };
  
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0 && !watchedPipelineId) {
      notification.warning({
        message: 'Pipeline Required',
        description: 'Please select a pipeline before continuing',
      });
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
        notification.warning({
          message: 'Measurements Required',
          description: 'Please provide at least one measurement value',
        });
        return;
      }
      
      // Get validation status
      const statusCode = submitForValidation ? 'PENDING' : 'DRAFT';
      const validationStatus = validationStatuses.find(s => s.code === statusCode);
      
      if (!validationStatus) {
        throw new Error('Validation status not found');
      }
      
      // Prepare DTO
      const readingDTO: FlowReadingDTO = {
        ...data,
        recordedById: currentUser!.id,
        validationStatusId: validationStatus.id!,
        pipelineId: data.pipelineId!,
      };
      
      // Save reading
      let savedReading: FlowReadingDTO;
      if (mode === 'edit' && id) {
        savedReading = await FlowReadingService.update(Number(id), readingDTO);
        notification.success({
          message: 'Reading Updated',
          description: 'Flow reading has been successfully updated',
        });
      } else {
        savedReading = await FlowReadingService.create(readingDTO);
        notification.success({
          message: 'Reading Created',
          description: submitForValidation 
            ? 'Reading saved and submitted for validation'
            : 'Reading saved as draft',
        });
      }
      
      // Check for alerts
      if (savedReading.id) {
        // Note: Alerts are created automatically by backend
        // Could fetch and display them here if needed
      }
      
      setHasUnsavedChanges(false);
      
      // Navigate to detail page
      setTimeout(() => {
        navigate(`/flow/readings/${savedReading.id}`);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error saving reading:', error);
      
      if (error.response?.status === 400) {
        notification.error({
          message: 'Validation Error',
          description: error.response.data.message || 'Please check your input values',
        });
      } else if (error.response?.status === 403) {
        notification.error({
          message: 'Authorization Error',
          description: 'You are not authorized to record readings for this pipeline',
        });
      } else if (error.response?.status === 409) {
        notification.error({
          message: 'Duplicate Reading',
          description: 'A reading already exists for this pipeline at this time',
        });
      } else {
        notification.error({
          message: 'Error Saving Reading',
          description: error.message || 'An unexpected error occurred',
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveDraft = () => {
    handleSubmit(data => onSubmit(data, false))();
  };
  
  const handleSubmitForValidation = () => {
    handleSubmit(data => onSubmit(data, true))();
  };
  
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to leave?',
        okText: 'Leave',
        okType: 'danger',
        cancelText: 'Stay',
        onOk: () => navigate('/flow/readings'),
      });
    } else {
      navigate('/flow/readings');
    }
  };
  
  if (loadingData) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" tip="Loading reading data..." />
          </div>
        </Card>
      </PageContainer>
    );
  }
  
  if (!currentUser) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="Authentication Required"
          subTitle="Please log in to access this page"
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          }
        />
      </PageContainer>
    );
  }
  
  const steps = [
    {
      title: 'Select Pipeline',
      description: 'Choose pipeline',
    },
    {
      title: 'Enter Measurements',
      description: 'Record values',
    },
    {
      title: 'Review & Submit',
      description: 'Verify data',
    },
  ];
  
  return (
    <PageContainer
      title={mode === 'create' ? 'New Flow Reading' : mode === 'edit' ? 'Edit Flow Reading' : 'Validate Reading'}
      breadcrumb={{
        items: [
          { title: 'Home', path: '/' },
          { title: 'Flow Management', path: '/flow' },
          { title: 'Readings', path: '/flow/readings' },
          { title: mode === 'create' ? 'New' : mode === 'edit' ? 'Edit' : 'Validate' },
        ],
      }}
      extra={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
      ]}
    >
      <Card>
        {mode !== 'validate' && (
          <>
            <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
            
            <div style={{ minHeight: 400 }}>
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
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <Space>
                {currentStep === 2 && (
                  <>
                    <Button
                      icon={<SaveOutlined />}
                      onClick={handleSaveDraft}
                      loading={loading}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmitForValidation}
                      loading={loading}
                    >
                      Submit for Validation
                    </Button>
                  </>
                )}
                
                {currentStep < 2 && (
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Space>
            </div>
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
      </Card>
    </PageContainer>
  );
};
