/**
 * Infrastructure KPIs Component
 * 
 * Displays top-level infrastructure counts
 */

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  AccountBalance as StationIcon,
  LocationCity as TerminalIcon,
  Landscape as FieldIcon,
  Timeline as PipelineIcon,
} from '@mui/icons-material';
import { DashboardSummary } from '../types/dashboard.types';

interface InfrastructureKPIsProps {
  data: DashboardSummary;
}

const InfrastructureKPIs: React.FC<InfrastructureKPIsProps> = ({ data }) => {
  const kpis = [
    {
      label: 'Stations',
      value: data.totalStations,
      icon: <StationIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      label: 'Terminals',
      value: data.totalTerminals,
      icon: <TerminalIcon fontSize="large" />,
      color: '#2e7d32',
    },
    {
      label: 'Fields',
      value: data.totalFields,
      icon: <FieldIcon fontSize="large" />,
      color: '#ed6c02',
    },
    {
      label: 'Pipelines',
      value: data.totalPipelines,
      icon: <PipelineIcon fontSize="large" />,
      color: '#9c27b0',
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi) => (
        <Grid item xs={12} sm={6} md={3} key={kpi.label}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderLeft: `4px solid ${kpi.color}`,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${kpi.color}20`,
                color: kpi.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {kpi.icon}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {kpi.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kpi.label}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default InfrastructureKPIs;
