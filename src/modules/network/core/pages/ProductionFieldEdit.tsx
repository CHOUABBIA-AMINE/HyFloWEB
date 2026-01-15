/**
 * ProductionField Edit/Create Page
 * Comprehensive form for production field management
 * 
 * @author CHOUABBIA Amine
 * @created 01-15-2026
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, Button, CircularProgress, Alert,
  Grid, Paper, Divider, Stack, MenuItem
} from '@mui/material';
import {
  Save as SaveIcon, Cancel as CancelIcon, ArrowBack as BackIcon
} from '@mui/icons-material';
import { ProductionFieldService, ProcessingPlantService } from '../services';
import { LocationService, OperationalStatusService } from '../../common/services';
import { ProductionFieldDTO } from '../dto/ProductionFieldDTO';

const ProductionFieldEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fieldId } = useParams<{ fieldId: string }>();
  const isEditMode = !!fieldId;

  const [field, setField] = useState<Partial<ProductionFieldDTO>>({
    code: '',
    name: '',
    estimatedReserves: 0,
    operationalStatusId: 0,
    locationId: undefined,
    productionFieldTypeId: undefined,
    processingPlantId: undefined,
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [processingPlants, setProcessingPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [fieldId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let fieldData: ProductionFieldDTO | null = null;
      if (isEditMode) {
        fieldData = await ProductionFieldService.getById(Number(fieldId));
      }
      
      const [locationsData, statusesData, plantsData] = await Promise.allSettled([
        LocationService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        ProcessingPlantService.getAllNoPagination(),
      ]);

      if (locationsData.status === 'fulfilled') {
        const locs = Array.isArray(locationsData.value) ? locationsData.value : [];
        setLocations(locs);
      }

      if (statusesData.status === 'fulfilled') {
        const stats = Array.isArray(statusesData.value) ? statusesData.value : [];
        setOperationalStatuses(stats);
      }

      if (plantsData.status === 'fulfilled') {
        const plants = Array.isArray(plantsData.value) ? plantsData.value : [];
        setProcessingPlants(plants);
      }

      if (fieldData) setField(fieldData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!field.name || field.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!field.code || field.code.trim().length < 2) errors.code = 'Code is required';
    if (!field.operationalStatusId) errors.operationalStatusId = 'Operational status is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof ProductionFieldDTO) => (e: any) => {
    setField({ ...field, [field]: e.target.value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const fieldData: Partial<ProductionFieldDTO> = {
        code: field.code!,
        name: field.name!,
        estimatedReserves: Number(field.estimatedReserves) || 0,
        operationalStatusId: Number(field.operationalStatusId),
        locationId: field.locationId ? Number(field.locationId) : undefined,
        productionFieldTypeId: field.productionFieldTypeId ? Number(field.productionFieldTypeId) : undefined,
        processingPlantId: field.processingPlantId ? Number(field.processingPlantId) : undefined,
      };

      if (isEditMode) {
        await ProductionFieldService.update(Number(fieldId), { id: Number(fieldId), ...fieldData } as ProductionFieldDTO);
      } else {
        await ProductionFieldService.create(fieldData as ProductionFieldDTO);
      }

      navigate('/network/core/production-fields');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save production field');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/network/core/production-fields')} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEditMode ? 'Edit Production Field' : 'Create Production Field'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update production field information' : 'Create a new production field'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Code" value={field.code || ''}
                    onChange={handleChange('code')} required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Name" value={field.name || ''}
                    onChange={handleChange('name')} required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Estimated Reserves"
                    type="number" value={field.estimatedReserves ?? 0}
                    onChange={handleChange('estimatedReserves')}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Operational Status"
                    value={field.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')} required
                    error={!!validationErrors.operationalStatusId}
                    helperText={validationErrors.operationalStatusId}
                  >
                    {operationalStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>{status.nameEn}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Location"
                    value={field.locationId || ''}
                    onChange={handleChange('locationId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label="Processing Plant"
                    value={field.processingPlantId || ''}
                    onChange={handleChange('processingPlantId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {processingPlants.map((plant) => (
                      <MenuItem key={plant.id} value={plant.id}>{plant.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<CancelIcon />}
                onClick={() => navigate('/network/core/production-fields')} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving} sx={{ minWidth: 150 }}>
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default ProductionFieldEdit;