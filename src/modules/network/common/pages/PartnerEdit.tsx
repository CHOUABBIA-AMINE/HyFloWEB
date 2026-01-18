/**
 * Partner Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed to match PartnerDTO schema
 * @updated 01-10-2026 - Fixed DTO field names and added multilingual support
 * @updated 01-10-2026 - Added i18n translations for all text elements
 * @updated 01-10-2026 - Fixed translation keys to use editPage/createPage structure
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
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
import { PartnerService } from '../services';
import { PartnerTypeService } from '../../type/services';
import { CountryService } from '../../../general/localization/services';
import { PartnerDTO } from '../dto';

const PartnerEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { partnerId } = useParams<{ partnerId: string }>();
  const isEditMode = !!partnerId;

  const [partner, setPartner] = useState<Partial<PartnerDTO>>({
    shortName: '',
    name: undefined,
    partnerTypeId: 0,
    countryId: 0,
  });

  const [partnerTypes, setPartnerTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [partnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load partner if editing
      let partnerData: PartnerDTO | null = null;
      if (isEditMode) {
        partnerData = await PartnerService.getById(Number(partnerId));
      }
      
      // Load partner types and countries
      const [types, countriesData] = await Promise.all([
        PartnerTypeService.getAllNoPagination(),
        CountryService.getAllNoPagination(),
      ]);
      
      setPartnerTypes(Array.isArray(types) ? types : []);
      setCountries(Array.isArray(countriesData) ? countriesData : []);
      
      if (partnerData) {
        setPartner(partnerData);
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

    if (!partner.shortName || partner.shortName.trim().length < 2 || partner.shortName.trim().length > 20) {
      errors.shortName = t('common.validation.shortNameRequired');
    }

    if (partner.name && partner.name.length > 100) {
      errors.name = t('common.validation.maxLength', { field: t('common.fields.name'), max: 100 });
    }

    if (!partner.partnerTypeId) {
      errors.partnerTypeId = t('common.validation.required', { field: t('partner.fields.partnerType') });
    }

    if (!partner.countryId) {
      errors.countryId = t('common.validation.required', { field: t('common.fields.country') });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PartnerDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPartner({ ...partner, [field]: value || undefined });
    
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

      const partnerData: PartnerDTO = {
        id: partner.id,
        shortName: partner.shortName!,
        name: partner.name || undefined,
        partnerTypeId: Number(partner.partnerTypeId),
        countryId: Number(partner.countryId),
      };

      if (isEditMode) {
        await PartnerService.update(Number(partnerId), partnerData);
      } else {
        await PartnerService.create(partnerData);
      }

      navigate('/network/common/partners');
    } catch (err: any) {
      console.error('Failed to save partner:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/common/partners');
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
          {isEditMode 
            ? t('common.page.editTitle', { entity: t('partner.title') })
            : t('common.page.createTitle', { entity: t('partner.title') })
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('partner.title') })
            : t('common.page.createSubtitle', { entity: t('partner.title') })
          }
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
                {t('common.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.shortName')}
                    value={partner.shortName || ''}
                    onChange={handleChange('shortName')}
                    required
                    error={!!validationErrors.shortName}
                    helperText={validationErrors.shortName || t('common.fields.shortNameHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('common.fields.name')}
                    value={partner.name || ''}
                    onChange={handleChange('name')}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('common.fields.nameHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('partner.fields.partnerType')}
                    value={partner.partnerTypeId || ''}
                    onChange={handleChange('partnerTypeId')}
                    required
                    error={!!validationErrors.partnerTypeId}
                    helperText={validationErrors.partnerTypeId || t('partner.fields.partnerTypeHelper')}
                  >
                    {partnerTypes.map((type) => (
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
                    value={partner.countryId || ''}
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
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default PartnerEdit;
