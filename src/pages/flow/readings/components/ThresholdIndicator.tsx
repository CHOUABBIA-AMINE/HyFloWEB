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
  Box,
  Chip,
  LinearProgress,
  Typography,
  Paper,
  Slider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

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
  color: 'success' | 'warning' | 'error';
  icon: React.ReactNode;
  message: string;
  bgColor: string;
  borderColor: string;
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
        color: 'error',
        icon: <ErrorIcon />,
        message: value < min 
          ? `BREACH: Below minimum threshold (${min} ${unit})`
          : `BREACH: Above maximum threshold (${max} ${unit})`,
        bgColor: '#fff2f0',
        borderColor: '#f5222d',
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
        color: 'warning',
        icon: <WarningIcon />,
        message: value <= minWarning
          ? `WARNING: Near lower threshold limit (${minWarning.toFixed(2)} ${unit})`
          : `WARNING: Near upper threshold limit (${maxWarning.toFixed(2)} ${unit})`,
        bgColor: '#fffbe6',
        borderColor: '#faad14',
      };
    }
    
    // Normal range
    return {
      status: 'ok',
      color: 'success',
      icon: <CheckCircleIcon />,
      message: 'OK: Value within normal operating range',
      bgColor: '#f6ffed',
      borderColor: '#52c41a',
    };
  };
  
  const statusInfo = getStatus();
  
  // Calculate percentage for progress bar
  const range = max - min;
  const percentage = ((value - min) / range) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Marks for slider
  const marks = [
    {
      value: min,
      label: min.toString(),
    },
    {
      value: max,
      label: max.toString(),
    },
  ];
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: statusInfo.bgColor,
        border: `1px solid ${statusInfo.borderColor}`,
        borderRadius: 1,
        mt: -1,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Status badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.message}
            color={statusInfo.color}
            size="small"
          />
          <Typography variant="body1" fontWeight="bold" color={`${statusInfo.color}.main`}>
            {value.toFixed(2)} {unit}
          </Typography>
        </Box>
        
        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={clampedPercentage}
          color={statusInfo.color}
          sx={{ height: 8, borderRadius: 1 }}
        />
        
        {/* Visual range indicator */}
        <Box sx={{ mt: 1, px: 1 }}>
          <Slider
            value={value}
            min={min - 10}
            max={max + 10}
            marks={marks}
            disabled
            valueLabelDisplay="auto"
            valueLabelFormat={(val: number) => `${val.toFixed(2)} ${unit}`}
            color={statusInfo.color}
            sx={{
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
            }}
          />
        </Box>
        
        {/* Threshold info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'text.secondary',
            mt: 1,
          }}
        >
          <Typography variant="caption">Min: {min} {unit}</Typography>
          <Typography variant="caption">Range: {min} - {max} {unit}</Typography>
          <Typography variant="caption">Max: {max} {unit}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};
