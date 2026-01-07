/**
 * Vendor Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 01-07-2026 - Fixed service imports to use correct paths and UpperCase static methods
 */

import { useEffect, useMemo, useState } from 'react';
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
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { VendorService } from '../services';
import { VendorDTO } from '../dto/VendorDTO';
import { VendorTypeService } from '../../type/services';
import { CountryService } from '../../../general/localization/services';

const VendorEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();

  const isEditMode = !!vendorId;
  const currentLanguage = i18n.language || 'en';

  const [vendor, setVendor] = useState<Partial<VendorDTO>>({
    name: '',
    shortName: '',
    vendorTypeId: 0,
    countryId: 0,
  });

  const [vendorTypes, setVendorTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getLocalizedLabel = (obj: any): string => {
    if (!obj) return '';
    if (currentLanguage === 'ar') return obj.designationAr || obj.designationFr || obj.designationEn || '';
    if (currentLanguage === 'en') return obj.designationEn || obj.designationFr || obj.designationAr || '';
    return obj.designationFr || obj.designationEn || obj.designationAr || '';
  };

  const sortedVendorTypes = useMemo(() => {
    const copy = [...vendorTypes];
    return copy.sort((a, b) => getLocalizedLabel(a).localeCompare(getLocalizedLabel(b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorTypes, currentLanguage]);

  const sortedCountries = useMemo(() => {
    const copy = [...countries];
    return copy.sort((a, b) => getLocalizedLabel(a).localeCompare(getLocalizedLabel(b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, currentLanguage]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const loadData = async () => {
    try {
      setLoading(true);

      let vendorData: VendorDTO | null = null;
      if (isEditMode) {
        vendorData = await VendorService.getById(Number(vendorId));
      }

      const [typesData, countriesData] = await Promise.allSettled([
        VendorTypeService.getAllNoPagination(),
        CountryService.getAllNoPagination(),
      ]);

      if (typesData.status === 'fulfilled') {
        setVendorTypes(Array.isArray(typesData.value) ? typesData.value : []);
      }

      if (countriesData.status === 'fulfilled') {
        setCountries(Array.isArray(countriesData.value) ? countriesData.value : []);
      }

      if (vendorData) setVendor(vendorData);

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!vendor.vendorTypeId) errors.vendorTypeId = 'Vendor type is required';
    if (!vendor.countryId) errors.countryId = 'Country is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof VendorDTO) => (e: any) => {
    const value = e.target.value;
    setVendor((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setError('');

      const payload: VendorDTO = {
        id: isEditMode ? Number(vendorId) : 0,
        name: vendor.name || null,
        shortName: vendor.shortName || null,
        vendorTypeId: Number(vendor.vendorTypeId || 0),
        countryId: Number(vendor.countryId || 0),
      };

      if (isEditMode) {
        await VendorService.update(Number(vendorId), payload);
      } else {
        await VendorService.create(payload);
      }

      navigate('/network/common/vendors');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/network/common/vendors');

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
        <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mb: 2 }}>
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
                  <TextField fullWidth label="Short name" value={vendor.shortName || ''} onChange={handleChange('shortName')} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Name" value={vendor.name || ''} onChange={handleChange('name')} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Vendor type"
                    value={vendor.vendorTypeId || ''}
                    onChange={handleChange('vendorTypeId')}
                    required
                    error={!!validationErrors.vendorTypeId}
                    helperText={validationErrors.vendorTypeId}
                  >
                    {sortedVendorTypes.map((vt) => (
                      <MenuItem key={vt.id} value={vt.id}>
                        {getLocalizedLabel(vt)}
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
                    {sortedCountries.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {getLocalizedLabel(c)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving} size="large">
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
