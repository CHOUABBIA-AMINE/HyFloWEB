/**
 * Vendor Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed null vs undefined types
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { VendorService } from '../services';
import { VendorDTO } from '../dto';

const VendorEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const isEditMode = !!vendorId;

  const [vendor, setVendor] = useState<Partial<VendorDTO>>({
    code: '',
    name: undefined,
    shortName: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadVendor();
    }
  }, [vendorId]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const data = await VendorService.getById(Number(vendorId));
      setVendor(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to load vendor:', err);
      setError(err.message || 'Failed to load vendor');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!vendor.code || vendor.code.trim().length < 2) {
      errors.code = 'Vendor code must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof VendorDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVendor({ ...vendor, [field]: value || undefined });
    
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const vendorData: VendorDTO = {
        id: vendor.id,
        code: vendor.code!,
        name: vendor.name || undefined,
        shortName: vendor.shortName || undefined,
      };

      if (isEditMode) {
        await VendorService.update(Number(vendorId), vendorData);
      } else {
        await VendorService.create(vendorData);
      }

      navigate('/network/common/vendors');
    } catch (err: any) {
      console.error('Failed to save vendor:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/common/vendors');
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
        <Button
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isEditMode ? 'Edit Vendor' : 'Create Vendor'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update vendor information' : 'Create a new vendor'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor Code"
                    value={vendor.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || 'Unique vendor code'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    value={vendor.name || ''}
                    onChange={handleChange('name')}
                    helperText="Optional vendor name"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Short Name"
                    value={vendor.shortName || ''}
                    onChange={handleChange('shortName')}
                    helperText="Optional short name (2-20 characters)"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
                size="large"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                size="large"
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

export default VendorEdit;
