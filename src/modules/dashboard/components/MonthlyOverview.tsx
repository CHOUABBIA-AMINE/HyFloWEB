/**
 * Monthly Overview Component
 * 
 * Displays month-to-date summary
 */

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { DashboardSummary } from '../types/dashboard.types';
import { formatVolume, formatPercentage } from '../utils/formatters';

interface MonthlyOverviewProps {
  data: DashboardSummary;
}

const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({ data }) => {
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const onTargetPercentage = (data.daysOnTargetThisMonth / data.currentDayOfMonth) * 100;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Monthly Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Day of Month
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {data.currentDayOfMonth} / {daysInMonth}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              MTD Transported
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatVolume(data.monthlyTotalTransported)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              MTD Estimated
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatVolume(data.monthlyTotalEstimated)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              MTD Variance
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight="bold"
              color={data.monthlyVariancePercent >= -5 && data.monthlyVariancePercent <= 5 
                ? 'success.main' 
                : 'error.main'
              }
            >
              {formatPercentage(data.monthlyVariancePercent)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Days On Target: <strong>{data.daysOnTargetThisMonth}</strong> out of{' '}
              <strong>{data.currentDayOfMonth}</strong> days{' '}
              ({formatPercentage(onTargetPercentage)})
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MonthlyOverview;
