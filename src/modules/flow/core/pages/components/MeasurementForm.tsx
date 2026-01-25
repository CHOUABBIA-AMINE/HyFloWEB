/**
 * MeasurementForm Component
 * 
 * Form for entering flow measurements with real-time validation
 * against threshold values. Provides visual feedback for values
 * within range, near threshold, or exceeding limits.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React, { useMemo } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';

interface MeasurementFormProps {
  control: Control<any>;
  errors: FieldErrors;
  pipelineId: number;
  threshold?: FlowThresholdDTO;
}

interface ThresholdStatus {
  color: 'success' | 'warning' | 'error';
  icon: React.ReactNode;
  message: string;
  percentage: number;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  control,
  errors,
  pipelineId,
  threshold,
}) => {
  
  const getThresholdStatus = (
    value: number | undefined,
    min: number,
    max: number,
    tolerance: number
  ): ThresholdStatus | null => {
    if (value === undefined || value === null) return null;
    
    // Critical breach
    if (value < min || value > max) {
      return {
        color: 'error',
        icon: <ErrorIcon />,
        message: `BREACH: Value outside threshold range (${min}-${max})`,
        percentage: value < min ? 0 : 100,
      };
    }
    
    // Warning zone (within tolerance)
    const toleranceValue = (max - min) * (tolerance / 100);
    const minWarning = min + toleranceValue;
    const maxWarning = max - toleranceValue;
    
    if (value <= minWarning || value >= maxWarning) {
      return {
        color: 'warning',
        icon: <WarningIcon />,
        message: 'WARNING: Value near threshold limit',
        percentage: ((value - min) / (max - min)) * 100,
      };
    }
    
    // Normal range
    return {
      color: 'success',
      icon: <CheckCircleIcon />,
      message: 'Value within normal range',
      percentage: ((value - min) / (max - min)) * 100,
    };
  };
  
  const MeasurementInput: React.FC<{
    name: string;
    label: string;
    unit: string;
    min?: number;
    max?: number;
    thresholdMin?: number;
    thresholdMax?: number;
    tolerance?: number;
  }> = ({ name, label, unit, min, max, thresholdMin, thresholdMax, tolerance }) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={{
          min: { value: min ?? 0, message: `${label} must be at least ${min ?? 0}` },
          max: { value: max ?? Infinity, message: `${label} cannot exceed ${max}` },
        }}
        render={({ field, fieldState: { error } }) => {
          const status = thresholdMin !== undefined && thresholdMax !== undefined && tolerance !== undefined
            ? getThresholdStatus(field.value, thresholdMin, thresholdMax, tolerance)
            : null;
          
          return (
            <Box>
              <TextField
                {...field}
                label={`${label} (${unit})`}
                type="number"
                fullWidth
                error={!!error || status?.color === 'error'}
                helperText={error?.message}
                inputProps={{
                  step: 0.01,
                  min: min,
                  max: max,
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
              
              {status && (
                <Paper elevation={0} sx={{ mt: 1, p: 2, bgcolor: `${status.color}.50` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color: `${status.color}.main`, mr: 1 }}>
                      {status.icon}
                    </Box>
                    <Typography variant="body2" color={`${status.color}.main`}>
                      {status.message}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {thresholdMin}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={status.percentage}
                        color={status.color}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {thresholdMax}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      label={`Min: ${thresholdMin} ${unit}`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`Max: ${thresholdMax} ${unit}`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`Tolerance: ${tolerance}%`} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              )}
            </Box>
          );
        }}
      />
    );
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Enter Measurements
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter the flow reading measurements. Values are validated against configured thresholds in real-time.
        At least one measurement value is required.
      </Typography>
      
      {!threshold && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>No Active Threshold</AlertTitle>
          No threshold configuration found for this pipeline. Values will be validated against absolute limits only.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Recording Timestamp */}
        <Grid item xs={12}>
          <Controller
            name="recordedAt"
            control={control}
            rules={{ required: 'Recording timestamp is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Recording Time *"
                type="datetime-local"
                fullWidth
                error={!!error}
                helperText={error?.message || 'When was this reading taken?'}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
        
        {/* Pressure */}
        <Grid item xs={12} md={6}>
          <MeasurementInput
            name="pressure"
            label="Pressure"
            unit="bar"
            min={0}
            max={500}
            thresholdMin={threshold?.pressureMin}
            thresholdMax={threshold?.pressureMax}
            tolerance={threshold?.alertTolerance}
          />
        </Grid>
        
        {/* Temperature */}
        <Grid item xs={12} md={6}>
          <MeasurementInput
            name="temperature"
            label="Temperature"
            unit="°C"
            min={-50}
            max={200}
            thresholdMin={threshold?.temperatureMin}
            thresholdMax={threshold?.temperatureMax}
            tolerance={threshold?.alertTolerance}
          />
        </Grid>
        
        {/* Flow Rate */}
        <Grid item xs={12} md={6}>
          <MeasurementInput
            name="flowRate"
            label="Flow Rate"
            unit="m³/h"
            min={0}
            thresholdMin={threshold?.flowRateMin}
            thresholdMax={threshold?.flowRateMax}
            tolerance={threshold?.alertTolerance}
          />
        </Grid>
        
        {/* Contained Volume */}
        <Grid item xs={12} md={6}>
          <MeasurementInput
            name="containedVolume"
            label="Contained Volume"
            unit="m³"
            min={0}
          />
        </Grid>
        
        {/* Notes */}
        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            rules={{ maxLength: { value: 500, message: 'Notes cannot exceed 500 characters' } }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Notes"
                multiline
                rows={4}
                fullWidth
                error={!!error}
                helperText={
                  error?.message || 
                  `${field.value?.length || 0}/500 characters - Optional comments or observations`
                }
              />
            )}
          />
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        <AlertTitle>Measurement Guidelines</AlertTitle>
        <Typography variant="body2">
          • Ensure all measuring instruments are properly calibrated<br />
          • Record values at stable operating conditions<br />
          • Double-check readings that show threshold warnings or breaches<br />
          • Add notes for any unusual observations or conditions
        </Typography>
      </Alert>
    </Box>
  );
};
