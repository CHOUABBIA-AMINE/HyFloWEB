/**
 * ValidationReview Component
 * 
 * Displays a comprehensive review of the reading before submission.
 * For validators, provides approve/reject/modify actions.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Row,
  Col,
  Statistic,
  Alert,
  notification,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  WarningOutlined,
  DashboardOutlined,
  FireOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { AuthService } from '@/services/AuthService';
import { formatDateTime } from '@/modules/flow/core/utils';

import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

const { TextArea } = Input;

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
  const [loading, setLoading] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  
  // Check threshold status for each measurement
  const getThresholdStatus = (value: number | undefined, min: number, max: number) => {
    if (value === undefined || value === null) return null;
    
    if (value < min || value > max) {
      return { status: 'breach', color: 'red', icon: <WarningOutlined /> };
    }
    
    // Check tolerance zone
    if (threshold) {
      const range = max - min;
      const toleranceValue = range * (threshold.alertTolerance / 100);
      const minWarning = min + toleranceValue;
      const maxWarning = max - toleranceValue;
      
      if (value <= minWarning || value >= maxWarning) {
        return { status: 'warning', color: 'orange', icon: <WarningOutlined /> };
      }
    }
    
    return { status: 'ok', color: 'green', icon: <CheckCircleOutlined /> };
  };
  
  const handleValidate = async () => {
    try {
      setLoading(true);
      
      if (!existingReading?.id) {
        throw new Error('Reading ID not found');
      }
      
      const currentUser = await AuthService.getCurrentUser();
      
      // Validate reading
      await FlowReadingService.validate(existingReading.id, currentUser.id);
      
      notification.success({
        message: 'Reading Validated',
        description: 'The flow reading has been successfully validated and approved.',
      });
      
      // Navigate to readings list
      navigate('/flow/readings');
      
    } catch (error: any) {
      console.error('Validation error:', error);
      
      if (error.response?.status === 403) {
        notification.error({
          message: 'Authorization Error',
          description: 'You are not authorized to validate this reading.',
        });
      } else {
        notification.error({
          message: 'Validation Failed',
          description: error.message || 'Failed to validate the reading',
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!validationNotes.trim()) {
      notification.warning({
        message: 'Notes Required',
        description: 'Please provide a reason for rejection',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (!existingReading?.id) {
        throw new Error('Reading ID not found');
      }
      
      // Update reading with REJECTED status
      const rejectedReading: FlowReadingDTO = {
        ...existingReading,
        notes: validationNotes,
        validationStatusId: 4, // Assuming REJECTED status ID is 4
      };
      
      await FlowReadingService.update(existingReading.id, rejectedReading);
      
      notification.success({
        message: 'Reading Rejected',
        description: 'The reading has been rejected and returned to the recorder.',
      });
      
      setShowRejectModal(false);
      navigate('/flow/readings');
      
    } catch (error: any) {
      console.error('Rejection error:', error);
      notification.error({
        message: 'Rejection Failed',
        description: error.message || 'Failed to reject the reading',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Check if there are any threshold breaches
  const hasBreaches = threshold && (
    (formData.pressure !== undefined && (formData.pressure < threshold.pressureMin || formData.pressure > threshold.pressureMax)) ||
    (formData.temperature !== undefined && (formData.temperature < threshold.temperatureMin || formData.temperature > threshold.temperatureMax)) ||
    (formData.flowRate !== undefined && (formData.flowRate < threshold.flowRateMin || formData.flowRate > threshold.flowRateMax))
  );
  
  const pressureStatus = threshold ? getThresholdStatus(formData.pressure, threshold.pressureMin, threshold.pressureMax) : null;
  const temperatureStatus = threshold ? getThresholdStatus(formData.temperature, threshold.temperatureMin, threshold.temperatureMax) : null;
  const flowRateStatus = threshold ? getThresholdStatus(formData.flowRate, threshold.flowRateMin, threshold.flowRateMax) : null;
  
  return (
    <div>
      {/* Alert for threshold breaches */}
      {hasBreaches && (
        <Alert
          message="Threshold Breach Detected"
          description="One or more measurements are outside the configured threshold limits. This reading will generate an alert when saved."
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Reading Summary */}
      <Card title="Reading Summary" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Recording Date & Time">
            {formatDateTime(formData.recordedAt)}
          </Descriptions.Item>
          
          {existingReading && (
            <>
              <Descriptions.Item label="Recorded By">
                {existingReading.recordedBy?.firstName} {existingReading.recordedBy?.lastName}
              </Descriptions.Item>
              
              <Descriptions.Item label="Pipeline">
                {existingReading.pipeline?.code} - {existingReading.pipeline?.designation}
              </Descriptions.Item>
              
              <Descriptions.Item label="Status">
                <Tag color={existingReading.validationStatus?.code === 'VALIDATED' ? 'green' : 'orange'}>
                  {existingReading.validationStatus?.designationEn}
                </Tag>
              </Descriptions.Item>
            </>
          )}
          
          {formData.notes && (
            <Descriptions.Item label="Notes" span={2}>
              {formData.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      
      {/* Measurements Display */}
      <Card title="Measurements" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {/* Pressure */}
          {formData.pressure !== undefined && formData.pressure !== null && (
            <Col span={6}>
              <Card
                size="small"
                style={{
                  borderColor: pressureStatus?.color,
                  backgroundColor: pressureStatus?.status === 'breach' ? '#fff2f0' : pressureStatus?.status === 'warning' ? '#fffbe6' : '#f6ffed',
                }}
              >
                <Statistic
                  title="Pressure"
                  value={formData.pressure}
                  suffix="bar"
                  prefix={<DashboardOutlined style={{ color: pressureStatus?.color }} />}
                  valueStyle={{ color: pressureStatus?.color }}
                />
                {pressureStatus && (
                  <Tag color={pressureStatus.color} icon={pressureStatus.icon} style={{ marginTop: 8 }}>
                    {pressureStatus.status.toUpperCase()}
                  </Tag>
                )}
              </Card>
            </Col>
          )}
          
          {/* Temperature */}
          {formData.temperature !== undefined && formData.temperature !== null && (
            <Col span={6}>
              <Card
                size="small"
                style={{
                  borderColor: temperatureStatus?.color,
                  backgroundColor: temperatureStatus?.status === 'breach' ? '#fff2f0' : temperatureStatus?.status === 'warning' ? '#fffbe6' : '#f6ffed',
                }}
              >
                <Statistic
                  title="Temperature"
                  value={formData.temperature}
                  suffix="°C"
                  prefix={<FireOutlined style={{ color: temperatureStatus?.color }} />}
                  valueStyle={{ color: temperatureStatus?.color }}
                />
                {temperatureStatus && (
                  <Tag color={temperatureStatus.color} icon={temperatureStatus.icon} style={{ marginTop: 8 }}>
                    {temperatureStatus.status.toUpperCase()}
                  </Tag>
                )}
              </Card>
            </Col>
          )}
          
          {/* Flow Rate */}
          {formData.flowRate !== undefined && formData.flowRate !== null && (
            <Col span={6}>
              <Card
                size="small"
                style={{
                  borderColor: flowRateStatus?.color,
                  backgroundColor: flowRateStatus?.status === 'breach' ? '#fff2f0' : flowRateStatus?.status === 'warning' ? '#fffbe6' : '#f6ffed',
                }}
              >
                <Statistic
                  title="Flow Rate"
                  value={formData.flowRate}
                  suffix="m³/h"
                  prefix={<ThunderboltOutlined style={{ color: flowRateStatus?.color }} />}
                  valueStyle={{ color: flowRateStatus?.color }}
                />
                {flowRateStatus && (
                  <Tag color={flowRateStatus.color} icon={flowRateStatus.icon} style={{ marginTop: 8 }}>
                    {flowRateStatus.status.toUpperCase()}
                  </Tag>
                )}
              </Card>
            </Col>
          )}
          
          {/* Volume */}
          {formData.containedVolume !== undefined && formData.containedVolume !== null && (
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Contained Volume"
                  value={formData.containedVolume}
                  suffix="m³"
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
          )}
        </Row>
      </Card>
      
      {/* Threshold Configuration */}
      {threshold && (
        <Card title="Configured Thresholds" style={{ marginBottom: 16 }}>
          <Descriptions column={3} size="small">
            <Descriptions.Item label="Pressure Range">
              {threshold.pressureMin} - {threshold.pressureMax} bar
            </Descriptions.Item>
            <Descriptions.Item label="Temperature Range">
              {threshold.temperatureMin} - {threshold.temperatureMax} °C
            </Descriptions.Item>
            <Descriptions.Item label="Flow Rate Range">
              {threshold.flowRateMin} - {threshold.flowRateMax} m³/h
            </Descriptions.Item>
            <Descriptions.Item label="Alert Tolerance" span={3}>
              {threshold.alertTolerance}%
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      
      {/* Validator Actions */}
      {isValidationMode && existingReading && (
        <Card title="Validation Actions">
          <Alert
            message="Validator Review"
            description="Review the reading carefully. You can approve, reject, or modify the values if corrections are needed."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Space size="middle">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleValidate}
              loading={loading}
              size="large"
            >
              Approve Reading
            </Button>
            
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setShowRejectModal(true)}
              size="large"
            >
              Reject Reading
            </Button>
            
            <Button
              icon={<EditOutlined />}
              onClick={() => setShowModifyModal(true)}
              size="large"
            >
              Modify Values
            </Button>
          </Space>
        </Card>
      )}
      
      {/* Reject Modal */}
      <Modal
        title="Reject Reading"
        open={showRejectModal}
        onOk={handleReject}
        onCancel={() => setShowRejectModal(false)}
        okText="Reject"
        okButtonProps={{ danger: true, loading }}
      >
        <Alert
          message="Rejection Reason Required"
          description="Please provide a detailed reason for rejecting this reading. This will help the recorder understand what needs to be corrected."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <TextArea
          rows={4}
          value={validationNotes}
          onChange={(e) => setValidationNotes(e.target.value)}
          placeholder="Explain why this reading is being rejected..."
          maxLength={500}
          showCount
        />
      </Modal>
      
      {/* Modify Modal */}
      <Modal
        title="Modify Reading Values"
        open={showModifyModal}
        onCancel={() => setShowModifyModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModifyModal(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              notification.info({
                message: 'Feature Coming Soon',
                description: 'Value modification will be available in the next update.',
              });
              setShowModifyModal(false);
            }}
          >
            Save Changes
          </Button>,
        ]}
      >
        <Alert
          message="Modify with Caution"
          description="Only modify values if there is a clear error. All modifications will be logged in the audit trail."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <p>Value modification interface will be implemented here.</p>
      </Modal>
    </div>
  );
};
