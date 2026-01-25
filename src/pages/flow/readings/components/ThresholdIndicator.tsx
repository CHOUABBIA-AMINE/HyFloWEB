/**
 * ThresholdIndicator Component
 * 
 * Visual indicator showing measurement value status relative to thresholds.
 * Provides color-coded feedback and slider visualization.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React from 'react';
import {
  Tag,
  Slider,
  Progress,
  Space,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface ThresholdIndicatorProps {
  value: number;
  min: number;
  max: number;
  tolerance: number; // Percentage (0-50)
  unit: string;
  label: string;
}

type ThresholdStatus = 'ok' | 'warning' | 'breach';

interface StatusInfo {
  status: ThresholdStatus;
  color: string;
  icon: React.ReactNode;
  message: string;
  progressColor: string;
}

export const ThresholdIndicator: React.FC<ThresholdIndicatorProps> = ({
  value,
  min,
  max,
  tolerance,
  unit,
  label,
}) => {
  
  const getStatus = (): StatusInfo => {
    // Critical breach - outside threshold range
    if (value < min || value > max) {
      return {
        status: 'breach',
        color: '#f5222d',
        icon: <ExclamationCircleOutlined />,
        message: value < min 
          ? `BREACH: Below minimum threshold (${min} ${unit})`
          : `BREACH: Above maximum threshold (${max} ${unit})`,
        progressColor: '#f5222d',
      };
    }
    
    // Warning zone - within tolerance range
    const range = max - min;
    const toleranceValue = range * (tolerance / 100);
    const minWarning = min + toleranceValue;
    const maxWarning = max - toleranceValue;
    
    if (value <= minWarning || value >= maxWarning) {
      return {
        status: 'warning',
        color: '#faad14',
        icon: <WarningOutlined />,
        message: value <= minWarning
          ? `WARNING: Near lower threshold limit (${minWarning.toFixed(2)} ${unit})`
          : `WARNING: Near upper threshold limit (${maxWarning.toFixed(2)} ${unit})`,
        progressColor: '#faad14',
      };
    }
    
    // Normal range
    return {
      status: 'ok',
      color: '#52c41a',
      icon: <CheckCircleOutlined />,
      message: `OK: Value within normal operating range`,
      progressColor: '#52c41a',
    };
  };
  
  const statusInfo = getStatus();
  
  // Calculate percentage for progress bar
  const range = max - min;
  const percentage = ((value - min) / range) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Marks for slider
  const marks = {
    [min]: {
      label: <span style={{ fontSize: 12 }}>{min}</span>,
      style: { color: '#666' },
    },
    [max]: {
      label: <span style={{ fontSize: 12 }}>{max}</span>,
      style: { color: '#666' },
    },
  };
  
  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: statusInfo.status === 'breach' ? '#fff2f0' : statusInfo.status === 'warning' ? '#fffbe6' : '#f6ffed',
        border: `1px solid ${statusInfo.color}`,
        borderRadius: 6,
        marginTop: -8,
        marginBottom: 16,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.message}
          </Tag>
          <Text strong style={{ color: statusInfo.color }}>
            {value.toFixed(2)} {unit}
          </Text>
        </div>
        
        {/* Progress bar */}
        <Progress
          percent={clampedPercentage}
          strokeColor={statusInfo.progressColor}
          showInfo={false}
          size="small"
        />
        
        {/* Visual range indicator */}
        <div style={{ marginTop: 8 }}>
          <Slider
            value={value}
            min={min - 10}
            max={max + 10}
            marks={marks}
            disabled
            tooltip={{
              formatter: (val) => `${val?.toFixed(2)} ${unit}`,
            }}
            trackStyle={{ backgroundColor: statusInfo.color }}
            handleStyle={{ borderColor: statusInfo.color }}
          />
        </div>
        
        {/* Threshold info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
          <span>Min: {min} {unit}</span>
          <span>Range: {min} - {max} {unit}</span>
          <span>Max: {max} {unit}</span>
        </div>
      </Space>
    </div>
  );
};
