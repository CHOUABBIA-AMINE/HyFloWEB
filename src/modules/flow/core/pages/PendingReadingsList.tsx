/**
 * PendingReadingsList Page
 * 
 * Displays only readings with PENDING validation status.
 * Optimized for validators to quickly review and validate readings.
 * 
 * @author CHOUABBIA Amine
 * @created 01-27-2026
 * @updated 01-27-2026 - Fixed: Filter by status code instead of hardcoded ID
 * @updated 01-27-2026 - Fixed: Add null check for readings array
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { FlowReadingService } from '../services/FlowReadingService';
import { formatDateTime, formatPressure, formatTemperature, formatFlowRate } from '../utils/formattingUtils';

import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { Page } from '@/types/pagination';

export const PendingReadingsList: React.FC = () => {
  const navigate = useNavigate();
  
  // State - Initialize readings as empty array
  const [allReadings, setAllReadings] = useState<FlowReadingDTO[]>([]);
  const [readings, setReadings] = useState<FlowReadingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load readings when component mounts
  useEffect(() => {
    loadPendingReadings();
  }, []);

  // Apply pagination when page or allReadings change
  useEffect(() => {
    applyPagination();
  }, [page, rowsPerPage, allReadings]);

  const loadPendingReadings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all readings (we'll filter client-side for pending status)
      // This is needed because we don't know the exact status ID
      const allData: FlowReadingDTO[] = await FlowReadingService.getAllNoPagination();

      // Filter for pending readings
      // Status code might be 'PENDING' or 'PENDING_VALIDATION'
      const pendingReadings = allData.filter(reading => {
        const code = reading.validationStatus?.code;
        return code === 'PENDING' || code === 'PENDING_VALIDATION';
      });

      // Sort by recorded date (newest first)
      pendingReadings.sort((a, b) => {
        return new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
      });

      setAllReadings(pendingReadings);
      setTotalElements(pendingReadings.length);
    } catch (error: any) {
      console.error('Error loading pending readings:', error);
      setError(error.message || 'Failed to load pending readings');
      setAllReadings([]);
      setReadings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyPagination = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setReadings(allReadings.slice(startIndex, endIndex));
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleValidate = (reading: FlowReadingDTO) => {
    navigate(`/flow/readings/${reading.id}/validate`);
  };

  const handleView = (reading: FlowReadingDTO) => {
    navigate(`/flow/readings/${reading.id}/validate`);
  };

  const handleBackToList = () => {
    navigate('/flow/readings');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBackToList}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">Pending Readings for Validation</Typography>
            <Typography variant="body2" color="text.secondary">
              Review and validate readings submitted by operators
            </Typography>
          </Box>
        </Box>
        <Badge badgeContent={totalElements} color="warning" max={99}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPendingReadings}
            disabled={loading}
          >
            Refresh
          </Button>
        </Badge>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Info Alert */}
      {!loading && totalElements === 0 && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">No Pending Readings</Typography>
          <Typography>All readings have been validated. Great work!</Typography>
        </Alert>
      )}

      {/* Warning for high count */}
      {!loading && totalElements > 10 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          <Typography variant="subtitle2">High Volume of Pending Readings</Typography>
          <Typography variant="body2">
            There are {totalElements} readings awaiting validation. Consider prioritizing critical pipelines.
          </Typography>
        </Alert>
      )}

      {/* Readings Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Priority</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Pipeline</TableCell>
                <TableCell>Recorded At</TableCell>
                <TableCell>Pressure</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Flow Rate</TableCell>
                <TableCell>Recorded By</TableCell>
                <TableCell>Time Pending</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading pending readings...</Typography>
                  </TableCell>
                </TableRow>
              ) : readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {error ? 'Unable to load readings' : 'No pending readings found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => {
                  // Calculate time pending
                  const recordedDate = new Date(reading.recordedAt);
                  const now = new Date();
                  const hoursPending = Math.floor((now.getTime() - recordedDate.getTime()) / (1000 * 60 * 60));
                  
                  // Priority based on time pending
                  const priority = hoursPending > 24 ? 'high' : hoursPending > 8 ? 'medium' : 'normal';
                  const priorityColor = priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'default';
                  
                  return (
                    <TableRow 
                      key={reading.id} 
                      hover
                      sx={{
                        backgroundColor: priority === 'high' ? 'error.lighter' : priority === 'medium' ? 'warning.lighter' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={priority.toUpperCase()} 
                          size="small" 
                          color={priorityColor}
                        />
                      </TableCell>
                      <TableCell>#{reading.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {reading.pipeline?.code || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reading.pipeline?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDateTime(reading.recordedAt)}</TableCell>
                      <TableCell>{formatPressure(reading.pressure)}</TableCell>
                      <TableCell>{formatTemperature(reading.temperature)}</TableCell>
                      <TableCell>{formatFlowRate(reading.flowRate)}</TableCell>
                      <TableCell>
                        {reading.recordedBy 
                          ? `${reading.recordedBy.firstNameLt} ${reading.recordedBy.lastNameLt}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={priority === 'high' ? 'error' : priority === 'medium' ? 'warning.main' : 'text.secondary'}
                        >
                          {hoursPending < 1 ? '< 1 hour' : 
                           hoursPending < 24 ? `${hoursPending} hours` :
                           `${Math.floor(hoursPending / 24)} days`}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleView(reading)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Validate Now">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleValidate(reading)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};