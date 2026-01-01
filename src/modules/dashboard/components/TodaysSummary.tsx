/**
 * Today's Summary Component
 * 
 * Displays today's key metrics
 */

import React from 'react';
import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { DashboardSummary } from '../types/dashboard.types';
import { formatVolume, formatPressure, formatPercentage } from '../utils/formatters';

interface TodaysSummaryProps {
  data: DashboardSummary;
}

const TodaysSummary: React.FC<TodaysSummaryProps> = ({ data }) => {
  const varianceColor = data.variancePercentToday >= -5 && data.variancePercentToday <= 5
    ? 'success'
    : data.variancePercentToday < -5
    ? 'error'
    : 'warning';

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Today's Summary
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Volume
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatVolume(data.totalVolumeToday)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Average Pressure
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatPressure(data.averagePressureToday)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Pipelines
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {data.activePipelines} / {data.totalPipelines}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Readings Completed
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {data.totalReadingsToday} / {data.expectedReadingsToday}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Transported: {formatVolume(data.totalTransportedToday)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Estimated: {formatVolume(data.totalEstimatedToday)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Variance: <Chip 
                    label={formatPercentage(data.variancePercentToday)} 
                    size="small" 
                    color={varianceColor}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              Last Reading: <strong>{data.lastReadingTime}</strong>
            </Typography>
            <Typography variant="body2">
              Next Reading: <strong>{data.nextReadingTime}</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TodaysSummary;
