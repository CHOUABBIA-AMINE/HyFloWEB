/**
 * ThresholdEdit Page - Flow Threshold Configuration
 * 
 * Form for creating and editing flow thresholds.
 * Validates that min < max for all ranges and enforces backend constraints.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
 * @updated 02-06-2026 - Fixed infinite render loop blocking navigation
 * @updated 02-06-2026 - Aligned cancel button with ForecastEdit/OperationEdit pattern
 * @updated 01-31-2026 - Added i18n translations
 * @updated 01-28-2026 - Added containedVolume Min/Max fields
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
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
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  
  const mode = id ? 'edit' : 'create';
  
  const { control, handleSubmit, watch, reset, formState: { errors: formErrors } } = useForm<ThresholdFormData>({
    defaultValues: {
      ...createDefaultFlowThreshold(),
      pipelineId: 0,
      active: true,
    } as ThresholdFormData,
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === 'edit');
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [existingThreshold, setExistingThreshold] = useState<FlowThresholdDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const pipelineId = watch('pipelineId');
  const pressureMin = watch('pressureMin');
  const pressureMax = watch('pressureMax');
  const temperatureMin = watch('temperatureMin');
  const temperatureMax = watch('temperatureMax');
  const flowRateMin = watch('flowRateMin');
  const flowRateMax = watch('flowRateMax');
  const containedVolumeMin = watch('containedVolumeMin');
  const containedVolumeMax = watch('containedVolumeMax');
  const alertTolerance = watch('alertTolerance');
  const active = watch('active');
  
  useEffect(() => {
    loadPipelines();
    if (mode === 'edit' && id) {
      loadThreshold();
    }
  }, [id, mode]);
  
  const currentValidationErrors = useMemo(() => {
    const watchedValues = {
      pipelineId,
      pressureMin,
      pressureMax,
      temperatureMin,
      temperatureMax,
      flowRateMin,
      flowRateMax,
      containedVolumeMin,
      containedVolumeMax,
      alertTolerance,
      active,
    };
    return validateFlowThresholdDTO(watchedValues);
  }, [
    pipelineId,
    pressureMin,
    pressureMax,
    temperatureMin,
    temperatureMax,
    flowRateMin,
    flowRateMax,
    containedVolumeMin,
    containedVolumeMax,
    alertTolerance,
    active,
  ]);
  
  useEffect(() => {
    setValidationErrors(currentValidationErrors);
  }, [currentValidationErrors.length, currentValidationErrors.join('|')]);
  
  const loadPipelines = async () => {
    try {
      const data = await PipelineService.getAllNoPagination();
      setPipelines(data);
    } catch (error: any) {
      console.error('Failed to load pipelines:', error);
      setError(t('flow.threshold.alerts.failedToLoad'));
    }
  };
  
  const loadThreshold = async () => {
    if (!id) return;
    
    try {
      setLoadingData(true);
      const threshold = await FlowThresholdService.getById(Number(id));
      setExistingThreshold(threshold);
      
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
      setError(t('flow.threshold.alerts.failedToLoad'));
    } finally {
      setLoadingData(false);
    }
  };
  
  const onSubmit = async (data: ThresholdFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const errors = validateFlowThresholdDTO(data);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setError(t('flow.threshold.fixErrors'));
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
        setError(error.response.data.message || t('flow.threshold.alerts.validationFromServer'));
      } else if (error.response?.status === 409) {
        setError(t('flow.threshold.alerts.existsForPipeline'));
      } else {
        setError(error.message || t('flow.threshold.alerts.failedToSave'));
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
        <Typography variant="h6" sx={{ ml: 2 }}>{t('flow.threshold.loadingData')}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {mode === 'create' ? t('flow.threshold.create') : `${t('flow.threshold.edit')} #${id}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {mode === 'create' 
                    ? 'Configure monitoring thresholds for pipeline'
                    : 'Update threshold configuration and alert settings'
                  }
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('flow.threshold.actions.cancel')}>
                <IconButton 
                  onClick={handleCancel} 
                  disabled={loading}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={mode === 'create' ? t('flow.threshold.createButton') : t('flow.threshold.updateButton')}>
                <IconButton 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={loading || validationErrors.length > 0}
                  size="medium"
                  color="primary"
                >
                  {loading ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>
      
      {mode === 'edit' && existingThreshold && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{t('flow.threshold.alerts.pipelineInfo')}</strong> {existingThreshold.pipeline?.code} - {existingThreshold.pipeline?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('flow.threshold.fields.pipelineNote')}
          </Typography>
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>{t('flow.threshold.validationIssues')}</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('flow.threshold.sections.pipelineConfig')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Controller
                  name="pipelineId"
                  control={control}
                  rules={{ required: t('flow.threshold.fields.required'), min: { value: 1, message: t('flow.threshold.fields.pipelineSelect') } }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>{t('flow.threshold.fields.pipeline')} *</InputLabel>
                      <Select
                        {...field}
                        label={`${t('flow.threshold.fields.pipeline')} *`}
                        disabled={mode === 'edit'}
                      >
                        <MenuItem value={0}>{t('flow.threshold.fields.pipelineSelect')}</MenuItem>
                        {pipelines.map((pipeline) => (
                          <MenuItem key={pipeline.id} value={pipeline.id}>
                            {pipeline.code} - {pipeline.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {error?.message || (mode === 'edit' ? t('flow.threshold.fields.pipelineDisabled') : t('flow.threshold.fields.pipelineHelp'))}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">{t('flow.threshold.sections.pressureThresholds')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('flow.threshold.constraints.range', { min: FlowThresholdConstraints.pressure.min, max: FlowThresholdConstraints.pressure.max, unit: FlowThresholdConstraints.pressure.unit })}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="pressureMin"
                      control={control}
                      rules={{
                        required: t('flow.threshold.fields.required'),
                        min: { value: FlowThresholdConstraints.pressure.min, message: t('flow.threshold.fields.tooLow') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.minimum')} *`}
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
                        required: t('flow.threshold.fields.required'),
                        max: { value: FlowThresholdConstraints.pressure.max, message: t('flow.threshold.fields.tooHigh') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.maximum')} *`}
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
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThermostatIcon sx={{ mr: 1 }} color="error" />
                  <Typography variant="h6">{t('flow.threshold.sections.temperatureThresholds')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('flow.threshold.constraints.range', { min: FlowThresholdConstraints.temperature.min, max: FlowThresholdConstraints.temperature.max, unit: FlowThresholdConstraints.temperature.unit })}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="temperatureMin"
                      control={control}
                      rules={{
                        required: t('flow.threshold.fields.required'),
                        min: { value: FlowThresholdConstraints.temperature.min, message: t('flow.threshold.fields.tooLow') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.minimum')} *`}
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
                        required: t('flow.threshold.fields.required'),
                        max: { value: FlowThresholdConstraints.temperature.max, message: t('flow.threshold.fields.tooHigh') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.maximum')} *`}
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
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <OpacityIcon sx={{ mr: 1 }} color="info" />
                  <Typography variant="h6">{t('flow.threshold.sections.flowRateThresholds')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('flow.threshold.constraints.minimum', { min: FlowThresholdConstraints.flowRate.min, unit: FlowThresholdConstraints.flowRate.unit })}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="flowRateMin"
                      control={control}
                      rules={{
                        required: t('flow.threshold.fields.required'),
                        min: { value: FlowThresholdConstraints.flowRate.min, message: t('flow.threshold.fields.cannotBeNegative') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.minimum')} *`}
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
                        required: t('flow.threshold.fields.required'),
                        min: { value: 1, message: t('flow.threshold.fields.mustBePositive') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.maximum')} *`}
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
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ mr: 1 }} color="success" />
                  <Typography variant="h6">{t('flow.threshold.sections.containedVolumeThresholds')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('flow.threshold.constraints.minimum', { min: FlowThresholdConstraints.containedVolume.min, unit: FlowThresholdConstraints.containedVolume.unit })}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="containedVolumeMin"
                      control={control}
                      rules={{
                        required: t('flow.threshold.fields.required'),
                        min: { value: FlowThresholdConstraints.containedVolume.min, message: t('flow.threshold.fields.cannotBeNegative') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.minimum')} *`}
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
                        required: t('flow.threshold.fields.required'),
                        min: { value: 1, message: t('flow.threshold.fields.mustBePositive') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.maximum')} *`}
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
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ mr: 1 }} color="warning" />
                  <Typography variant="h6">{t('flow.threshold.sections.alertConfig')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('flow.threshold.sections.alertConfigDesc')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="alertTolerance"
                      control={control}
                      rules={{
                        required: t('flow.threshold.fields.required'),
                        min: { value: FlowThresholdConstraints.alertTolerance.min, message: t('flow.threshold.fields.cannotBeNegative') },
                        max: { value: FlowThresholdConstraints.alertTolerance.max, message: t('flow.threshold.fields.cannotExceed50') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${t('flow.threshold.fields.tolerance')} *`}
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message || t('flow.threshold.constraints.alertToleranceHelp')}
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
                                  {field.value ? t('flow.threshold.fields.active') : t('flow.threshold.fields.inactive')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {field.value 
                                    ? t('flow.threshold.fields.activeMonitoring')
                                    : t('flow.threshold.fields.inactiveDisabled')}
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
        </Grid>
      </form>
    </Box>
  );
};
