/**
 * ThresholdEdit Page - Flow Threshold Configuration
 * 
 * Form for creating and editing flow thresholds.
 * Validates that min < max for all ranges and enforces backend constraints.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
 * @updated 01-28-2026 - Added containedVolume Min/Max fields
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

import { FlowThresholdService } from '../services/FlowThresholdService';
import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { 
  validateFlowThresholdDTO, 
  FlowThresholdConstraints,
  createDefaultFlowThreshold 
} from '../dto/FlowThresholdDTO';

import type { FlowThresholdDTO } from '../dto/FlowThresholdDTO';
import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';

interface ThresholdFormData {
  pipelineId: number;
  pressureMin: number;
  pressureMax: number;
  temperatureMin: number;
  temperatureMax: number;
  flowRateMin: number;
  flowRateMax: number;
  containedVolumeMin: number;
  containedVolumeMax: number;
  alertTolerance: number;
  active: boolean;
}

export const ThresholdEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Auto-detect mode from URL
  const mode = id ? 'edit' : 'create';
  
  // Form state
  const { control, handleSubmit, watch, reset, formState: { errors: formErrors } } = useForm<ThresholdFormData>({
    defaultValues: {
      ...createDefaultFlowThreshold(),
      pipelineId: 0,
      active: true,
    } as ThresholdFormData,
  });
  
  // Component state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === 'edit');
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [existingThreshold, setExistingThreshold] = useState<FlowThresholdDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Watch form values for real-time validation
  const watchedValues = watch();
  
  // Load initial data
  useEffect(() => {
    loadPipelines();
    if (mode === 'edit' && id) {
      loadThreshold();
    }
  }, [id, mode]);
  
  // Validate form in real-time
  useEffect(() => {
    const errors = validateFlowThresholdDTO(watchedValues);
    setValidationErrors(errors);
  }, [watchedValues]);
  
  const loadPipelines = async () => {
    try {
      const data = await PipelineService.getAllNoPagination();
      setPipelines(data);
    } catch (error: any) {
      console.error('Failed to load pipelines:', error);
      setError('Failed to load pipelines');
    }
  };
  
  const loadThreshold = async () => {
    if (!id) return;
    
    try {
      setLoadingData(true);
      const threshold = await FlowThresholdService.getById(Number(id));
      setExistingThreshold(threshold);
      
      // Populate form with loaded data
      reset({
        pipelineId: threshold.pipelineId,
        pressureMin: threshold.pressureMin,
        pressureMax: threshold.pressureMax,
        temperatureMin: threshold.temperatureMin,
        temperatureMax: threshold.temperatureMax,
        flowRateMin: threshold.flowRateMin,
        flowRateMax: threshold.flowRateMax,
        containedVolumeMin: threshold.containedVolumeMin,
        containedVolumeMax: threshold.containedVolumeMax,
        alertTolerance: threshold.alertTolerance,
        active: threshold.active,
      });
    } catch (error: any) {
      console.error('Failed to load threshold:', error);
      setError('Failed to load threshold data');
    } finally {
      setLoadingData(false);
    }
  };
  
  const onSubmit = async (data: ThresholdFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Final validation
      const errors = validateFlowThresholdDTO(data);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setError('Please fix validation errors before submitting');
        return;
      }
      
      const dto: FlowThresholdDTO = {
        id: mode === 'edit' && id ? Number(id) : undefined,
        ...data,
      };
      
      if (mode === 'edit' && id) {
        await FlowThresholdService.update(Number(id), dto);
      } else {
        await FlowThresholdService.create(dto);
      }
      
      navigate('/flow/thresholds');
    } catch (error: any) {
      console.error('Error saving threshold:', error);
      
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Validation error from server');
      } else if (error.response?.status === 409) {
        setError('A threshold already exists for this pipeline. Each pipeline can only have one threshold.');
      } else {
        setError(error.message || 'Failed to save threshold');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/flow/thresholds');
  };
  
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading threshold data...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {mode === 'create' ? 'New Flow Threshold' : `Edit Flow Threshold #${id}`}
        </Typography>
      </Box>
      
      {/* Existing Pipeline Info (Edit Mode) */}
      {mode === 'edit' && existingThreshold && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Pipeline:</strong> {existingThreshold.pipeline?.code} - {existingThreshold.pipeline?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Note: Pipeline cannot be changed when editing
          </Typography>
        </Alert>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Validation Issues:</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Pipeline Selection */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pipeline Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Controller
                  name="pipelineId"
                  control={control}
                  rules={{ required: 'Pipeline is required', min: { value: 1, message: 'Please select a pipeline' } }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Pipeline *</InputLabel>
                      <Select
                        {...field}
                        label="Pipeline *"
                        disabled={mode === 'edit'}
                      >
                        <MenuItem value={0}>Select a pipeline...</MenuItem>
                        {pipelines.map((pipeline) => (
                          <MenuItem key={pipeline.id} value={pipeline.id}>
                            {pipeline.code} - {pipeline.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {error?.message || (mode === 'edit' ? 'Pipeline cannot be changed after creation' : 'Select the pipeline for this threshold')}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Pressure Thresholds */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">Pressure Thresholds</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Range: {FlowThresholdConstraints.pressure.min} - {FlowThresholdConstraints.pressure.max} {FlowThresholdConstraints.pressure.unit}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="pressureMin"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: FlowThresholdConstraints.pressure.min, message: 'Too low' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Minimum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.pressure.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.pressure.step,
                            min: FlowThresholdConstraints.pressure.min,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="pressureMax"
                      control={control}
                      rules={{
                        required: 'Required',
                        max: { value: FlowThresholdConstraints.pressure.max, message: 'Too high' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Maximum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.pressure.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.pressure.step,
                            max: FlowThresholdConstraints.pressure.max,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Temperature Thresholds */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThermostatIcon sx={{ mr: 1 }} color="error" />
                  <Typography variant="h6">Temperature Thresholds</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Range: {FlowThresholdConstraints.temperature.min} - {FlowThresholdConstraints.temperature.max} {FlowThresholdConstraints.temperature.unit}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="temperatureMin"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: FlowThresholdConstraints.temperature.min, message: 'Too low' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Minimum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.temperature.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.temperature.step,
                            min: FlowThresholdConstraints.temperature.min,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="temperatureMax"
                      control={control}
                      rules={{
                        required: 'Required',
                        max: { value: FlowThresholdConstraints.temperature.max, message: 'Too high' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Maximum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.temperature.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.temperature.step,
                            max: FlowThresholdConstraints.temperature.max,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Flow Rate Thresholds */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <OpacityIcon sx={{ mr: 1 }} color="info" />
                  <Typography variant="h6">Flow Rate Thresholds</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Minimum: {FlowThresholdConstraints.flowRate.min} {FlowThresholdConstraints.flowRate.unit}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="flowRateMin"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: FlowThresholdConstraints.flowRate.min, message: 'Cannot be negative' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Minimum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.flowRate.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.flowRate.step,
                            min: FlowThresholdConstraints.flowRate.min,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="flowRateMax"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: 1, message: 'Must be positive' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Maximum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.flowRate.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.flowRate.step,
                            min: 1,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Contained Volume Thresholds */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ mr: 1 }} color="success" />
                  <Typography variant="h6">Contained Volume Thresholds</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Minimum: {FlowThresholdConstraints.containedVolume.min} {FlowThresholdConstraints.containedVolume.unit}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="containedVolumeMin"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: FlowThresholdConstraints.containedVolume.min, message: 'Cannot be negative' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Minimum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.containedVolume.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.containedVolume.step,
                            min: FlowThresholdConstraints.containedVolume.min,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="containedVolumeMax"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: 1, message: 'Must be positive' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Maximum *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.containedVolume.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.containedVolume.step,
                            min: 1,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Alert Configuration */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ mr: 1 }} color="warning" />
                  <Typography variant="h6">Alert Configuration</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure alert tolerance and activation status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="alertTolerance"
                      control={control}
                      rules={{
                        required: 'Required',
                        min: { value: FlowThresholdConstraints.alertTolerance.min, message: 'Cannot be negative' },
                        max: { value: FlowThresholdConstraints.alertTolerance.max, message: 'Cannot exceed 50%' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Alert Tolerance *"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message || 'Warning threshold as percentage (±5%)'}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.alertTolerance.unit,
                          }}
                          inputProps={{
                            step: FlowThresholdConstraints.alertTolerance.step,
                            min: FlowThresholdConstraints.alertTolerance.min,
                            max: FlowThresholdConstraints.alertTolerance.max,
                          }}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: field.value ? 'success.50' : 'grey.50', height: '100%', display: 'flex', alignItems: 'center' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                {...field}
                                checked={field.value}
                                color="success"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {field.value ? 'Active' : 'Inactive'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {field.value 
                                    ? 'Threshold is monitoring the pipeline'
                                    : 'Threshold is disabled'}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Action Buttons */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    * Required fields
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading || validationErrors.length > 0}
                    >
                      {loading ? 'Saving...' : mode === 'create' ? 'Create Threshold' : 'Update Threshold'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
