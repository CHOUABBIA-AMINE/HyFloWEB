/**
 * Job Edit Dialog Component
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed type safety for id fields
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
} from '@mui/material';
import { JobDTO } from '../dto';
import { StructureDTO } from '../dto';
import { JobService } from '../services';

interface JobEditDialogProps {
  open: boolean;
  job?: JobDTO | null;
  structures: StructureDTO[];
  onClose: () => void;
  onSave: () => void;
}

const JobEditDialog = ({ open, job, structures, onClose, onSave }: JobEditDialogProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<JobDTO>>({
    code: '',
    designationFr: '',
    designationAr: '',
    designationEn: '',
    structureId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        structureId: undefined,
      });
    }
  }, [job, open]);

  const handleChange = (field: keyof JobDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: field === 'structureId' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.designationFr || !formData.structureId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const jobData: JobDTO = {
        code: formData.code,
        designationFr: formData.designationFr,
        designationAr: formData.designationAr || undefined,
        designationEn: formData.designationEn || undefined,
        structureId: formData.structureId,
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
      setError(err.response?.data?.message || err.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {job ? t('common.edit') : t('common.create')} Job
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Code"
            value={formData.code || ''}
            onChange={handleChange('code')}
            required
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            fullWidth
            label="Designation (French)"
            value={formData.designationFr || ''}
            onChange={handleChange('designationFr')}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Designation (Arabic)"
            value={formData.designationAr || ''}
            onChange={handleChange('designationAr')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Designation (English)"
            value={formData.designationEn || ''}
            onChange={handleChange('designationEn')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Structure"
            value={formData.structureId || ''}
            onChange={handleChange('structureId')}
            required
            sx={{ mb: 2 }}
          >
            {structures.map((structure) => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.designationFr}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobEditDialog;
