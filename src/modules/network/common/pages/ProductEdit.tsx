/**
 * Product Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed to match ProductDTO schema with all required fields
 * @updated 01-08-2026 - Display multilingual designations in one row
 * @updated 01-10-2026 - Added i18n translations for all text elements
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { ProductService } from '../services';
import { ProductDTO } from '../dto';

const ProductEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = !!productId;

  const [product, setProduct] = useState<Partial<ProductDTO>>({
    code: '',
    designationFr: '',
    designationAr: undefined,
    designationEn: undefined,
    density: 0,
    viscosity: 0,
    flashPoint: 0,
    sulfurContent: 0,
    isHazardous: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getById(Number(productId));
      setProduct(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError(err.message || t('product.edit.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!product.code || product.code.trim().length === 0) {
      errors.code = t('product.edit.validation.codeRequired');
    } else if (product.code.length > 10) {
      errors.code = t('product.edit.validation.codeMaxLength');
    }

    if (!product.designationFr || product.designationFr.trim().length === 0) {
      errors.designationFr = t('product.edit.validation.designationFrRequired');
    } else if (product.designationFr.length > 100) {
      errors.designationFr = t('product.edit.validation.designationMaxLength');
    }

    if (product.designationAr && product.designationAr.length > 100) {
      errors.designationAr = t('product.edit.validation.designationMaxLength');
    }

    if (product.designationEn && product.designationEn.length > 100) {
      errors.designationEn = t('product.edit.validation.designationMaxLength');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof ProductDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProduct({ ...product, [field]: value || undefined });
    
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

      const productData: ProductDTO = {
        id: product.id,
        code: product.code!,
        designationFr: product.designationFr!,
        designationEn: product.designationEn || undefined,
        designationAr: product.designationAr || undefined,
        density: Number(product.density),
        viscosity: Number(product.viscosity),
        flashPoint: Number(product.flashPoint),
        sulfurContent: Number(product.sulfurContent),
        isHazardous: Boolean(product.isHazardous),
      };

      if (isEditMode) {
        await ProductService.update(Number(productId), productData);
      } else {
        await ProductService.create(productData);
      }

      navigate('/network/common/products');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.message || err.message || t('product.edit.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/common/products');
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
          {isEditMode ? t('product.edit.title') : t('product.create.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? t('product.edit.subtitle') : t('product.create.subtitle')}
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
                {t('product.edit.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('product.edit.fields.code')}
                    value={product.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('product.edit.fields.codeHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('product.edit.sections.designations')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('product.edit.fields.designationFr')}
                    value={product.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr || t('product.edit.fields.designationFrHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('product.edit.fields.designationAr')}
                    value={product.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    error={!!validationErrors.designationAr}
                    helperText={validationErrors.designationAr || t('product.edit.fields.designationArHelper')}
                    inputProps={{ dir: 'rtl' }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('product.edit.fields.designationEn')}
                    value={product.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    error={!!validationErrors.designationEn}
                    helperText={validationErrors.designationEn || t('product.edit.fields.designationEnHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('product.edit.sections.properties')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.edit.fields.density')}
                    value={product.density ?? 0}
                    onChange={handleChange('density')}
                    required
                    helperText={t('product.edit.fields.densityHelper')}
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.edit.fields.viscosity')}
                    value={product.viscosity ?? 0}
                    onChange={handleChange('viscosity')}
                    required
                    helperText={t('product.edit.fields.viscosityHelper')}
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.edit.fields.flashPoint')}
                    value={product.flashPoint ?? 0}
                    onChange={handleChange('flashPoint')}
                    required
                    helperText={t('product.edit.fields.flashPointHelper')}
                    inputProps={{ step: 0.1 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.edit.fields.sulfurContent')}
                    value={product.sulfurContent ?? 0}
                    onChange={handleChange('sulfurContent')}
                    required
                    helperText={t('product.edit.fields.sulfurContentHelper')}
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={product.isHazardous || false}
                        onChange={handleChange('isHazardous')}
                      />
                    }
                    label={t('product.edit.fields.isHazardous')}
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
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default ProductEdit;
