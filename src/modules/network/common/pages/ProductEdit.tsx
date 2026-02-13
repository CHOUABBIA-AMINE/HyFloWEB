/**
 * Product Edit/Create Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed to match ProductDTO schema with all required fields
 * @updated 01-08-2026 - Display multilingual designations in one row
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
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
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
      setError(err.message || t('common.errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!product.code || product.code.trim().length === 0) {
      errors.code = t('common.validation.codeRequired');
    } else if (product.code.length > 10) {
      errors.code = t('common.validation.maxLength', { field: t('common.fields.code'), max: 10 });
    }

    if (!product.designationFr || product.designationFr.trim().length === 0) {
      errors.designationFr = t('common.validation.designationFrRequired');
    } else if (product.designationFr.length > 100) {
      errors.designationFr = t('common.validation.maxLength', { field: t('common.fields.designationFr'), max: 100 });
    }

    if (product.designationAr && product.designationAr.length > 100) {
      errors.designationAr = t('common.validation.maxLength', { field: t('common.fields.designationAr'), max: 100 });
    }

    if (product.designationEn && product.designationEn.length > 100) {
      errors.designationEn = t('common.validation.maxLength', { field: t('common.fields.designationEn'), max: 100 });
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
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
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                {isEditMode 
                  ? t('common.page.editTitle', { entity: t('product.title') })
                  : t('common.page.createTitle', { entity: t('product.title') })
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode 
                  ? t('common.page.editSubtitle', { entity: t('product.title') })
                  : t('common.page.createSubtitle', { entity: t('product.title') })
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('common.fields.code')}
                    value={product.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('common.fields.codeHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.designations')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationFr')}
                    value={product.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr || t('common.fields.designationFrHelper')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationAr')}
                    value={product.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    error={!!validationErrors.designationAr}
                    helperText={validationErrors.designationAr || t('common.fields.designationArHelper')}
                    inputProps={{ dir: 'rtl' }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('common.fields.designationEn')}
                    value={product.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    error={!!validationErrors.designationEn}
                    helperText={validationErrors.designationEn || t('common.fields.designationEnHelper')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.technicalDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.fields.density')}
                    value={product.density ?? 0}
                    onChange={handleChange('density')}
                    required
                    helperText={t('product.fields.densityHelper')}
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.fields.viscosity')}
                    value={product.viscosity ?? 0}
                    onChange={handleChange('viscosity')}
                    required
                    helperText={t('product.fields.viscosityHelper')}
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.fields.flashPoint')}
                    value={product.flashPoint ?? 0}
                    onChange={handleChange('flashPoint')}
                    required
                    helperText={t('product.fields.flashPointHelper')}
                    inputProps={{ step: 0.1 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('product.fields.sulfurContent')}
                    value={product.sulfurContent ?? 0}
                    onChange={handleChange('sulfurContent')}
                    required
                    helperText={t('product.fields.sulfurContentHelper')}
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
                    label={t('product.fields.isHazardous')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default ProductEdit;
