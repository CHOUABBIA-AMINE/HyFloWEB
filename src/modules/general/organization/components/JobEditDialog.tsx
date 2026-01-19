/**
 * Job Edit Dialog Component
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Removed hardcoded fallback text from translation keys
 * @updated 01-08-2026 - Added comprehensive multilanguage support
 * @updated 01-08-2026 - Added structureId prop for pre-setting structure
 * @created 01-06-2026
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
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { JobDTO } from '../dto';
import { StructureDTO } from '../dto';
import { JobService, StructureService } from '../services';

interface JobEditDialogProps {
  open: boolean;
  job?: JobDTO | null;
  structureId?: number;  // Optional: pre-set structure for new jobs
  structures?: StructureDTO[];  // Optional: provide structures list
  onClose: () => void;
  onSave: () => void;
}

const JobEditDialog = ({ open, job, structureId, structures: providedStructures, onClose, onSave }: JobEditDialogProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
  const [formData, setFormData] = useState<Partial<JobDTO>>({
    code: '',
    designationFr: '',
    designationAr: '',
    designationEn: '',
    structureId: structureId || undefined,
  });
  const [structures, setStructures] = useState<StructureDTO[]>(providedStructures || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Get localized designation for structure dropdown
   */
  const getLocalizedDesignation = (structure: StructureDTO): string => {
    if (currentLanguage === 'ar') {
      return structure.designationAr || structure.designationFr || structure.designationEn || '';
    }
    if (currentLanguage === 'en') {
      return structure.designationEn || structure.designationFr || structure.designationAr || '';
    }
    return structure.designationFr || structure.designationEn || structure.designationAr || '';
  };

  useEffect(() => {
    if (job) {
      setFormData({
        code: job.code,
        designationFr: job.designationFr,
        designationAr: job.designationAr || '',
        designationEn: job.designationEn || '',
        structureId: job.structureId,
      });
    } else {
      setFormData({
        code: '',
        designationFr: '',
        designationAr: '',
        designationEn: '',
        structureId: structureId || undefined,
      });
    }
    setValidationErrors({});
  }, [job, open, structureId]);

  useEffect(() => {
    if (!providedStructures && open) {
      loadStructures();
    }
  }, [open, providedStructures]);

  const loadStructures = async () => {
    try {
      const response = await StructureService.getAllNoPagination();
      setStructures(response);
    } catch (err: any) {
      console.error('Failed to load structures:', err);
    }
  };

  const handleChange = (field: keyof JobDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: field === 'structureId' ? Number(value) : value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code || formData.code.trim().length === 0) {
      errors.code = t('common.validation.codeRequired');
    }

    if (!formData.designationFr || formData.designationFr.trim().length === 0) {
      errors.designationFr = t('common.validation.designationFrRequired');
    }

    if (!formData.structureId) {
      errors.structureId = t('common.validation.required', { field: t('job.fields.structure') });
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

      const jobData: JobDTO = {
        code: formData.code!,
        designationFr: formData.designationFr!,
        designationAr: formData.designationAr || undefined,
        designationEn: formData.designationEn || undefined,
        structureId: formData.structureId!,
      };

      if (job?.id) {
        // Edit mode - id is guaranteed to exist
        await JobService.update(job.id, jobData);
      } else {
        // Create mode
        await JobService.create(jobData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Failed to save job:', err);
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
              {job 
                ? t('job.dialog.editTitle')
                : t('job.dialog.createTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {job 
                ? t('job.dialog.editSubtitle')
                : t('job.dialog.createSubtitle')}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('common.fields.code')}
            value={formData.code || ''}
            onChange={handleChange('code')}
            required
            error={!!validationErrors.code}
            helperText={validationErrors.code || t('common.fields.codeHelper')}
            sx={{ mb: 2, mt: 1 }}
          />

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, mt: 2 }}>
            {t('common.sections.designations')}
          </Typography>

          <TextField
            fullWidth
            label={t('common.fields.designationFr')}
            value={formData.designationFr || ''}
            onChange={handleChange('designationFr')}
            required
            error={!!validationErrors.designationFr}
            helperText={validationErrors.designationFr || t('common.fields.designationFrHelper')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('common.fields.designationEn')}
            value={formData.designationEn || ''}
            onChange={handleChange('designationEn')}
            helperText={t('common.fields.designationEnHelper')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('common.fields.designationAr')}
            value={formData.designationAr || ''}
            onChange={handleChange('designationAr')}
            helperText={t('common.fields.designationArHelper')}
            inputProps={{ dir: 'rtl' }}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, mt: 2 }}>
            {t('job.sections.assignment')}
          </Typography>

          <TextField
            fullWidth
            select
            label={t('job.fields.structure')}
            value={formData.structureId || ''}
            onChange={handleChange('structureId')}
            required
            disabled={!!structureId}  // Disable if pre-set by parent
            error={!!validationErrors.structureId}
            helperText={
              validationErrors.structureId || 
              (structureId 
                ? t('job.fields.structureLocked')
                : t('job.fields.structureHelper'))
            }
            sx={{ mb: 2 }}
          >
            {structures.map((structure) => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.code} - {getLocalizedDesignation(structure)}
              </MenuItem>
            ))}
          </TextField>
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

export default JobEditDialog;