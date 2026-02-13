/**
 * OperationEdit Page - Flow Operation Create/Edit
 * 
 * Form for creating or editing flow operations with:
 * - Infrastructure and product selection
 * - Operation type (PRODUCED, TRANSPORTED, CONSUMED)
 * - Operation date (must be past or present)
 * - Volume input
 * - Notes field
 * - Two-step workflow: Record (Draft/Submit) -> Validate
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 01-31-2026 - Added i18n translations
 * @updated 01-30-2026 - Aligned with updated FlowOperationDTO and Reading workflow
 * @updated 01-30-2026 - Fixed data validation and error handling
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
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
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SwapHoriz as SwapHorizIcon,
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<OperationFormData>({
    defaultValues: {
      infrastructureId: '',
      productId: '',
      typeId: '',
      operationDate: new Date().toISOString().split('T')[0],
      volume: '',
      notes: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [currentUser, setCurrentUser] = useState<EmployeeDTO | null>(null);
  const [infrastructures, setInfrastructures] = useState<InfrastructureDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationTypeDTO[]>([]);
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatusDTO[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

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
        error.message || t('flow.operation.alerts.loadError'),
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };

  const onSubmit = async (data: OperationFormData, submitForValidation: boolean = false) => {
    try {
      setLoading(true);

      if (!data.infrastructureId) {
        showNotification(t('flow.operation.fields.selectInfrastructure'), 'warning');
        return;
      }

      if (!data.productId) {
        showNotification(t('flow.operation.fields.selectProduct'), 'warning');
        return;
      }

      if (!data.typeId) {
        showNotification(t('flow.operation.fields.selectType'), 'warning');
        return;
      }

      if (!data.operationDate) {
        showNotification(t('flow.operation.fields.date'), 'warning');
        return;
      }

      const operationDate = new Date(data.operationDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (operationDate > today) {
        showNotification('Operation date cannot be in the future', 'warning');
        return;
      }

      if (!data.volume || data.volume <= 0) {
        showNotification(t('flow.operation.fields.volume'), 'warning');
        return;
      }

      if (!currentUser?.id) {
        showNotification('User information not available', 'error');
        return;
      }

      const statusCode = submitForValidation ? 'PENDING' : 'DRAFT';
      const validationStatus = validationStatuses.find(s => s.code === statusCode);

      if (!validationStatus?.id) {
        throw new Error(`Validation status '${statusCode}' not found`);
      }

      const operationDTO: FlowOperationDTO = {
        infrastructureId: Number(data.infrastructureId),
        productId: Number(data.productId),
        typeId: Number(data.typeId),
        operationDate: data.operationDate,
        volume: Number(data.volume),
        notes: data.notes?.trim() || undefined,
        recordedById: currentUser.id,
        validationStatusId: validationStatus.id,
      };

      if (isEditMode && id) {
        await FlowOperationService.update(Number(id), operationDTO);
        showNotification(t('flow.operation.alerts.updateSuccess'), 'success');
      } else {
        await FlowOperationService.create(operationDTO);
        showNotification(
          submitForValidation
            ? t('flow.operation.alerts.submitSuccess')
            : t('flow.operation.alerts.saveDraftSuccess'),
          'success'
        );
      }

      setHasUnsavedChanges(false);

      setTimeout(() => {
        navigate('/flow/operations');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving operation:', error);
      
      let errorMessage = t('flow.operation.alerts.createError');

      if (error.response?.status === 400) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data: OperationFormData) => onSubmit(data, false))();
  };

  const handleSubmitForValidation = () => {
    handleSubmit((data: OperationFormData) => onSubmit(data, true))();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/flow/operations');
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/flow/operations');
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>{t('flow.operation.alerts.loadError')}</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>Unable to load employee information. Please log in again.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Alert>
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
              <SwapHorizIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {isEditMode ? t('flow.operation.edit') : t('flow.operation.create')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isEditMode 
                    ? 'Update operation details'
                    : 'Record a new flow operation (draft or submit)'
                  }
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('flow.operation.actions.cancel')}>
                <IconButton 
                  onClick={handleCancel} 
                  disabled={loading}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('flow.operation.actions.saveDraft')}>
                <IconButton 
                  onClick={handleSaveDraft} 
                  disabled={loading}
                  size="medium"
                  color="default"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  {loading ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title={t('flow.operation.actions.submitValidation')}>
                <IconButton 
                  onClick={handleSubmitForValidation} 
                  disabled={loading}
                  size="medium"
                  color="primary"
                >
                  {loading ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="infrastructureId"
                control={control}
                rules={{ required: t('flow.operation.fields.infrastructure') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.operation.fields.infrastructure') + ' *'}
                    error={!!errors.infrastructureId}
                    helperText={errors.infrastructureId?.message}
                  >
                    <MenuItem value="">{t('flow.operation.fields.selectInfrastructure')}</MenuItem>
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
                rules={{ required: t('flow.operation.fields.product') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.operation.fields.product') + ' *'}
                    error={!!errors.productId}
                    helperText={errors.productId?.message}
                  >
                    <MenuItem value="">{t('flow.operation.fields.selectProduct')}</MenuItem>
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
                rules={{ required: t('flow.operation.fields.type') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t('flow.operation.fields.type') + ' *'}
                    error={!!errors.typeId}
                    helperText={errors.typeId?.message}
                  >
                    <MenuItem value="">{t('flow.operation.fields.selectType')}</MenuItem>
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
                rules={{ required: t('flow.operation.fields.date') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label={t('flow.operation.fields.date') + ' *'}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.operationDate}
                    helperText={errors.operationDate?.message || 'Date cannot be in the future'}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
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
                  required: t('flow.operation.fields.volume'),
                  min: { value: 0, message: 'Volume must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('flow.operation.fields.volume') + ' *'}
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
                    label={t('flow.operation.fields.notes')}
                    placeholder={t('flow.operation.fields.notesPlaceholder')}
                    inputProps={{ maxLength: 500 }}
                    helperText={`${field.value?.length || 0}/500 characters`}
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Stay</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

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
