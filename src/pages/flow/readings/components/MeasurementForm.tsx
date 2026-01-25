/**
 * MeasurementForm Component
 * 
 * Form for entering flow measurements with real-time threshold validation.
 * Provides visual feedback for each measurement against configured thresholds.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import {
  Form,
  InputNumber,
  DatePicker,
  Input,
  Row,
  Col,
  Card,
  Divider,
  Alert,
} from 'antd';
import {
  DashboardOutlined,
  FireOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { ThresholdIndicator } from './ThresholdIndicator';

import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

const { TextArea } = Input;

interface MeasurementFormProps {
  control: Control<any>;
  errors: FieldErrors;
  pipelineId: number;
  threshold?: FlowThresholdDTO;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  control,
  errors,
  pipelineId,
  threshold,
}) => {
  
  return (
    <div>
      <Alert
        message="Measurement Entry"
        description="Enter the measured values. Values will be validated against configured thresholds in real-time. At least one measurement must be provided."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <Form layout="vertical">
        {/* Recording Date/Time */}
        <Card title="Recording Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Controller
                name="recordedAt"
                control={control}
                rules={{
                  required: 'Recording date and time is required',
                  validate: (value) => {
                    const recordedDate = new Date(value);
                    const now = new Date();
                    if (recordedDate > now) {
                      return 'Recording time cannot be in the future';
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label="Recording Date & Time"
                    required
                    validateStatus={fieldState.error ? 'error' : ''}
                    help={fieldState.error?.message}
                  >
                    <DatePicker
                      {...field}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString())}
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }}
                      size="large"
                      suffixIcon={<ClockCircleOutlined />}
                      placeholder="Select date and time"
                    />
                  </Form.Item>
                )}
              />
            </Col>
          </Row>
        </Card>
        
        {/* Measurements */}
        <Card title="Measurements" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {/* Pressure */}
            <Col span={12}>
              <Controller
                name="pressure"
                control={control}
                rules={{
                  min: { value: 0, message: 'Pressure cannot be negative' },
                  max: { value: 500, message: 'Pressure exceeds maximum (500 bar)' },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Form.Item
                      label={
                        <span>
                          <DashboardOutlined style={{ marginRight: 8 }} />
                          Pressure
                        </span>
                      }
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <InputNumber
                        {...field}
                        addonAfter="bar"
                        placeholder="Enter pressure"
                        style={{ width: '100%' }}
                        size="large"
                        precision={2}
                        min={0}
                        max={500}
                      />
                    </Form.Item>
                    
                    {/* Threshold indicator */}
                    {field.value !== undefined && field.value !== null && threshold && (
                      <ThresholdIndicator
                        value={field.value}
                        min={threshold.pressureMin}
                        max={threshold.pressureMax}
                        tolerance={threshold.alertTolerance}
                        unit="bar"
                        label="Pressure"
                      />
                    )}
                  </div>
                )}
              />
            </Col>
            
            {/* Temperature */}
            <Col span={12}>
              <Controller
                name="temperature"
                control={control}
                rules={{
                  min: { value: -50, message: 'Temperature below minimum (-50°C)' },
                  max: { value: 200, message: 'Temperature exceeds maximum (200°C)' },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Form.Item
                      label={
                        <span>
                          <FireOutlined style={{ marginRight: 8 }} />
                          Temperature
                        </span>
                      }
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <InputNumber
                        {...field}
                        addonAfter="°C"
                        placeholder="Enter temperature"
                        style={{ width: '100%' }}
                        size="large"
                        precision={2}
                        min={-50}
                        max={200}
                      />
                    </Form.Item>
                    
                    {/* Threshold indicator */}
                    {field.value !== undefined && field.value !== null && threshold && (
                      <ThresholdIndicator
                        value={field.value}
                        min={threshold.temperatureMin}
                        max={threshold.temperatureMax}
                        tolerance={threshold.alertTolerance}
                        unit="°C"
                        label="Temperature"
                      />
                    )}
                  </div>
                )}
              />
            </Col>
            
            {/* Flow Rate */}
            <Col span={12}>
              <Controller
                name="flowRate"
                control={control}
                rules={{
                  min: { value: 0, message: 'Flow rate must be zero or positive' },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Form.Item
                      label={
                        <span>
                          <ThunderboltOutlined style={{ marginRight: 8 }} />
                          Flow Rate
                        </span>
                      }
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <InputNumber
                        {...field}
                        addonAfter="m³/h"
                        placeholder="Enter flow rate"
                        style={{ width: '100%' }}
                        size="large"
                        precision={2}
                        min={0}
                      />
                    </Form.Item>
                    
                    {/* Threshold indicator */}
                    {field.value !== undefined && field.value !== null && threshold && (
                      <ThresholdIndicator
                        value={field.value}
                        min={threshold.flowRateMin}
                        max={threshold.flowRateMax}
                        tolerance={threshold.alertTolerance}
                        unit="m³/h"
                        label="Flow Rate"
                      />
                    )}
                  </div>
                )}
              />
            </Col>
            
            {/* Contained Volume */}
            <Col span={12}>
              <Controller
                name="containedVolume"
                control={control}
                rules={{
                  min: { value: 0, message: 'Volume must be zero or positive' },
                }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label={
                      <span>
                        <DatabaseOutlined style={{ marginRight: 8 }} />
                        Contained Volume
                      </span>
                    }
                    validateStatus={fieldState.error ? 'error' : ''}
                    help={fieldState.error?.message}
                  >
                    <InputNumber
                      {...field}
                      addonAfter="m³"
                      placeholder="Enter volume"
                      style={{ width: '100%' }}
                      size="large"
                      precision={2}
                      min={0}
                    />
                  </Form.Item>
                )}
              />
            </Col>
          </Row>
        </Card>
        
        {/* Notes */}
        <Card title="Additional Information">
          <Controller
            name="notes"
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: 'Notes must not exceed 500 characters',
              },
            }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Notes"
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error?.message}
                extra={`${field.value?.length || 0} / 500 characters`}
              >
                <TextArea
                  {...field}
                  rows={4}
                  placeholder="Enter any relevant notes or observations about this reading..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            )}
          />
        </Card>
      </Form>
    </div>
  );
};
