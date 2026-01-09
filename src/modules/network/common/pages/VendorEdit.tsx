/**
 * Vendor Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed to match VendorDTO schema
 * @updated 01-09-2026 - Fixed DTO field names and added multilingual support
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
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { VendorService } from '../services';
import { VendorTypeService } from '../../type/services';
import { CountryService } from '../../../general/localization/services';
import { VendorDTO } from '../dto';

const VendorEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const isEditMode = !!vendorId;

  const [vendor, setVendor] = useState<Partial<VendorDTO>>({
    name: undefined,
    shortName: undefined,
    vendorTypeId: 0,
    countryId: 0,
  });

  const [vendorTypes, setVendorTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load vendor if editing
      let vendorData: VendorDTO | null = null;
      if (isEditMode) {
        vendorData = await VendorService.getById(Number(vendorId));
      }
      
      // Load vendor types and countries
      const [types, countriesData] = await Promise.all([
        VendorTypeService.getAllNoPagination(),
        CountryService.getAllNoPagination(),
      ]);
      
      setVendorTypes(Array.isArray(types) ? types : []);
      setCountries(Array.isArray(countriesData) ? countriesData : []);
      
      if (vendorData) {
        setVendor(vendorData);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get designation based on current language
   * Fallback to French if preferred language not available
   */
  const getDesignation = (item: any): string => {
    const lang = i18n.language;
    
    if (lang === 'ar' && item.designationAr) {
      return item.designationAr;
    }
    if (lang === 'en' && item.designationEn) {
      return item.designationEn;
    }
    
    // Fallback to French (required field)
    return item.designationFr || '';
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (vendor.name && vendor.name.length > 100) {
      errors.name = 'Name must not exceed 100 characters';
    }

    if (vendor.shortName && (vendor.shortName.length < 2 || vendor.shortName.length > 20)) {
      errors.shortName = 'Short name must be between 2 and 20 characters';
    }

    if (!vendor.vendorTypeId) {
      errors.vendorTypeId = 'Vendor type is required';
    }

    if (!vendor.countryId) {
      errors.countryId = 'Country is required';
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
        name: vendor.name || undefined,
        shortName: vendor.shortName || undefined,
        vendorTypeId: Number(vendor.vendorTypeId),
        countryId: Number(vendor.countryId),
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
                    label="Vendor Name"
                    value={vendor.name || ''}
                    onChange={handleChange('name')}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || 'Optional vendor name (max 100 characters)'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Short Name"
                    value={vendor.shortName || ''}
                    onChange={handleChange('shortName')}
                    error={!!validationErrors.shortName}
                    helperText={validationErrors.shortName || 'Optional short name (2-20 characters)'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Vendor Type"
                    value={vendor.vendorTypeId || ''}
                    onChange={handleChange('vendorTypeId')}
                    required
                    error={!!validationErrors.vendorTypeId}
                    helperText={validationErrors.vendorTypeId}
                  >
                    {vendorTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {getDesignation(type)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Country"
                    value={vendor.countryId || ''}
                    onChange={handleChange('countryId')}
                    required
                    error={!!validationErrors.countryId}
                    helperText={validationErrors.countryId}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {getDesignation(country)}
                      </MenuItem>
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
