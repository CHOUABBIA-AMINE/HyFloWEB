/**
 * ProcessingPlant Edit/Create Page
 * Comprehensive form for processing plant management
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
import { ProcessingPlantService } from '../services';
import { LocationService, OperationalStatusService } from '../../common/services';
import { ProcessingPlantDTO } from '../dto/ProcessingPlantDTO';

const ProcessingPlantEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { plantId } = useParams<{ plantId: string }>();
  const isEditMode = !!plantId;

  const [plant, setPlant] = useState<Partial<ProcessingPlantDTO>>({
    code: '',
    name: '',
    capacity: 0,
    operationalStatusId: 0,
    locationId: undefined,
    processingPlantTypeId: undefined,
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [plantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let plantData: ProcessingPlantDTO | null = null;
      if (isEditMode) {
        plantData = await ProcessingPlantService.getById(Number(plantId));
      }
      
      const [locationsData, statusesData] = await Promise.allSettled([
        LocationService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
      ]);

      if (locationsData.status === 'fulfilled') {
        const locs = Array.isArray(locationsData.value) ? locationsData.value : [];
        setLocations(locs);
      }

      if (statusesData.status === 'fulfilled') {
        const stats = Array.isArray(statusesData.value) ? statusesData.value : [];
        setOperationalStatuses(stats);
      }

      if (plantData) setPlant(plantData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!plant.name || plant.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!plant.code || plant.code.trim().length < 2) errors.code = 'Code is required';
    if (!plant.operationalStatusId) errors.operationalStatusId = 'Operational status is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof ProcessingPlantDTO) => (e: any) => {
    setPlant({ ...plant, [field]: e.target.value });
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

      const plantData: Partial<ProcessingPlantDTO> = {
        code: plant.code!,
        name: plant.name!,
        capacity: Number(plant.capacity) || 0,
        operationalStatusId: Number(plant.operationalStatusId),
        locationId: plant.locationId ? Number(plant.locationId) : undefined,
        processingPlantTypeId: plant.processingPlantTypeId ? Number(plant.processingPlantTypeId) : undefined,
      };

      if (isEditMode) {
        await ProcessingPlantService.update(Number(plantId), { id: Number(plantId), ...plantData } as ProcessingPlantDTO);
      } else {
        await ProcessingPlantService.create(plantData as ProcessingPlantDTO);
      }

      navigate('/network/core/processing-plants');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save processing plant');
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
        <Button startIcon={<BackIcon />} onClick={() => navigate('/network/core/processing-plants')} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEditMode ? 'Edit Processing Plant' : 'Create Processing Plant'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update processing plant information' : 'Create a new processing plant'}
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
                    fullWidth
                    label="Code"
                    value={plant.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={plant.name || ''}
                    onChange={handleChange('name')}
                    required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={plant.capacity ?? 0}
                    onChange={handleChange('capacity')}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Operational Status"
                    value={plant.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')}
                    required
                    error={!!validationErrors.operationalStatusId}
                    helperText={validationErrors.operationalStatusId}
                  >
                    {operationalStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>{status.nameEn}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Location"
                    value={plant.locationId || ''}
                    onChange={handleChange('locationId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/network/core/processing-plants')}
                disabled={saving}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                sx={{ minWidth: 150 }}
              >
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default ProcessingPlantEdit;