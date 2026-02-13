/**
 * Vendor Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed to match VendorDTO schema
 * @updated 01-09-2026 - Fixed DTO field names and added multilingual support
 * @updated 01-10-2026 - Added i18n translations for all text elements
 * @updated 01-10-2026 - Fixed translation keys to use editPage/createPage structure
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Stack,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
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
      setError(err.message || t('common.errors.loadingFailed'));
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
      errors.name = t('common.validation.maxLength', { field: t('common.fields.name'), max: 100 });
    }

    if (vendor.shortName && (vendor.shortName.length < 2 || vendor.shortName.length > 20)) {
      errors.shortName = t('common.validation.lengthBetween', { field: t('common.fields.shortName'), min: 2, max: 20 });
    }

    if (!vendor.vendorTypeId) {
      errors.vendorTypeId = t('common.validation.required', { field: t('vendor.fields.vendorType') });
    }

    if (!vendor.countryId) {
      errors.countryId = t('common.validation.required', { field: t('common.fields.country') });
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
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
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {isEditMode 
                  ? t('common.page.editTitle', { entity: t('vendor.title') })
                  : t('common.page.createTitle', { entity: t('vendor.title') })
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode 
                  ? t('common.page.editSubtitle', { entity: t('vendor.title') })
                  : t('common.page.createSubtitle', { entity: t('vendor.title') })
                }
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('common.cancel')}>
                <IconButton 
                  onClick={handleCancel} 
                  disabled={saving}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.save')}>
                <IconButton 
                  onClick={() => handleSubmit()} 
                  disabled={saving}
                  size="medium"
                  color="primary"
                >
                  {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

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
                {t('common.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.name')}
                    value={vendor.name || ''}
                    onChange={handleChange('name')}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('common.fields.nameHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.shortName')}
                    value={vendor.shortName || ''}
                    onChange={handleChange('shortName')}
                    error={!!validationErrors.shortName}
                    helperText={validationErrors.shortName || t('common.fields.shortNameHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('vendor.fields.vendorType')}
                    value={vendor.vendorTypeId || ''}
                    onChange={handleChange('vendorTypeId')}
                    required
                    error={!!validationErrors.vendorTypeId}
                    helperText={validationErrors.vendorTypeId || t('vendor.fields.vendorTypeHelper')}
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
                    label={t('common.fields.country')}
                    value={vendor.countryId || ''}
                    onChange={handleChange('countryId')}
                    required
                    error={!!validationErrors.countryId}
                    helperText={validationErrors.countryId || t('common.fields.countryHelper')}
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
        </Stack>
      </form>
    </Box>
  );
};

export default VendorEdit;
