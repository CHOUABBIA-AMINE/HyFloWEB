/**
 * ForecastList Page - Flow Forecast Management
 * 
 * Displays paginated list of flow forecasts with:
 * - Search and filtering by infrastructure, product, date range
 * - Sorting by date, accuracy
 * - Actions: Create, Edit, Delete, View Details
 * - Accuracy metrics display
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 01-30-2026 - Aligned with updated FlowForecastDTO
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import { FlowForecastService } from '../services/FlowForecastService';
import { InfrastructureService } from '@/modules/network/core/services/InfrastructureService';
import { ProductService } from '@/modules/network/common/services/ProductService';
import type { FlowForecastDTO } from '../dto/FlowForecastDTO';
import type { InfrastructureDTO } from '@/modules/network/core/dto/InfrastructureDTO';
import type { ProductDTO } from '@/modules/network/common/dto/ProductDTO';
import type { Pageable } from '@/types/pagination';

export const ForecastList: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [forecasts, setForecasts] = useState<FlowForecastDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forecastToDelete, setForecastToDelete] = useState<FlowForecastDTO | null>(null);
  
  // Filters
  const [infrastructures, setInfrastructures] = useState<InfrastructureDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<number | ''>('');
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load data on mount and when filters change
  useEffect(() => {
    loadForecasts();
  }, [page, rowsPerPage, searchTerm, selectedInfrastructure, selectedProduct, startDate, endDate]);

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [infras, prods] = await Promise.all([
        InfrastructureService.getAllNoPagination(),
        ProductService.getAllNoPagination(),
      ]);
      setInfrastructures(infras);
      setProducts(prods);
    } catch (err: any) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadForecasts = async () => {
    try {
      setLoading(true);
      setError(null);

      const pageable: Pageable = {
        page,
        size: rowsPerPage,
        sort: 'forecastDate,desc',
      };

      let result;

      // Apply filters in priority order
      if (startDate && endDate) {
        result = await FlowForecastService.getByDateRange(startDate, endDate, pageable);
      } else if (selectedInfrastructure) {
        result = await FlowForecastService.getByInfrastructure(Number(selectedInfrastructure), pageable);
      } else if (selectedProduct) {
        result = await FlowForecastService.getByProduct(Number(selectedProduct), pageable);
      } else if (searchTerm) {
        result = await FlowForecastService.globalSearch(searchTerm, pageable);
      } else {
        result = await FlowForecastService.getAll(pageable);
      }

      setForecasts(result.content);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      console.error('Error loading forecasts:', err);
      setError(err.message || 'Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadForecasts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedInfrastructure('');
    setSelectedProduct('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleDeleteClick = (forecast: FlowForecastDTO) => {
    setForecastToDelete(forecast);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!forecastToDelete?.id) return;

    try {
      await FlowForecastService.delete(forecastToDelete.id);
      setDeleteDialogOpen(false);
      setForecastToDelete(null);
      loadForecasts();
    } catch (err: any) {
      console.error('Error deleting forecast:', err);
      setError(err.message || 'Failed to delete forecast');
    }
  };

  if (loading && forecasts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Flow Forecasts</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/flow/forecasts/new')}
        >
          New Forecast
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
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
                label="Infrastructure"
                value={selectedInfrastructure}
                onChange={(e) => setSelectedInfrastructure(e.target.value as number | '')}
              >
                <MenuItem value="">All</MenuItem>
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
                label="Product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value as number | '')}
              >
                <MenuItem value="">All</MenuItem>
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
                type="date"
                label="From Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <IconButton onClick={loadForecasts} color="primary">
                  <RefreshIcon />
                </IconButton>
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
                <TableCell>Forecast Date</TableCell>
                <TableCell>Infrastructure</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Predicted Volume</TableCell>
                <TableCell align="right">Adjusted Volume</TableCell>
                <TableCell align="center">Accuracy</TableCell>
                <TableCell>Supervisor</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecasts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No forecasts found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                forecasts.map((forecast) => (
                  <TableRow key={forecast.id} hover>
                    <TableCell>{forecast.forecastDate}</TableCell>
                    <TableCell>{forecast.infrastructure?.code || 'N/A'}</TableCell>
                    <TableCell>{forecast.product?.designationFr || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {forecast.predictedVolume?.toLocaleString()} m³
                    </TableCell>
                    <TableCell align="right">
                      {forecast.adjustedVolume ? `${forecast.adjustedVolume.toLocaleString()} m³` : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {forecast.accuracy !== undefined && forecast.accuracy !== null ? (
                        <Chip
                          label={`${forecast.accuracy.toFixed(1)}%`}
                          size="small"
                          color={forecast.accuracy >= 80 ? 'success' : forecast.accuracy >= 60 ? 'warning' : 'default'}
                        />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {forecast.supervisor ? 
                        `${forecast.supervisor.firstNameLt} ${forecast.supervisor.lastNameLt}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/flow/forecasts/edit/${forecast.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(forecast)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
        <DialogTitle>Delete Forecast</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the forecast for{' '}
            {forecastToDelete?.infrastructure?.code} on {forecastToDelete?.forecastDate}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
