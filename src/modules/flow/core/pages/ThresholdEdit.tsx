/**
 * ThresholdEdit Page - Flow Threshold Configuration
 * 
 * Form for creating and editing flow thresholds.
 * Validates that min < max for all ranges and enforces backend constraints.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
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
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
  Warning as WarningIcon,
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
  alertTolerance: number;
  active: boolean;
}

interface ThresholdEditProps {
  mode: 'create' | 'edit';
}

export const ThresholdEdit: React.FC<ThresholdEditProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Form state
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ThresholdFormData>({
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
      setError('Failed to load pipelines');
    }
  };
  
  const loadThreshold = async () => {
    if (!id) return;
    
    try {
      setLoadingData(true);
      const threshold = await FlowThresholdService.getById(Number(id));
      setExistingThreshold(threshold);
      
      // Populate form
      setValue('pipelineId', threshold.pipelineId);
      setValue('pressureMin', threshold.pressureMin);
      setValue('pressureMax', threshold.pressureMax);
      setValue('temperatureMin', threshold.temperatureMin);
      setValue('temperatureMax', threshold.temperatureMax);
      setValue('flowRateMin', threshold.flowRateMin);
      setValue('flowRateMax', threshold.flowRateMax);
      setValue('alertTolerance', threshold.alertTolerance);
      setValue('active', threshold.active);
    } catch (error: any) {
      setError('Failed to load threshold');
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
        return;
      }
      
      const dto: FlowThresholdDTO = {
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
        setError(error.response.data.message || 'Validation error');
      } else if (error.response?.status === 409) {
        setError('A threshold already exists for this pipeline');
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
          {mode === 'create' ? 'New Flow Threshold' : 'Edit Flow Threshold'}
        </Typography>
      </Box>
      
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
                  rules={{ required: 'Pipeline is required', min: 1 }}
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
                        {error?.message || (mode === 'edit' ? 'Pipeline cannot be changed' : 'Select the pipeline for this threshold')}
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
                          label="Minimum"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.pressure.unit,
                          }}
                          inputProps={{
                            step: 0.1,
                            min: FlowThresholdConstraints.pressure.min,
                          }}
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
                          label="Maximum"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.pressure.unit,
                          }}
                          inputProps={{
                            step: 0.1,
                            max: FlowThresholdConstraints.pressure.max,
                          }}
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
                          label="Minimum"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.temperature.unit,
                          }}
                          inputProps={{
                            step: 0.1,
                            min: FlowThresholdConstraints.temperature.min,
                          }}
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
                          label="Maximum"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.temperature.unit,
                          }}
                          inputProps={{
                            step: 0.1,
                            max: FlowThresholdConstraints.temperature.max,
                          }}
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
                        min: { value: FlowThresholdConstraints.flowRate.min, message: 'Too low' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Minimum"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.flowRate.unit,
                          }}
                          inputProps={{
                            step: 0.1,
                            min: FlowThresholdConstraints.flowRate.min,
                          }}
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
                        min: { value: 0.1, message: 'Must be positive' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Maximum"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.flowRate.unit,
                          }}
                          inputProps={{
                            step: 0.1,
                            min: 0.1,
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Alert Configuration */}
          <Grid item xs={12} md={6}>
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
                  <Grid item xs={12}>
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
                          label="Alert Tolerance"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message || 'Warning threshold as percentage (±5%)'}
                          InputProps={{
                            endAdornment: FlowThresholdConstraints.alertTolerance.unit,
                          }}
                          inputProps={{
                            step: 0.5,
                            min: FlowThresholdConstraints.alertTolerance.min,
                            max: FlowThresholdConstraints.alertTolerance.max,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
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
                                <Typography variant="body1">
                                  {field.value ? 'Active' : 'Inactive'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {field.value 
                                    ? 'This threshold is currently monitoring the pipeline'
                                    : 'This threshold is not active'}
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
                    startIcon={<SaveIcon />}
                    disabled={loading || validationErrors.length > 0}
                  >
                    {loading ? 'Saving...' : mode === 'create' ? 'Create Threshold' : 'Update Threshold'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
