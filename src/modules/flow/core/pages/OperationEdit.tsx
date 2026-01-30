/**
 * OperationEdit Page - Flow Operation Create/Edit
 * 
 * Form for creating or editing flow operations with:
 * - Infrastructure and product selection
 * - Operation type (PRODUCED, TRANSPORTED, CONSUMED)
 * - Operation date (must be past or present)
 * - Volume input
 * - Notes field
 * - Recorded by employee tracking
 * - Validation status tracking
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 01-30-2026 - Aligned with updated FlowOperationDTO
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
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

import { FlowOperationService } from '../services/FlowOperationService';
import { InfrastructureService } from '@/modules/network/core/services/InfrastructureService';
import { ProductService } from '@/modules/network/common/services/ProductService';
import { OperationTypeService } from '@/modules/flow/type/services/OperationTypeService';
import { ValidationStatusService } from '@/modules/flow/common/services/ValidationStatusService';
import UserService from '@/modules/system/security/services/UserService';
import { getUsernameFromToken } from '@/shared/utils/jwtUtils';

import type { FlowOperationDTO } from '../dto/FlowOperationDTO';
import type { InfrastructureDTO } from '@/modules/network/core/dto/InfrastructureDTO';
import type { ProductDTO } from '@/modules/network/common/dto/ProductDTO';
import type { OperationTypeDTO } from '@/modules/flow/type/dto/OperationTypeDTO';
import type { ValidationStatusDTO } from '@/modules/flow/common/dto/ValidationStatusDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

interface OperationFormData {
  infrastructureId: number | '';
  productId: number | '';
  typeId: number | '';
  operationDate: string;
  volume: number | '';
  notes: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const OperationEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OperationFormData>({
    defaultValues: {
      infrastructureId: '',
      productId: '',
      typeId: '',
      operationDate: new Date().toISOString().split('T')[0], // Today
      volume: '',
      notes: '',
    },
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [currentUser, setCurrentUser] = useState<EmployeeDTO | null>(null);
  const [infrastructures, setInfrastructures] = useState<InfrastructureDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationTypeDTO[]>([]);
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
      const [infras, prods, types, statuses] = await Promise.all([
        InfrastructureService.getAllNoPagination(),
        ProductService.getAllNoPagination(),
        OperationTypeService.getAllNoPagination(),
        ValidationStatusService.getAllNoPagination(),
      ]);

      setInfrastructures(infras);
      setProducts(prods);
      setOperationTypes(types);
      setValidationStatuses(statuses);

      // Load existing operation if edit mode
      if (isEditMode && id) {
        const operation = await FlowOperationService.getById(Number(id));
        setValue('infrastructureId', operation.infrastructureId);
        setValue('productId', operation.productId);
        setValue('typeId', operation.typeId);
        setValue('operationDate', operation.operationDate);
        setValue('volume', operation.volume);
        setValue('notes', operation.notes || '');
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

  const onSubmit = async (data: OperationFormData) => {
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

      if (!data.typeId) {
        showNotification('Please select an operation type', 'warning');
        return;
      }

      if (!data.operationDate) {
        showNotification('Please select an operation date', 'warning');
        return;
      }

      // Validate operation date is not in the future
      const operationDate = new Date(data.operationDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (operationDate > today) {
        showNotification('Operation date cannot be in the future', 'warning');
        return;
      }

      if (!data.volume || data.volume <= 0) {
        showNotification('Please enter a valid volume', 'warning');
        return;
      }

      if (!currentUser?.id) {
        showNotification('User information not available', 'error');
        return;
      }

      // Get default validation status (PENDING)
      const validationStatus = validationStatuses.find(s => s.code === 'PENDING');

      if (!validationStatus?.id) {
        throw new Error('Validation status not found');
      }

      // Prepare DTO
      const operationDTO: FlowOperationDTO = {
        infrastructureId: Number(data.infrastructureId),
        productId: Number(data.productId),
        typeId: Number(data.typeId),
        operationDate: data.operationDate,
        volume: Number(data.volume),
        notes: data.notes || undefined,
        recordedById: currentUser.id,
        validationStatusId: validationStatus.id,
      };

      // Save operation
      if (isEditMode && id) {
        await FlowOperationService.update(Number(id), operationDTO);
        showNotification('Operation updated successfully', 'success');
      } else {
        await FlowOperationService.create(operationDTO);
        showNotification('Operation created successfully', 'success');
      }

      // Navigate back to list
      setTimeout(() => {
        navigate('/flow/operations');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving operation:', error);

      if (error.response?.status === 400) {
        showNotification(
          error.response.data.message || 'Please check your input values',
          'error'
        );
      } else if (error.response?.status === 409) {
        showNotification(
          'An operation already exists with these details',
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

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading operation data...</Typography>
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
        {isEditMode ? 'Edit Flow Operation' : 'New Flow Operation'}
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
                name="typeId"
                control={control}
                rules={{ required: 'Operation type is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Operation Type *"
                    error={!!errors.typeId}
                    helperText={errors.typeId?.message}
                  >
                    <MenuItem value="">Select Type</MenuItem>
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
                name="operationDate"
                control={control}
                rules={{ required: 'Operation date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Operation Date *"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.operationDate}
                    helperText={errors.operationDate?.message || 'Date cannot be in the future'}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0], // Today
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="volume"
                control={control}
                rules={{ 
                  required: 'Volume is required',
                  min: { value: 0, message: 'Volume must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Volume *"
                    error={!!errors.volume}
                    helperText={errors.volume?.message}
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
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    placeholder="Add any additional information about this operation..."
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
              onClick={() => navigate('/flow/operations')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {isEditMode ? 'Update' : 'Create'} Operation
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
