/**
 * ForecastEdit Page - Flow Forecast Create/Edit
 * 
 * Form for creating or editing flow forecasts with:
 * - Infrastructure and product selection
 * - Forecast date (must be future)
 * - Estimated volume input
 * - Confidence level (optional)
 * - Notes field
 * - Validation workflow support
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 01-29-2026 - Fixed ProductDTO property access
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Send as SendIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import { FlowForecastService } from '../services/FlowForecastService';
import { InfrastructureService } from '@/modules/network/core/services/InfrastructureService';
import { ProductService } from '@/modules/network/common/services/ProductService';
import { ValidationStatusService } from '@/modules/flow/common/services/ValidationStatusService';
import UserService from '@/modules/system/security/services/UserService';
import { getUsernameFromToken } from '@/shared/utils/jwtUtils';

import type { FlowForecastDTO } from '../dto/FlowForecastDTO';
import type { InfrastructureDTO } from '@/modules/network/core/dto/InfrastructureDTO';
import type { ProductDTO } from '@/modules/network/common/dto/ProductDTO';
import type { ValidationStatusDTO } from '@/modules/flow/common/dto/ValidationStatusDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

interface ForecastFormData {
  infrastructureId: number | '';
  productId: number | '';
  forecastDate: string;
  estimatedVolume: number | '';
  confidence: number;
  notes: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const ForecastEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ForecastFormData>({
    defaultValues: {
      infrastructureId: '',
      productId: '',
      forecastDate: '',
      estimatedVolume: '',
      confidence: 70,
      notes: '',
    },
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [currentUser, setCurrentUser] = useState<EmployeeDTO | null>(null);
  const [infrastructures, setInfrastructures] = useState<InfrastructureDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatusDTO[]>([]);
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

      // Load current user
      const username = getUsernameFromToken();
      if (!username) {
        throw new Error('No username found in token. Please log in again.');
      }

      const userData = await UserService.getByUsername(username);
      if (userData.employee) {
        setCurrentUser(userData.employee);
      } else {
        throw new Error('Employee data not found for current user');
      }

      // Load filter options
      const [infras, prods, statuses] = await Promise.all([
        InfrastructureService.getAllNoPagination(),
        ProductService.getAllNoPagination(),
        ValidationStatusService.getAllNoPagination(),
      ]);

      setInfrastructures(infras);
      setProducts(prods);
      setValidationStatuses(statuses);

      // Load existing forecast if edit mode
      if (isEditMode && id) {
        const forecast = await FlowForecastService.getById(Number(id));
        setValue('infrastructureId', forecast.infrastructureId);
        setValue('productId', forecast.productId);
        setValue('forecastDate', forecast.forecastDate);
        setValue('estimatedVolume', forecast.estimatedVolume);
        setValue('confidence', forecast.confidence || 70);
        setValue('notes', forecast.notes || '');
      } else {
        // Set minimum date to tomorrow for new forecasts
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setValue('forecastDate', tomorrow.toISOString().split('T')[0]);
      }
    } catch (error: any) {
      showNotification(
        error.message || 'Failed to load required data',
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };

  const onSubmit = async (data: ForecastFormData, submitForValidation: boolean = false) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!data.infrastructureId) {
        showNotification('Please select an infrastructure', 'warning');
        return;
      }

      if (!data.productId) {
        showNotification('Please select a product', 'warning');
        return;
      }

      if (!data.forecastDate) {
        showNotification('Please select a forecast date', 'warning');
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

      if (!data.estimatedVolume || data.estimatedVolume <= 0) {
        showNotification('Please enter a valid estimated volume', 'warning');
        return;
      }

      if (!currentUser?.id) {
        showNotification('User information not available', 'error');
        return;
      }

      // Get validation status
      const statusCode = submitForValidation ? 'PENDING' : 'DRAFT';
      const validationStatus = validationStatuses.find(s => s.code === statusCode);

      if (!validationStatus?.id) {
        throw new Error('Validation status not found');
      }

      // Prepare DTO
      const forecastDTO: FlowForecastDTO = {
        infrastructureId: Number(data.infrastructureId),
        productId: Number(data.productId),
        forecastDate: data.forecastDate,
        estimatedVolume: Number(data.estimatedVolume),
        confidence: data.confidence,
        notes: data.notes || undefined,
        createdById: currentUser.id,
        validationStatusId: validationStatus.id,
      };

      // Save forecast
      if (isEditMode && id) {
        await FlowForecastService.update(Number(id), forecastDTO);
        showNotification('Forecast updated successfully', 'success');
      } else {
        await FlowForecastService.create(forecastDTO);
        showNotification(
          submitForValidation
            ? 'Forecast created and submitted for validation'
            : 'Forecast saved as draft',
          'success'
        );
      }

      // Navigate back to list
      setTimeout(() => {
        navigate('/flow/forecasts');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving forecast:', error);

      if (error.response?.status === 400) {
        showNotification(
          error.response.data.message || 'Please check your input values',
          'error'
        );
      } else if (error.response?.status === 409) {
        showNotification(
          'A forecast already exists for this infrastructure/product/date',
          'error'
        );
      } else {
        showNotification(
          error.message || 'An unexpected error occurred',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data: ForecastFormData) => onSubmit(data, false))();
  };

  const handleSubmitForValidation = () => {
    handleSubmit((data: ForecastFormData) => onSubmit(data, true))();
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading forecast data...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>Unable to load employee information. Please log in again.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Flow Forecast' : 'New Flow Forecast'}
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="infrastructureId"
                control={control}
                rules={{ required: 'Infrastructure is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Infrastructure *"
                    error={!!errors.infrastructureId}
                    helperText={errors.infrastructureId?.message}
                  >
                    <MenuItem value="">Select Infrastructure</MenuItem>
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
                rules={{ required: 'Product is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Product *"
                    error={!!errors.productId}
                    helperText={errors.productId?.message}
                  >
                    <MenuItem value="">Select Product</MenuItem>
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
                name="forecastDate"
                control={control}
                rules={{ required: 'Forecast date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Forecast Date *"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.forecastDate}
                    helperText={errors.forecastDate?.message || 'Date must be in the future'}
                    inputProps={{
                      min: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="estimatedVolume"
                control={control}
                rules={{ 
                  required: 'Estimated volume is required',
                  min: { value: 0, message: 'Volume must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Estimated Volume *"
                    error={!!errors.estimatedVolume}
                    helperText={errors.estimatedVolume?.message}
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
                name="confidence"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography gutterBottom>
                      Confidence Level: {field.value}%
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
                      Indicates how confident you are in this forecast prediction
                    </FormHelperText>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    placeholder="Add any additional information or assumptions about this forecast..."
                    inputProps={{ maxLength: 500 }}
                    helperText={`${field.value?.length || 0}/500 characters`}
                  />
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
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmitForValidation}
              disabled={loading}
            >
              Submit for Validation
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
