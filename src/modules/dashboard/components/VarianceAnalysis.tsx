/**
 * Variance Analysis Component
 * 
 * Displays breakdown of pipeline statuses
 */

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  CheckCircle as OnTargetIcon,
  TrendingDown as BelowIcon,
  TrendingUp as AboveIcon,
  Cancel as OfflineIcon,
} from '@mui/icons-material';
import { DashboardSummary } from '../types/dashboard.types';

interface VarianceAnalysisProps {
  data: DashboardSummary;
}

const VarianceAnalysis: React.FC<VarianceAnalysisProps> = ({ data }) => {
  const statuses = [
    {
      label: 'On Target',
      value: data.pipelinesOnTarget,
      icon: <OnTargetIcon fontSize="large" />,
      color: '#4caf50',
      description: 'Within ±5% variance',
    },
    {
      label: 'Below Target',
      value: data.pipelinesBelowTarget,
      icon: <BelowIcon fontSize="large" />,
      color: '#f44336',
      description: 'Below -5% variance',
    },
    {
      label: 'Above Target',
      value: data.pipelinesAboveTarget,
      icon: <AboveIcon fontSize="large" />,
      color: '#ff9800',
      description: 'Above +5% variance',
    },
    {
      label: 'Offline',
      value: data.pipelinesOffline,
      icon: <OfflineIcon fontSize="large" />,
      color: '#9e9e9e',
      description: 'No data available',
    },
  ];

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Variance Analysis
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {statuses.map((status) => (
          <Grid item xs={12} sm={6} md={3} key={status.label}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: `2px solid ${status.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: `${status.color}10`,
              }}
            >
              <Box sx={{ color: status.color, mb: 1 }}>
                {status.icon}
              </Box>
              <Typography variant="h4" fontWeight="bold" color={status.color}>
                {status.value}
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {status.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {status.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default VarianceAnalysis;
