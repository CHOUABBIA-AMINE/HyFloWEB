/**
 * Pipeline System Edit/Create Page
 *
 * Aligned with StructureEdit.tsx pattern (tabs)
 * Aligned with PipelineSystemDTO schema
 *
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 * @updated 01-08-2026
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-18-2026 - Fixed translation key: common.actions → list.actions
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

import { PipelineSystemService, PipelineService } from '../services';
import { OperationalStatusService, ProductService } from '../../common/services';
import { StructureService } from '../../../general/organization/services';
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

  // Form state - aligned with PipelineSystemDTO
  const [pipelineSystem, setPipelineSystem] = useState<Partial<PipelineSystemDTO>>({
    code: '',
    name: '',
    productId: 0,
    operationalStatusId: 0,
    structureId: 0,
  });

  // Dropdown data
  const [products, setProducts] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);

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
  const sortedStructures = useMemo(() => sortByLocalizedName(structures, currentLanguage), [structures, currentLanguage]);

  const loadData = async () => {
    try {
      setLoading(true);

      let systemData: PipelineSystemDTO | null = null;
      if (isEditMode) {
        systemData = await PipelineSystemService.getById(Number(pipelineSystemId));
      }

      const [productsData, statusesData, structuresData] = await Promise.allSettled([
        ProductService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
      ]);

      // Products: getAllNoPagination returns array directly
      if (productsData.status === 'fulfilled') {
        setProducts(Array.isArray(productsData.value) ? productsData.value : []);
      }

      // Operational Statuses: getAllNoPagination returns array directly
      if (statusesData.status === 'fulfilled') {
        setOperationalStatuses(Array.isArray(statusesData.value) ? statusesData.value : []);
      }

      // Structures: getAllNoPagination returns array directly
      if (structuresData.status === 'fulfilled') {
        setStructures(Array.isArray(structuresData.value) ? structuresData.value : []);
      }

      if (systemData) {
        setPipelineSystem(systemData);
      }

      setError('');
    } catch (err: any) {
      setError(err.message || t('common.errors.loadingDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async () => {
    if (!pipelineSystemId) return;

    try {
      setPipelinesLoading(true);
      setPipelinesError('');
      const list = await PipelineService.findByPipelineSystem(Number(pipelineSystemId));
      setPipelines(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setPipelinesError(err.message || t('common.errors.loadingFailed'));
      setPipelines([]);
    } finally {
      setPipelinesLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!pipelineSystem.name || pipelineSystem.name.trim().length < 2) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 2 });
    }

    if (!pipelineSystem.code || pipelineSystem.code.trim().length < 2) {
      errors.code = t('common.validation.codeRequired');
    }

    if (!pipelineSystem.productId) {
      errors.productId = t('common.validation.required', { field: t('common.fields.product') });
    }

    if (!pipelineSystem.operationalStatusId) {
      errors.operationalStatusId = t('common.validation.required', { field: t('common.fields.operationalStatus') });
    }

    if (!pipelineSystem.structureId) {
      errors.structureId = t('common.validation.required', { field: t('common.fields.structure') });
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
        structureId: Number(pipelineSystem.structureId),
      };

      if (isEditMode) {
        await PipelineSystemService.update(Number(pipelineSystemId), payload);
        setSuccess(t('common.messages.updateSuccess'));
      } else {
        const created = await PipelineSystemService.create(payload);
        setSuccess(t('common.messages.createSuccess'));
        setTimeout(() => navigate(`/network/core/pipeline-systems/${created.id}/edit`), 800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
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
      headerName: t('common.fields.name'),
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
      headerName: t('common.fields.code'),
      width: 140,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
      ),
    },
    {
      field: 'operationalStatusId',
      headerName: t('common.fields.status'),
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineDTO;
        if (row.operationalStatus) return <>{getLocalizedName(row.operationalStatus as any, currentLanguage)}</>;
        return <>{row.operationalStatusId}</>;
      },
    },
    {
      field: 'vendorId',
      headerName: t('common.fields.vendor'),
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as PipelineDTO;
        if (row.vendor?.name) return <>{row.vendor.name}</>;
        return <>{row.vendorId}</>;
      },
    },
    {
      field: 'actions',
      headerName: t('list.actions'),
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
            {isEditMode 
              ? t('common.page.editTitle', { entity: t('pipelineSystem.title') })
              : t('common.page.createTitle', { entity: t('pipelineSystem.title') })
            }
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isEditMode 
            ? t('common.page.editSubtitle', { entity: t('pipelineSystem.title') })
            : t('common.page.createSubtitle', { entity: t('pipelineSystem.title') })
          }
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
          <Tab label={t('pipelineSystem.tabs.generalInformation')} />
          <Tab label={t('pipelineSystem.tabs.pipelines')} disabled={!isEditMode} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: General Information */}
          <TabPanel value={activeTab} index={0}>
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
                          value={pipelineSystem.name || ''}
                          onChange={handleChange('name')}
                          required
                          error={!!validationErrors.name}
                          helperText={validationErrors.name || t('common.fields.nameHelper')}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={t('common.fields.code')}
                          value={pipelineSystem.code || ''}
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
                      {t('common.sections.classification')}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label={t('common.fields.structure')}
                          value={pipelineSystem.structureId || ''}
                          onChange={handleChange('structureId')}
                          required
                          error={!!validationErrors.structureId}
                          helperText={validationErrors.structureId}
                        >
                          {sortedStructures.length > 0 ? (
                            sortedStructures.map((structure) => (
                              <MenuItem key={structure.id} value={structure.id}>
                                {getLocalizedName(structure, currentLanguage)}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>{t('common.loading')}</MenuItem>
                          )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label={t('common.fields.product')}
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
                            <MenuItem disabled>{t('common.loading')}</MenuItem>
                          )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label={t('common.fields.operationalStatus')}
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
                            <MenuItem disabled>{t('common.loading')}</MenuItem>
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
                {t('pipelineSystem.tabs.pipelinesInSystem')}
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
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PipelineSystemEdit;