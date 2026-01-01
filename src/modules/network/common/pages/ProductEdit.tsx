/**
 * Product Edit/Create Page
 *
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 */

import { useEffect, useState } from 'react';
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
  Switch,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as BackIcon } from '@mui/icons-material';

import { productService } from '../services/productService';
import { ProductDTO } from '../dto/ProductDTO';

const ProductEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const isCreateMode = productId === 'new' || !productId;

  const [product, setProduct] = useState<Partial<ProductDTO>>({
    code: '',
    designationFr: '',
    designationEn: '',
    designationAr: '',
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
    if (!isCreateMode) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getById(Number(productId));
      setProduct(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!product.code || product.code.trim().length < 2) errors.code = 'Code is required';
    if (!product.designationFr || product.designationFr.trim().length < 2) errors.designationFr = 'French designation is required';

    const numericFields: Array<keyof ProductDTO> = ['density', 'viscosity', 'flashPoint', 'sulfurContent'];
    numericFields.forEach((f) => {
      const v: any = (product as any)[f];
      if (v === undefined || v === null || Number.isNaN(Number(v))) {
        errors[f as string] = 'Required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof ProductDTO) => (e: any) => {
    const value = e.target.value;
    setProduct((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSwitch = (field: keyof ProductDTO) => (_e: any, checked: boolean) => {
    setProduct((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setError('');

      const payload: ProductDTO = {
        id: isCreateMode ? 0 : Number(productId),
        code: String(product.code || ''),
        designationFr: String(product.designationFr || ''),
        designationEn: product.designationEn || null,
        designationAr: product.designationAr || null,
        density: Number(product.density || 0),
        viscosity: Number(product.viscosity || 0),
        flashPoint: Number(product.flashPoint || 0),
        sulfurContent: Number(product.sulfurContent || 0),
        isHazardous: Boolean(product.isHazardous),
      };

      if (isCreateMode) {
        await productService.create(payload);
      } else {
        await productService.update(Number(productId), payload);
      }

      navigate('/network/common/products');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
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
        <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>

        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isCreateMode ? 'Create Product' : 'Edit Product'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isCreateMode ? 'Create a new product' : 'Update product information'}
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
                    label="Code"
                    value={product.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="French designation"
                    value={product.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="English designation"
                    value={product.designationEn || ''}
                    onChange={handleChange('designationEn')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Arabic designation"
                    value={product.designationAr || ''}
                    onChange={handleChange('designationAr')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Density"
                    type="number"
                    value={product.density ?? 0}
                    onChange={handleChange('density')}
                    error={!!validationErrors.density}
                    helperText={validationErrors.density}
                    inputProps={{ step: 0.0001 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Viscosity"
                    type="number"
                    value={product.viscosity ?? 0}
                    onChange={handleChange('viscosity')}
                    error={!!validationErrors.viscosity}
                    helperText={validationErrors.viscosity}
                    inputProps={{ step: 0.0001 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Flash point"
                    type="number"
                    value={product.flashPoint ?? 0}
                    onChange={handleChange('flashPoint')}
                    error={!!validationErrors.flashPoint}
                    helperText={validationErrors.flashPoint}
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Sulfur content"
                    type="number"
                    value={product.sulfurContent ?? 0}
                    onChange={handleChange('sulfurContent')}
                    error={!!validationErrors.sulfurContent}
                    helperText={validationErrors.sulfurContent}
                    inputProps={{ step: 0.0001 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={!!product.isHazardous} onChange={handleSwitch('isHazardous')} />}
                    label="Hazardous"
                  />
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

export default ProductEdit;
