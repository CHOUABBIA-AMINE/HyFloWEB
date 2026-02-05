/**
 * MeasurementForm Component
 * 
 * Form for entering flow measurements with real-time validation
 * against threshold values. Provides visual feedback for values
 * within range, near threshold, or exceeding limits.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 02-05-2026 - Fixed out-of-range slot value warning by handling timing
 * @updated 02-05-2026 - Fixed uncontrolled to controlled input warning
 * @updated 01-28-2026 - Added reading date and slot selection
 * @updated 01-28-2026 - Added threshold validation for contained volume
 */

import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

import { ReadingSlotService } from '@/modules/flow/common/services';
import { formatTimeRange, getLocalizedDesignation } from '@/modules/flow/common/dto/ReadingSlotDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';
import type { ReadingSlotDTO } from '@/modules/flow/common/dto/ReadingSlotDTO';

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
  const [slots, setSlots] = useState<ReadingSlotDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  
  // Load available slots
  useEffect(() => {
    loadSlots();
  }, []);
  
  const loadSlots = async () => {
    try {
      setLoadingSlots(true);
      const data = await ReadingSlotService.getAllOrdered();
      setSlots(data);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };
  
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
                value={field.value ?? ''}
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
        Enter the flow reading measurements for a specific date and time slot. 
        Values are validated against configured thresholds in real-time.
      </Typography>
      
      {!threshold && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>No Active Threshold</AlertTitle>
          No threshold configuration found for this pipeline. Values will be validated against absolute limits only.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* ========== NEW: Reading Date ========== */}
        <Grid item xs={12} md={6}>
          <Controller
            name="readingDate"
            control={control}
            rules={{ required: 'Reading date is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Reading Date *"
                type="date"
                fullWidth
                error={!!error}
                helperText={error?.message || 'Business date for this reading'}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0], // Cannot select future dates
                }}
              />
            )}
          />
        </Grid>
        
        {/* ========== NEW: Reading Slot ========== */}
        <Grid item xs={12} md={6}>
          <Controller
            name="readingSlotId"
            control={control}
            rules={{ required: 'Reading slot is required' }}
            render={({ field, fieldState: { error } }) => {
              // Only show the value if slots are loaded and it exists in the list
              const currentValue = loadingSlots 
                ? '' 
                : (field.value && slots.some(s => s.id === field.value) ? field.value : '');
              
              return (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Reading Slot *</InputLabel>
                  <Select
                    {...field}
                    value={currentValue}
                    label="Reading Slot *"
                    disabled={loadingSlots}
                  >
                    {slots.map((slot) => (
                      <MenuItem key={slot.id} value={slot.id}>
                        <Box>
                          <Typography variant="body1">
                            {getLocalizedDesignation(slot, 'en')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeRange(slot)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {error?.message || (loadingSlots ? 'Loading slots...' : 'Select the time slot for this reading')}
                  </FormHelperText>
                </FormControl>
              );
            }}
          />
        </Grid>
        
        {/* Recording Timestamp (System submission time) */}
        <Grid item xs={12}>
          <Controller
            name="recordedAt"
            control={control}
            rules={{ required: 'Recording timestamp is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="System Submission Time *"
                type="datetime-local"
                fullWidth
                error={!!error}
                helperText={error?.message || 'When this reading is being submitted to the system'}
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
        
        {/* Contained Volume - NOW WITH THRESHOLD VALIDATION */}
        <Grid item xs={12} md={6}>
          <MeasurementInput
            name="containedVolume"
            label="Contained Volume"
            unit="m³"
            min={0}
            thresholdMin={threshold?.containedVolumeMin}
            thresholdMax={threshold?.containedVolumeMax}
            tolerance={threshold?.alertTolerance}
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
                value={field.value ?? ''}
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
        <AlertTitle>Slot-Based Reading Guidelines</AlertTitle>
        <Typography variant="body2">
          • <strong>Reading Date</strong>: The business date for this reading (e.g., which day's operations)<br />
          • <strong>Reading Slot</strong>: The scheduled time window for this reading<br />
          • <strong>Submission Time</strong>: When you're entering this reading into the system<br />
          • Ensure all measuring instruments are properly calibrated<br />
          • Record values at stable operating conditions<br />
          • Add notes for any unusual observations or conditions
        </Typography>
      </Alert>
    </Box>
  );
};
