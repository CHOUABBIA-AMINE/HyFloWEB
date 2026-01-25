/**
 * PipelineSelection Component
 * 
 * Allows users to select a pipeline from those available in their structure.
 * Displays latest reading as reference and loads threshold data.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React, { useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import {
  Form,
  Select,
  Alert,
  Descriptions,
  Card,
  Tag,
  Spin,
  Empty,
} from 'antd';
import {
  PipelineOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { FlowThresholdService } from '@/modules/flow/core/services/FlowThresholdService';

import { formatDateTime, formatPressure, formatTemperature, formatFlowRate } from '@/modules/flow/core/utils';

import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

interface PipelineSelectionProps {
  control: Control<any>;
  currentUser: EmployeeDTO;
  selectedPipelineId?: number;
  onThresholdLoad: (threshold?: FlowThresholdDTO) => void;
}

export const PipelineSelection: React.FC<PipelineSelectionProps> = ({
  control,
  currentUser,
  selectedPipelineId,
  onThresholdLoad,
}) => {
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);
  const [latestReading, setLatestReading] = useState<FlowReadingDTO>();
  const [loadingReading, setLoadingReading] = useState(false);
  const [threshold, setThreshold] = useState<FlowThresholdDTO>();
  
  // Load pipelines on mount
  useEffect(() => {
    loadPipelines();
  }, [currentUser]);
  
  // Load reading and threshold when pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      loadLatestReading(selectedPipelineId);
      loadThreshold(selectedPipelineId);
    } else {
      setLatestReading(undefined);
      setThreshold(undefined);
      onThresholdLoad(undefined);
    }
  }, [selectedPipelineId]);
  
  const loadPipelines = async () => {
    try {
      setLoadingPipelines(true);
      
      // Get pipelines for user's structure
      const allPipelines = await PipelineService.getByStructure(currentUser.structureId);
      
      // Filter active pipelines only
      const activePipelines = allPipelines.filter(p => p.active);
      
      setPipelines(activePipelines);
    } catch (error: any) {
      console.error('Error loading pipelines:', error);
      setPipelines([]);
    } finally {
      setLoadingPipelines(false);
    }
  };
  
  const loadLatestReading = async (pipelineId: number) => {
    try {
      setLoadingReading(true);
      const reading = await FlowReadingService.getLatestByPipeline(pipelineId);
      setLatestReading(reading);
    } catch (error: any) {
      // No previous readings - this is okay
      setLatestReading(undefined);
    } finally {
      setLoadingReading(false);
    }
  };
  
  const loadThreshold = async (pipelineId: number) => {
    try {
      const thresholds = await FlowThresholdService.getActiveByPipeline(pipelineId);
      
      if (thresholds && thresholds.length > 0) {
        // Use the first active threshold
        const activeThreshold = thresholds[0];
        setThreshold(activeThreshold);
        onThresholdLoad(activeThreshold);
      } else {
        setThreshold(undefined);
        onThresholdLoad(undefined);
      }
    } catch (error: any) {
      console.error('Error loading threshold:', error);
      setThreshold(undefined);
      onThresholdLoad(undefined);
    }
  };
  
  return (
    <div>
      <Form layout="vertical">
        <Controller
          name="pipelineId"
          control={control}
          rules={{ required: 'Pipeline selection is required' }}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Pipeline"
              required
              validateStatus={fieldState.error ? 'error' : ''}
              help={fieldState.error?.message}
              extra="Select the pipeline where measurements were taken"
            >
              <Select
                {...field}
                showSearch
                placeholder="Select a pipeline"
                loading={loadingPipelines}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={pipelines.map(p => ({
                  value: p.id,
                  label: `${p.code} - ${p.designation}`,
                  extra: p.product?.designation,
                }))}
                size="large"
                suffixIcon={<PipelineOutlined />}
              />
            </Form.Item>
          )}
        />
      </Form>
      
      {/* Show threshold information */}
      {selectedPipelineId && threshold && (
        <Alert
          message="Threshold Configuration Active"
          description={
            <div>
              <p>This pipeline has active thresholds configured:</p>
              <ul style={{ marginBottom: 0 }}>
                <li>Pressure: {threshold.pressureMin} - {threshold.pressureMax} bar</li>
                <li>Temperature: {threshold.temperatureMin} - {threshold.temperatureMax} °C</li>
                <li>Flow Rate: {threshold.flowRateMin} - {threshold.flowRateMax} m³/h</li>
                <li>Alert Tolerance: {threshold.alertTolerance}%</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Show warning if no threshold */}
      {selectedPipelineId && !threshold && !loadingReading && (
        <Alert
          message="No Active Threshold"
          description="This pipeline does not have an active threshold configured. Real-time validation will be limited to range checks only."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Show latest reading as reference */}
      {selectedPipelineId && loadingReading && (
        <Card title="Latest Reading" loading={true} style={{ marginTop: 16 }} />
      )}
      
      {selectedPipelineId && !loadingReading && latestReading && (
        <Card
          title="Latest Reading (Reference)"
          extra={<Tag color="blue">Reference</Tag>}
          style={{ marginTop: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Recorded At">
              {formatDateTime(latestReading.recordedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Recorded By">
              {latestReading.recordedBy?.firstName} {latestReading.recordedBy?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Pressure">
              {formatPressure(latestReading.pressure)}
            </Descriptions.Item>
            <Descriptions.Item label="Temperature">
              {formatTemperature(latestReading.temperature)}
            </Descriptions.Item>
            <Descriptions.Item label="Flow Rate">
              {formatFlowRate(latestReading.flowRate)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={latestReading.validationStatus?.code === 'VALIDATED' ? 'green' : 'orange'}>
                {latestReading.validationStatus?.designationEn}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          
          {latestReading.notes && (
            <Alert
              message="Previous Notes"
              description={latestReading.notes}
              type="info"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Card>
      )}
      
      {selectedPipelineId && !loadingReading && !latestReading && (
        <Card title="Latest Reading" style={{ marginTop: 16 }}>
          <Empty
            description="No previous readings found for this pipeline"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};
