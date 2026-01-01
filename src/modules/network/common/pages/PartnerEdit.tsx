/**
 * Partner Edit/Create Page
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

import { partnerService } from '../services/partnerService';
import { PartnerDTO } from '../dto/PartnerDTO';
import { partnerTypeService } from '../../type/services';
import { countryService } from '../../../common/administration/services';
import { getLocalizedName as getAdminLocalizedName } from '../../../common/administration/utils';

const PartnerEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { partnerId } = useParams<{ partnerId: string }>();

  const isEditMode = !!partnerId;
  const currentLanguage = i18n.language || 'en';

  const [partner, setPartner] = useState<Partial<PartnerDTO>>({
    name: '',
    shortName: '',
    partnerTypeId: 0,
    countryId: 0,
  });

  const [partnerTypes, setPartnerTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getPartnerTypeLabel = (obj: any): string => {
    if (!obj) return '';
    if (currentLanguage === 'ar') return obj.designationAr || obj.designationFr || obj.designationEn || '';
    if (currentLanguage === 'en') return obj.designationEn || obj.designationFr || obj.designationAr || '';
    return obj.designationFr || obj.designationEn || obj.designationAr || '';
  };

  const sortedPartnerTypes = useMemo(() => {
    const copy = [...partnerTypes];
    return copy.sort((a, b) => getPartnerTypeLabel(a).localeCompare(getPartnerTypeLabel(b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerTypes, currentLanguage]);

  const sortedCountries = useMemo(() => {
    const copy = [...countries];
    return copy.sort((a, b) =>
      getAdminLocalizedName(a, currentLanguage).localeCompare(getAdminLocalizedName(b, currentLanguage))
    );
  }, [countries, currentLanguage]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const loadData = async () => {
    try {
      setLoading(true);

      let partnerData: PartnerDTO | null = null;
      if (isEditMode) {
        partnerData = await partnerService.getById(Number(partnerId));
      }

      const [typesData, countriesData] = await Promise.allSettled([
        partnerTypeService.getAll(),
        countryService.getAllList(),
      ]);

      if (typesData.status === 'fulfilled') {
        const types = Array.isArray(typesData.value) ? typesData.value : (typesData.value as any)?.data || [];
        setPartnerTypes(types);
      }

      if (countriesData.status === 'fulfilled') {
        const items = Array.isArray(countriesData.value)
          ? countriesData.value
          : (countriesData.value as any)?.data || (countriesData.value as any)?.content || [];
        setCountries(items);
      }

      if (partnerData) setPartner(partnerData);

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!partner.shortName || partner.shortName.trim().length < 2) errors.shortName = 'Short name is required';
    if (!partner.partnerTypeId) errors.partnerTypeId = 'Partner type is required';
    if (!partner.countryId) errors.countryId = 'Country is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PartnerDTO) => (e: any) => {
    const value = e.target.value;
    setPartner((prev) => ({ ...prev, [field]: value }));

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

      const payload: PartnerDTO = {
        id: isEditMode ? Number(partnerId) : 0,
        name: partner.name || null,
        shortName: String(partner.shortName || ''),
        partnerTypeId: Number(partner.partnerTypeId || 0),
        countryId: Number(partner.countryId || 0),
      };

      if (isEditMode) {
        await partnerService.update(Number(partnerId), payload);
      } else {
        await partnerService.create(payload);
      }

      navigate('/network/common/partners');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save partner');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/network/common/partners');

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
          {isEditMode ? 'Edit Partner' : 'Create Partner'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update partner information' : 'Create a new partner'}
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
                    label="Short name"
                    value={partner.shortName || ''}
                    onChange={handleChange('shortName')}
                    required
                    error={!!validationErrors.shortName}
                    helperText={validationErrors.shortName}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Name" value={partner.name || ''} onChange={handleChange('name')} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Partner type"
                    value={partner.partnerTypeId || ''}
                    onChange={handleChange('partnerTypeId')}
                    required
                    error={!!validationErrors.partnerTypeId}
                    helperText={validationErrors.partnerTypeId}
                  >
                    {sortedPartnerTypes.map((pt) => (
                      <MenuItem key={pt.id} value={pt.id}>
                        {getPartnerTypeLabel(pt)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Country"
                    value={partner.countryId || ''}
                    onChange={handleChange('countryId')}
                    required
                    error={!!validationErrors.countryId}
                    helperText={validationErrors.countryId}
                  >
                    {sortedCountries.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {getAdminLocalizedName(c, currentLanguage)}
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

export default PartnerEdit;
