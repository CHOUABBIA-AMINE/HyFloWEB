/**
 * OperationList Page - Flow Operation Management
 * 
 * Displays paginated list of flow operations with:
 * - Search and filtering by infrastructure, product, type, date range
 * - Sorting by date, volume, status
 * - Actions: Create, Edit, Delete, View Details, Validate
 * - Validation status indicators
 * - Operation type badges (PRODUCED, TRANSPORTED, CONSUMED)
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 01-31-2026 - Added i18n translations
 * @updated 01-31-2026 - Added Validate action button for PENDING operations
 * @updated 01-30-2026 - Fixed date property access for FlowOperationDTO
 * @updated 02-13-2026 - UI: Containerized header and updated button to IconButton style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
  MenuItem,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Factory as FactoryIcon,
  LocalShipping as ShippingIcon,
  Inventory as ConsumedIcon,
  FactCheck as ValidateIcon,
} from '@mui/icons-material';

import { FlowOperationService } from '../services/FlowOperationService';
import { InfrastructureService } from '@/modules/network/core/services/InfrastructureService';
import { ProductService } from '@/modules/network/common/services/ProductService';
import { OperationTypeService } from '@/modules/flow/type/services/OperationTypeService';
import type { FlowOperationDTO } from '../dto/FlowOperationDTO';
import type { InfrastructureDTO } from '@/modules/network/core/dto/InfrastructureDTO';
import type { ProductDTO } from '@/modules/network/common/dto/ProductDTO';
import type { OperationTypeDTO } from '@/modules/flow/type/dto/OperationTypeDTO';
import type { Pageable } from '@/types/pagination';

export const OperationList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State
  const [operations, setOperations] = useState<FlowOperationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<FlowOperationDTO | null>(null);
  
  // Filters
  const [infrastructures, setInfrastructures] = useState<InfrastructureDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationTypeDTO[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<number | ''>('');
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load data on mount and when filters change
  useEffect(() => {
    loadOperations();
  }, [page, rowsPerPage, searchTerm, selectedInfrastructure, selectedProduct, selectedType, startDate, endDate]);

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [infras, prods, types] = await Promise.all([
        InfrastructureService.getAllNoPagination(),
        ProductService.getAllNoPagination(),
        OperationTypeService.getAllNoPagination(),
      ]);
      setInfrastructures(infras);
      setProducts(prods);
      setOperationTypes(types);
    } catch (err: any) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadOperations = async () => {
    try {
      setLoading(true);
      setError(null);

      const pageable: Pageable = {
        page,
        size: rowsPerPage,
        sort: 'date,desc',
      };

      let result;

      // Apply filters in priority order
      if (startDate && endDate) {
        result = await FlowOperationService.getByDateRange(startDate, endDate, pageable);
      } else if (selectedType) {
        result = await FlowOperationService.getByType(Number(selectedType), pageable);
      } else if (selectedInfrastructure) {
        result = await FlowOperationService.getByInfrastructure(Number(selectedInfrastructure), pageable);
      } else if (selectedProduct) {
        result = await FlowOperationService.getByProduct(Number(selectedProduct), pageable);
      } else if (searchTerm) {
        result = await FlowOperationService.globalSearch(searchTerm, pageable);
      } else {
        result = await FlowOperationService.getAll(pageable);
      }

      setOperations(result.content);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      console.error('Error loading operations:', err);
      setError(err.message || t('flow.operation.alerts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadOperations();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedInfrastructure('');
    setSelectedProduct('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleDeleteClick = (operation: FlowOperationDTO) => {
    setOperationToDelete(operation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!operationToDelete?.id) return;

    try {
      await FlowOperationService.delete(operationToDelete.id);
      setDeleteDialogOpen(false);
      setOperationToDelete(null);
      loadOperations();
    } catch (err: any) {
      console.error('Error deleting operation:', err);
      setError(err.message || t('flow.operation.alerts.deleteError'));
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'VALIDATED':
        return <CheckCircleIcon color="success" />;
      case 'PENDING':
        return <PendingIcon color="warning" />;
      case 'DRAFT':
        return <CancelIcon color="disabled" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = (status?: string): "success" | "warning" | "default" | "error" => {
    switch (status?.toUpperCase()) {
      case 'VALIDATED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'DRAFT':
        return 'default';
      default:
        return 'default';
    }
  };

  const getOperationTypeIcon = (typeCode?: string) => {
    switch (typeCode?.toUpperCase()) {
      case 'PRODUCED':
        return <FactoryIcon />;
      case 'TRANSPORTED':
        return <ShippingIcon />;
      case 'CONSUMED':
        return <ConsumedIcon />;
      default:
        return null;
    }
  };

  const getOperationTypeColor = (typeCode?: string): "primary" | "secondary" | "info" | "default" => {
    switch (typeCode?.toUpperCase()) {
      case 'PRODUCED':
        return 'primary';
      case 'TRANSPORTED':
        return 'secondary';
      case 'CONSUMED':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && operations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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
                {t('flow.operation.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('flow.operation.subtitle')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('action.refresh', 'Refresh')}>
                <IconButton onClick={loadOperations} size="medium" color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('flow.operation.new')}>
                <IconButton onClick={() => navigate('/flow/operations/new')} size="medium" color="primary">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label={t('flow.operation.filters.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label={t('flow.operation.filters.infrastructure')}
                value={selectedInfrastructure}
                onChange={(e) => setSelectedInfrastructure(e.target.value as number | '')}
              >
                <MenuItem value="">{t('flow.operation.filters.all')}</MenuItem>
                {infrastructures.map((infra) => (
                  <MenuItem key={infra.id} value={infra.id}>
                    {infra.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label={t('flow.operation.filters.product')}
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value as number | '')}
              >
                <MenuItem value="">{t('flow.operation.filters.all')}</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.designationFr}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label={t('flow.operation.filters.type')}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as number | '')}
              >
                <MenuItem value="">{t('flow.operation.filters.all')}</MenuItem>
                {operationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={1.5}>
              <TextField
                fullWidth
                type="date"
                label={t('flow.operation.filters.from')}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={1.5}>
              <TextField
                fullWidth
                type="date"
                label={t('flow.operation.filters.to')}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={handleClearFilters}>
                  {t('flow.operation.filters.clearFilters')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('flow.operation.fields.date')}</TableCell>
                <TableCell>{t('flow.operation.fields.type')}</TableCell>
                <TableCell>{t('flow.operation.fields.infrastructure')}</TableCell>
                <TableCell>{t('flow.operation.fields.product')}</TableCell>
                <TableCell align="right">{t('flow.operation.fields.volume')}</TableCell>
                <TableCell>{t('flow.operation.fields.recordedBy')}</TableCell>
                <TableCell align="center">{t('flow.operation.fields.status')}</TableCell>
                <TableCell align="center">{t('flow.operation.fields.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">{t('flow.operation.noOperations')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                operations.map((operation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>{operation.operationDate}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getOperationTypeIcon(operation.type?.code) || undefined}
                        label={operation.type?.code || 'N/A'}
                        size="small"
                        color={getOperationTypeColor(operation.type?.code)}
                      />
                    </TableCell>
                    <TableCell>{operation.infrastructure?.code || 'N/A'}</TableCell>
                    <TableCell>{operation.product?.designationFr || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {operation.volume?.toLocaleString()} m³
                    </TableCell>
                    <TableCell>
                      {operation.recordedBy ? 
                        `${operation.recordedBy.firstNameLt} ${operation.recordedBy.lastNameLt}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={operation.validationStatus?.code || 'Unknown'}>
                        <Chip
                          icon={getStatusIcon(operation.validationStatus?.code)}
                          label={operation.validationStatus?.code || 'Unknown'}
                          size="small"
                          color={getStatusColor(operation.validationStatus?.code)}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      {/* Validate Button - Only for PENDING operations */}
                      {operation.validationStatus?.code === 'PENDING' && (
                        <Tooltip title={t('flow.operation.tooltips.validate')}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => navigate(`/flow/operations/${operation.id}/validate`)}
                          >
                            <ValidateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Edit Button - Disabled for VALIDATED operations */}
                      <Tooltip title={operation.validationStatus?.code === 'VALIDATED' ? t('flow.operation.tooltips.cannotEditValidated') : t('flow.operation.tooltips.edit')}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/flow/operations/${operation.id}/edit`)}
                            disabled={operation.validationStatus?.code === 'VALIDATED'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      {/* Delete Button - Disabled for VALIDATED operations */}
                      <Tooltip title={operation.validationStatus?.code === 'VALIDATED' ? t('flow.operation.tooltips.cannotDeleteValidated') : t('flow.operation.tooltips.delete')}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(operation)}
                            disabled={operation.validationStatus?.code === 'VALIDATED'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('flow.operation.delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('flow.operation.deleteConfirm', {
              type: operationToDelete?.type?.code || '',
              infrastructure: operationToDelete?.infrastructure?.code || '',
              date: operationToDelete?.operationDate || ''
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('flow.operation.actions.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            {t('flow.operation.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
