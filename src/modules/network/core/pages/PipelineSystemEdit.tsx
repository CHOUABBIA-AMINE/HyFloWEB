/**
 * Pipeline System Edit/Create Page
 *
 * Aligned with StructureEdit.tsx pattern (tabs)
 *
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 * @updated 01-01-2026
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  AccountTree as SystemIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { pipelineSystemService } from '../services/pipelineSystemService';
import { pipelineService } from '../services';
import { operationalStatusService, productService, regionService } from '../../common/services';
import { PipelineSystemDTO } from '../dto/PipelineSystemDTO';
import { PipelineDTO } from '../dto/PipelineDTO';
import { getLocalizedName, sortByLocalizedName } from '../utils/localizationUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pipeline-system-tabpanel-${index}`}
      aria-labelledby={`pipeline-system-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PipelineSystemEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pipelineSystemId } = useParams<{ pipelineSystemId: string }>();
  const isEditMode = !!pipelineSystemId;

  const currentLanguage = i18n.language || 'en';

  // Tabs
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [pipelineSystem, setPipelineSystem] = useState<Partial<PipelineSystemDTO>>({
    code: '',
    name: '',
    productId: 0,
    operationalStatusId: 0,
    regionId: 0,
  });

  // Dropdown data
  const [products, setProducts] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  // Pipelines tab data
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(false);
  const [pipelinesError, setPipelinesError] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineSystemId]);

  // Load pipelines when opening tab or when id changes
  useEffect(() => {
    if (activeTab === 1 && isEditMode) {
      loadPipelines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pipelineSystemId]);

  const sortedProducts = useMemo(() => sortByLocalizedName(products, currentLanguage), [products, currentLanguage]);
  const sortedOperationalStatuses = useMemo(
    () => sortByLocalizedName(operationalStatuses, currentLanguage),
    [operationalStatuses, currentLanguage]
  );
  const sortedRegions = useMemo(() => sortByLocalizedName(regions, currentLanguage), [regions, currentLanguage]);

  const loadData = async () => {
    try {
      setLoading(true);

      let systemData: PipelineSystemDTO | null = null;
      if (isEditMode) {
        systemData = await pipelineSystemService.getById(Number(pipelineSystemId));
      }

      const [productsData, statusesData, regionsData] = await Promise.allSettled([
        productService.getAll(),
        operationalStatusService.getAll(),
        regionService.getAll(),
      ]);

      if (productsData.status === 'fulfilled') {
        const list = Array.isArray(productsData.value)
          ? productsData.value
          : productsData.value?.data || productsData.value?.content || [];
        setProducts(list);
      }

      if (statusesData.status === 'fulfilled') {
        const list = Array.isArray(statusesData.value)
          ? statusesData.value
          : statusesData.value?.data || statusesData.value?.content || [];
        setOperationalStatuses(list);
      }

      if (regionsData.status === 'fulfilled') {
        const list = Array.isArray(regionsData.value)
          ? regionsData.value
          : regionsData.value?.data || regionsData.value?.content || [];
        setRegions(list);
      }

      if (systemData) {
        setPipelineSystem(systemData);
      }

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async () => {
    if (!pipelineSystemId) return;

    try {
      setPipelinesLoading(true);
      setPipelinesError('');
      const list = await pipelineService.getBySystem(Number(pipelineSystemId));
      setPipelines(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setPipelinesError(err.message || 'Failed to load pipelines');
      setPipelines([]);
    } finally {
      setPipelinesLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!pipelineSystem.name || pipelineSystem.name.trim().length < 2) {
      errors.name = 'System name must be at least 2 characters';
    }

    if (!pipelineSystem.code || pipelineSystem.code.trim().length < 2) {
      errors.code = 'Code is required';
    }

    if (!pipelineSystem.productId) {
      errors.productId = 'Product is required';
    }

    if (!pipelineSystem.operationalStatusId) {
      errors.operationalStatusId = 'Operational status is required';
    }

    if (!pipelineSystem.regionId) {
      errors.regionId = 'Region is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PipelineSystemDTO) => (e: any) => {
    const value = e.target.value;
    setPipelineSystem((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const payload: PipelineSystemDTO = {
        id: isEditMode ? Number(pipelineSystemId) : 0,
        code: String(pipelineSystem.code || ''),
        name: String(pipelineSystem.name || ''),
        productId: Number(pipelineSystem.productId),
        operationalStatusId: Number(pipelineSystem.operationalStatusId),
        regionId: Number(pipelineSystem.regionId),
      };

      if (isEditMode) {
        await pipelineSystemService.update(Number(pipelineSystemId), payload);
        setSuccess('Pipeline system updated successfully');
      } else {
        const created = await pipelineSystemService.create(payload);
        setSuccess('Pipeline system created successfully');
        setTimeout(() => navigate(`/network/core/pipeline-systems/${created.id}/edit`), 800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save pipeline system');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/pipeline-systems');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const pipelineColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
    {
      field: 'name',
      headerName: 'Pipeline Name',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'code',
      headerName: 'Code',
      width: 140,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
      ),
    },
    {
      field: 'operationalStatusId',
      headerName: 'Status',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineDTO;
        if (row.operationalStatus) return <>{getLocalizedName(row.operationalStatus as any, currentLanguage)}</>;
        if (row.operationalStatusName) return <>{row.operationalStatusName}</>;
        return <>{row.operationalStatusId}</>;
      },
    },
    {
      field: 'vendorId',
      headerName: 'Vendor',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineDTO;
        if (row.vendor?.name) return <>{row.vendor.name}</>;
        if (row.vendorName) return <>{row.vendorName}</>;
        return <>{row.vendorId}</>;
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 110,
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => navigate(`/network/core/pipelines/${params.row.id}/edit`)}
          sx={{ color: 'primary.main' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SystemIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {isEditMode ? 'Edit Pipeline System' : 'Create Pipeline System'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isEditMode ? 'Update pipeline system information and manage pipelines' : 'Create a new pipeline system'}
        </Typography>
        <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mt: 2 }}>
          {t('common.back')}
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs (StructureEdit model) */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab label="General Information" />
          <Tab label="Pipelines" disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information */}
          <TabPanel value={activeTab} index={0}>
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
                          label="System Name"
                          value={pipelineSystem.name || ''}
                          onChange={handleChange('name')}
                          required
                          error={!!validationErrors.name}
                          helperText={validationErrors.name}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Code"
                          value={pipelineSystem.code || ''}
                          onChange={handleChange('code')}
                          required
                          error={!!validationErrors.code}
                          helperText={validationErrors.code}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Classification
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Region"
                          value={pipelineSystem.regionId || ''}
                          onChange={handleChange('regionId')}
                          required
                          error={!!validationErrors.regionId}
                          helperText={validationErrors.regionId}
                        >
                          {sortedRegions.length > 0 ? (
                            sortedRegions.map((region) => (
                              <MenuItem key={region.id} value={region.id}>
                                {getLocalizedName(region, currentLanguage)}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Loading regions...</MenuItem>
                          )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Product"
                          value={pipelineSystem.productId || ''}
                          onChange={handleChange('productId')}
                          required
                          error={!!validationErrors.productId}
                          helperText={validationErrors.productId}
                        >
                          {sortedProducts.length > 0 ? (
                            sortedProducts.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {getLocalizedName(product, currentLanguage)}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Loading products...</MenuItem>
                          )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Operational Status"
                          value={pipelineSystem.operationalStatusId || ''}
                          onChange={handleChange('operationalStatusId')}
                          required
                          error={!!validationErrors.operationalStatusId}
                          helperText={validationErrors.operationalStatusId}
                        >
                          {sortedOperationalStatuses.length > 0 ? (
                            sortedOperationalStatuses.map((status) => (
                              <MenuItem key={status.id} value={status.id}>
                                {getLocalizedName(status, currentLanguage)}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Loading statuses...</MenuItem>
                          )}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Stack>
            </form>
          </TabPanel>

          {/* Tab 1: Pipelines */}
          <TabPanel value={activeTab} index={1}>
            {pipelinesError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPipelinesError('')}>
                {pipelinesError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Pipelines in this system
              </Typography>
              <IconButton onClick={loadPipelines} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>

            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <DataGrid
                rows={pipelines}
                columns={pipelineColumns}
                loading={pipelinesLoading}
                disableRowSelectionOnClick
                autoHeight
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                }}
              />
            </Paper>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Actions */}
      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={saving}
            sx={{ minWidth: 120 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
            sx={{ minWidth: 120, boxShadow: 2 }}
          >
            {saving ? 'Saving...' : t('common.save')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PipelineSystemEdit;
