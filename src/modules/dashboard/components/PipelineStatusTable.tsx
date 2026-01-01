/**
 * Pipeline Status Table Component
 * 
 * Displays all pipeline statuses in a data table
 */

import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Typography,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { PipelineStatus } from '../types/dashboard.types';
import {
  formatVolume,
  formatPressure,
  formatPercentage,
  getVolumeStatusColor,
  getPressureStatusColor,
  getStatusLabel,
} from '../utils/formatters';

interface PipelineStatusTableProps {
  data: PipelineStatus[];
}

type Order = 'asc' | 'desc';
type OrderBy = keyof PipelineStatus;

const PipelineStatusTable: React.FC<PipelineStatusTableProps> = ({ data }) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('pipelineName');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = React.useMemo(() => {
    const comparator = (a: PipelineStatus, b: PipelineStatus) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    };

    const filtered = data.filter((pipeline) =>
      pipeline.pipelineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipeline.pipelineCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort(comparator);
  }, [data, order, orderBy, searchTerm]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Pipeline Status
        </Typography>
        <TextField
          size="small"
          placeholder="Search pipelines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'pipelineCode'}
                  direction={orderBy === 'pipelineCode' ? order : 'asc'}
                  onClick={() => handleRequestSort('pipelineCode')}
                >
                  Code
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'pipelineName'}
                  direction={orderBy === 'pipelineName' ? order : 'asc'}
                  onClick={() => handleRequestSort('pipelineName')}
                >
                  Pipeline
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'dailyVolumeTransported'}
                  direction={orderBy === 'dailyVolumeTransported' ? order : 'asc'}
                  onClick={() => handleRequestSort('dailyVolumeTransported')}
                >
                  Volume
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'averagePressureToday'}
                  direction={orderBy === 'averagePressureToday' ? order : 'asc'}
                  onClick={() => handleRequestSort('averagePressureToday')}
                >
                  Pressure
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'dailyProgress'}
                  direction={orderBy === 'dailyProgress' ? order : 'asc'}
                  onClick={() => handleRequestSort('dailyProgress')}
                >
                  Progress
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Volume Status</TableCell>
              <TableCell align="center">Pressure Status</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'readingsCompletedToday'}
                  direction={orderBy === 'readingsCompletedToday' ? order : 'asc'}
                  onClick={() => handleRequestSort('readingsCompletedToday')}
                >
                  Readings
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((pipeline) => (
              <TableRow key={pipeline.pipelineId} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {pipeline.pipelineCode}
                  </Typography>
                </TableCell>
                <TableCell>{pipeline.pipelineName}</TableCell>
                <TableCell align="right">
                  {formatVolume(pipeline.dailyVolumeTransported)}
                </TableCell>
                <TableCell align="right">
                  {formatPressure(pipeline.averagePressureToday)}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={pipeline.dailyProgress && pipeline.dailyProgress >= 95 ? 'success.main' : 'text.primary'}
                  >
                    {formatPercentage(pipeline.dailyProgress)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusLabel(pipeline.volumeStatus)}
                    size="small"
                    sx={{
                      bgcolor: getVolumeStatusColor(pipeline.volumeStatus),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusLabel(pipeline.pressureStatus)}
                    size="small"
                    sx={{
                      bgcolor: getPressureStatusColor(pipeline.pressureStatus),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  {pipeline.readingsCompletedToday} / {pipeline.readingsExpectedToday}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {sortedData.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No pipelines found
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PipelineStatusTable;
