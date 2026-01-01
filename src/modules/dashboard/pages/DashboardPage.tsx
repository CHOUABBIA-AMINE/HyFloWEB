/**
 * Dashboard Page
 * 
 * Main dashboard page component
 */

import React from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { useDashboardData } from '../hooks/useDashboardData';
import { usePipelineStatuses } from '../hooks/usePipelineStatuses';
import { useTrendData } from '../hooks/useTrendData';
import InfrastructureKPIs from '../components/InfrastructureKPIs';
import TodaysSummary from '../components/TodaysSummary';
import VarianceAnalysis from '../components/VarianceAnalysis';
import PipelineStatusTable from '../components/PipelineStatusTable';
import VolumeComparisonChart from '../components/VolumeComparisonChart';
import PressureTrendChart from '../components/PressureTrendChart';
import MonthlyOverview from '../components/MonthlyOverview';

const DashboardPage: React.FC = () => {
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useDashboardData();
  const { data: pipelineData, loading: pipelineLoading, error: pipelineError } = usePipelineStatuses();
  const { data: trendData, loading: trendLoading, error: trendError } = useTrendData({ days: 7 });

  const loading = summaryLoading || pipelineLoading || trendLoading;
  const error = summaryError || pipelineError || trendError;

  if (loading && !summaryData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!summaryData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">No data available</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Flow Monitoring Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time pipeline flow monitoring and analysis
        </Typography>
      </Box>

      {/* Infrastructure KPIs */}
      <Box sx={{ mb: 3 }}>
        <InfrastructureKPIs data={summaryData} />
      </Box>

      {/* Today's Summary */}
      <Box sx={{ mb: 3 }}>
        <TodaysSummary data={summaryData} />
      </Box>

      {/* Variance Analysis */}
      <Box sx={{ mb: 3 }}>
        <VarianceAnalysis data={summaryData} />
      </Box>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {trendData.length > 0 && <VolumeComparisonChart data={trendData} />}
        </Grid>
        <Grid item xs={12} md={6}>
          {trendData.length > 0 && <PressureTrendChart data={trendData} />}
        </Grid>
      </Grid>

      {/* Monthly Overview */}
      <Box sx={{ mb: 3 }}>
        <MonthlyOverview data={summaryData} />
      </Box>

      {/* Pipeline Status Table */}
      <Box>
        {pipelineData.length > 0 && <PipelineStatusTable data={pipelineData} />}
      </Box>
    </Container>
  );
};

export default DashboardPage;
