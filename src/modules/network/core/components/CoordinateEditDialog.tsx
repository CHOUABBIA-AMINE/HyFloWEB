/**
 * Coordinate Edit Dialog Component
 * Pattern: Same as JobEditDialog in Structure module
 * 
 * @author CHOUABBIA Amine
 * @created 02-06-2026
 * @updated 02-06-2026 19:02 - Fixed: use elevation (not altitude), sequence required
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { CoordinateDTO } from '@/modules/general/localization/dto/CoordinateDTO';
import { CoordinateService } from '@/modules/general/localization/services';

interface CoordinateEditDialogProps {
  open: boolean;
  coordinate?: CoordinateDTO | null;
  pipelineId?: number;  // Optional: pre-set pipeline for new coordinates
  maxSequence?: number;  // Current max sequence for auto-incrementing
  onClose: () => void;
  onSave: () => void;
}

const CoordinateEditDialog = ({ 
  open, 
  coordinate, 
  pipelineId,
  maxSequence = 0,
  onClose, 
  onSave 
}: CoordinateEditDialogProps) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<CoordinateDTO>>({
    sequence: 1,
    latitude: 0,
    longitude: 0,
    elevation: undefined,
    infrastructureId: pipelineId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (coordinate) {
      setFormData({
        sequence: coordinate.sequence,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        elevation: coordinate.elevation,
        infrastructureId: coordinate.infrastructureId || pipelineId,
      });
    } else {
      // Auto-increment sequence for new coordinates
      setFormData({
        sequence: maxSequence + 1,
        latitude: 0,
        longitude: 0,
        elevation: undefined,
        infrastructureId: pipelineId,
      });
    }
    setValidationErrors({});
    setError('');
  }, [coordinate, open, pipelineId, maxSequence]);

  const handleChange = (field: keyof CoordinateDTO) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData({ 
      ...formData, 
      [field]: value === '' ? undefined : Number(value)
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.sequence === undefined || formData.sequence === null || formData.sequence <= 0) {
      errors.sequence = 'Sequence must be a positive number';
    }

    if (formData.latitude === undefined || formData.latitude === null) {
      errors.latitude = t('common.validation.required', { field: t('coordinate.fields.latitude') });
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude === undefined || formData.longitude === null) {
      errors.longitude = t('common.validation.required', { field: t('coordinate.fields.longitude') });
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!formData.infrastructureId) {
      errors.infrastructureId = 'Infrastructure ID is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError(t('common.errors.validationFailed'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const coordinateData: CoordinateDTO = {
        sequence: formData.sequence!,
        latitude: formData.latitude!,
        longitude: formData.longitude!,
        elevation: formData.elevation,
        infrastructureId: formData.infrastructureId || pipelineId,
      };

      if (coordinate?.id) {
        // Edit mode
        await CoordinateService.update(coordinate.id, coordinateData);
      } else {
        // Create mode
        await CoordinateService.create(coordinateData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Failed to save coordinate:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {coordinate 
                ? t('coordinate.dialog.editTitle')
                : t('coordinate.dialog.createTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {coordinate 
                ? t('coordinate.dialog.editSubtitle')
                : t('coordinate.dialog.createSubtitle')}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('coordinate.fields.sequence')}
                type="number"
                value={formData.sequence ?? ''}
                onChange={handleChange('sequence')}
                required
                error={!!validationErrors.sequence}
                helperText={validationErrors.sequence || 'Order of coordinate along pipeline route (positive integer)'}
                inputProps={{ 
                  step: 1, 
                  min: 1
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('coordinate.fields.latitude')}
                type="number"
                value={formData.latitude ?? ''}
                onChange={handleChange('latitude')}
                required
                error={!!validationErrors.latitude}
                helperText={validationErrors.latitude || 'Decimal degrees (-90 to 90)'}
                inputProps={{ 
                  step: '0.000001', 
                  min: -90, 
                  max: 90 
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('coordinate.fields.longitude')}
                type="number"
                value={formData.longitude ?? ''}
                onChange={handleChange('longitude')}
                required
                error={!!validationErrors.longitude}
                helperText={validationErrors.longitude || 'Decimal degrees (-180 to 180)'}
                inputProps={{ 
                  step: '0.000001', 
                  min: -180, 
                  max: 180 
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('coordinate.fields.elevation')}
                type="number"
                value={formData.elevation ?? ''}
                onChange={handleChange('elevation')}
                helperText="Elevation above sea level in meters (optional)"
                inputProps={{ 
                  step: '0.01' 
                }}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Use decimal degrees format (e.g., 36.753768, 3.042048). 
              Sequence number determines the order of coordinates along the pipeline route.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CoordinateEditDialog;