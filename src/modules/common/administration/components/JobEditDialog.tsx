/**
 * Job Edit Dialog Component (Nested)
 * Create/Edit job within a structure
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-28-2025
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Box,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import jobService from '../services/JobService';
import { JobDTO } from '../dto/JobDTO';

interface JobEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  structureId: number;
  job?: JobDTO | null;
}

const JobEditDialog = ({ open, onClose, onSave, structureId, job }: JobEditDialogProps) => {
  const { t } = useTranslation();
  const isEditMode = Boolean(job);

  const [formData, setFormData] = useState<Partial<JobDTO>>({
    code: '',
    designationFr: '',
    designationEn: '',
    designationAr: '',
    structureId: structureId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        code: job.code || '',
        designationFr: job.designationFr || '',
        designationEn: job.designationEn || '',
        designationAr: job.designationAr || '',
        structureId: job.structureId,
      });
    } else {
      setFormData({
        code: '',
        designationFr: '',
        designationEn: '',
        designationAr: '',
        structureId: structureId,
      });
    }
    setError('');
    setValidationErrors({});
  }, [job, structureId, open]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = 'Code is required';
    }
    if (!formData.designationFr?.trim()) {
      errors.designationFr = 'French designation is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const jobData: JobDTO = {
        ...formData,
        id: job?.id || 0,
        code: formData.code!,
        designationFr: formData.designationFr!,
        structureId: structureId,
      };

      if (isEditMode) {
        await jobService.update(job!.id, jobData);
      } else {
        await jobService.create(jobData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Failed to save job:', err);
      setError(err.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof JobDTO) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          {isEditMode ? 'Edit Job' : 'Create Job'}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Code"
              value={formData.code || ''}
              onChange={handleChange('code')}
              error={Boolean(validationErrors.code)}
              helperText={validationErrors.code}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Designation (French)"
              value={formData.designationFr || ''}
              onChange={handleChange('designationFr')}
              error={Boolean(validationErrors.designationFr)}
              helperText={validationErrors.designationFr}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Designation (English)"
              value={formData.designationEn || ''}
              onChange={handleChange('designationEn')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Designation (Arabic)"
              value={formData.designationAr || ''}
              onChange={handleChange('designationAr')}
              disabled={loading}
              dir="rtl"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ boxShadow: 2 }}
        >
          {loading ? 'Saving...' : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobEditDialog;
