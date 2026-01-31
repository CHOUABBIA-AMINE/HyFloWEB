/**
 * ForecastEdit Page - Flow Forecast Create/Edit
 * 
 * Form for creating or editing flow forecasts with:
 * - Infrastructure and product selection
 * - Operation type selection
 * - Forecast date (must be future)
 * - Predicted volume input
 * - Accuracy level (0-100%)
 * - Adjusted volume (optional)
 * - Adjustment notes (optional)
 * - Supervisor selection (optional)
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 01-31-2026 - Added i18n translations
 * @updated 01-30-2026 - Fixed EmployeeDTO property access
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText,
  Slider,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import { FlowForecastService } from '../services/FlowForecastService';
import { InfrastructureService } from '@/modules/network/core/services/InfrastructureService';
import { ProductService } from '@/modules/network/common/services/ProductService';
import { OperationTypeService } from '@/modules/flow/type/services/OperationTypeService';
import { EmployeeService } from '@/modules/general/organization/services/EmployeeService';

import type { FlowForecastDTO } from '../dto/FlowForecastDTO';
import type { InfrastructureDTO } from '@/modules/network/core/dto/InfrastructureDTO';
import type { ProductDTO } from '@/modules/network/common/dto/ProductDTO';
import type { OperationTypeDTO } from '@/modules/flow/type/dto/OperationTypeDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

interface ForecastFormData {
  infrastructureId: number | '';
  productId: number | '';
  operationTypeId: number | '';
  forecastDate: string;
  predictedVolume: number | '';
  adjustedVolume: number | '';
  accuracy: number;
  adjustmentNotes: string;
  supervisorId: number | '';
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const ForecastEdit: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ForecastFormData>({
    defaultValues: {
      infrastructureId: '',
      productId: '',
      operationTypeId: '',
      forecastDate: '',
      predictedVolume: '',
      adjustedVolume: '',
      accuracy: 70,
      adjustmentNotes: '',
      supervisorId: '',
    },
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [infrastructures, setInfrastructures] = useState<InfrastructureDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationTypeDTO[]>([]);
  const [supervisors, setSupervisors] = useState<EmployeeDTO[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Load filter options
      const [infras, prods, types, employees] = await Promise.all([
        InfrastructureService.getAllNoPagination(),
        ProductService.getAllNoPagination(),
        OperationTypeService.getAllNoPagination(),
        EmployeeService.getAllNoPagination(),
      ]);

      setInfrastructures(infras);
      setProducts(prods);
      setOperationTypes(types);
      setSupervisors(employees);

      // Load existing forecast if edit mode
      if (isEditMode && id) {
        const forecast = await FlowForecastService.getById(Number(id));
        setValue('infrastructureId', forecast.infrastructureId);
        setValue('productId', forecast.productId);
        setValue('operationTypeId', forecast.operationTypeId);
        setValue('forecastDate', forecast.forecastDate);
        setValue('predictedVolume', forecast.predictedVolume);
        setValue('adjustedVolume', forecast.adjustedVolume || '');
        setValue('accuracy', forecast.accuracy || 70);
        setValue('adjustmentNotes', forecast.adjustmentNotes || '');
        setValue('supervisorId', forecast.supervisorId || '');
      } else {
        // Set minimum date to tomorrow for new forecasts
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setValue('forecastDate', tomorrow.toISOString().split('T')[0]);
      }
    } catch (error: any) {
      showNotification(
        error.message || t('flow.forecast.alerts.loadError'),
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };

  const onSubmit = async (data: ForecastFormData) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!data.infrastructureId) {
        showNotification(t('flow.forecast.fields.selectInfrastructure'), 'warning');
        return;
      }

      if (!data.productId) {
        showNotification(t('flow.forecast.fields.selectProduct'), 'warning');
        return;
      }

      if (!data.operationTypeId) {
        showNotification(t('flow.forecast.fields.selectType'), 'warning');
        return;
      }

      if (!data.forecastDate) {
        showNotification(t('flow.forecast.fields.date'), 'warning');
        return;
      }

      // Validate forecast date is in the future
      const forecastDate = new Date(data.forecastDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (forecastDate <= today) {
        showNotification('Forecast date must be in the future', 'warning');
        return;
      }

      if (!data.predictedVolume || data.predictedVolume <= 0) {
        showNotification(t('flow.forecast.fields.volume'), 'warning');
        return;
      }

      // Prepare DTO
      const forecastDTO: FlowForecastDTO = {
        infrastructureId: Number(data.infrastructureId),
        productId: Number(data.productId),
        operationTypeId: Number(data.operationTypeId),
        forecastDate: data.forecastDate,
        predictedVolume: Number(data.predictedVolume),
        adjustedVolume: data.adjustedVolume ? Number(data.adjustedVolume) : undefined,
        accuracy: data.accuracy,
        adjustmentNotes: data.adjustmentNotes || undefined,
        supervisorId: data.supervisorId ? Number(data.supervisorId) : undefined,
      };

      // Save forecast
      if (isEditMode && id) {
        await FlowForecastService.update(Number(id), forecastDTO);
        showNotification(t('flow.forecast.alerts.updateSuccess'), 'success');
      } else {
        await FlowForecastService.create(forecastDTO);
        showNotification(t('flow.forecast.alerts.createSuccess'), 'success');
      }

      // Navigate back to list
      setTimeout(() => {
        navigate('/flow/forecasts');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving forecast:', error);

      if (error.response?.status === 400) {
        showNotification(
          error.response.data.message || t('flow.forecast.alerts.createError'),
          'error'
        );
      } else if (error.response?.status === 409) {
        showNotification(
          'A forecast already exists for this infrastructure/product/date',
          'error'
        );
      } else {
        showNotification(
          error.message || t('flow.forecast.alerts.createError'),
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>{t('flow.forecast.alerts.loadError')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? t('flow.forecast.edit') : t('flow.forecast.create')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="infrastructureId"
                control={control}
                rules={{ required: t('flow.forecast.fields.infrastructure') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.forecast.fields.infrastructure') + ' *'}
                    error={!!errors.infrastructureId}
                    helperText={errors.infrastructureId?.message}
                  >
                    <MenuItem value="">{t('flow.forecast.fields.selectInfrastructure')}</MenuItem>
                    {infrastructures.map((infra) => (
                      <MenuItem key={infra.id} value={infra.id}>
                        {infra.code} - {infra.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="productId"
                control={control}
                rules={{ required: t('flow.forecast.fields.product') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.forecast.fields.product') + ' *'}
                    error={!!errors.productId}
                    helperText={errors.productId?.message}
                  >
                    <MenuItem value="">{t('flow.forecast.fields.selectProduct')}</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.designationFr}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="operationTypeId"
                control={control}
                rules={{ required: t('flow.forecast.fields.type') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.forecast.fields.type') + ' *'}
                    error={!!errors.operationTypeId}
                    helperText={errors.operationTypeId?.message}
                  >
                    <MenuItem value="">{t('flow.forecast.fields.selectType')}</MenuItem>
                    {operationTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.code}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="forecastDate"
                control={control}
                rules={{ required: t('flow.forecast.fields.date') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label={t('flow.forecast.fields.date') + ' *'}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.forecastDate}
                    helperText={errors.forecastDate?.message || 'Date must be in the future'}
                    inputProps={{
                      min: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="predictedVolume"
                control={control}
                rules={{ 
                  required: t('flow.forecast.fields.volume'),
                  min: { value: 0, message: 'Volume must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('flow.forecast.fields.volume') + ' *'}
                    error={!!errors.predictedVolume}
                    helperText={errors.predictedVolume?.message}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="adjustedVolume"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('flow.forecast.fields.volume') + ' (Adjusted)'}
                    helperText="Optional: Adjusted forecast after expert review"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="accuracy"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography gutterBottom>
                      Accuracy Level: {field.value}%
                    </Typography>
                    <Slider
                      {...field}
                      min={0}
                      max={100}
                      step={5}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                    <FormHelperText>
                      Indicates the accuracy level of this forecast (0-100%)
                    </FormHelperText>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="adjustmentNotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label={t('flow.forecast.fields.notes')}
                    placeholder={t('flow.forecast.fields.notesPlaceholder')}
                    inputProps={{ maxLength: 500 }}
                    helperText={`${field.value?.length || 0}/500 characters`}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="supervisorId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.forecast.fields.recordedBy')}
                    helperText="Optional: Select supervising employee"
                  >
                    <MenuItem value="">None</MenuItem>
                    {supervisors.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.firstNameLt} {employee.lastNameLt}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/flow/forecasts')}
            >
              {t('flow.forecast.actions.cancel')}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {isEditMode ? t('flow.forecast.actions.update') : t('flow.forecast.actions.create')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
