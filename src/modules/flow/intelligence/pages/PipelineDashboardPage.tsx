/**
 * Pipeline Dashboard Page
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Full-page real-time operational dashboard for pipeline monitoring.
 *              Displays key metrics, health status, and operational statistics.
 *              
 * @route /flow/intelligence/pipeline/:pipelineId/dashboard
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { usePipelineDashboard } from '../hooks';
import { PipelineIntelligenceService } from '../services';
import type { KeyMetricsDTO } from '../dto';

/**
 * Pipeline Dashboard Page Component
 */
export const PipelineDashboardPage: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const navigate = useNavigate();

  const { dashboard, isLoading, error, refresh, isRefetching, hasMetrics } =
    usePipelineDashboard(Number(pipelineId), {
      autoRefresh: true,
      refreshInterval: 30000,
    });

  // Check if error is 403 Forbidden
  const isForbidden = 
    error?.message?.includes('403') || 
    error?.message?.toLowerCase().includes('forbidden') ||
    (error as any)?.response?.status === 403 ||
    (error as any)?.status === 403;

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Loading pipeline dashboard...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // 403 Forbidden - Permission Error
  if (error && isForbidden) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'warning.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <LockIcon sx={{ fontSize: 48, color: 'warning.main' }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Access Denied
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pipeline Dashboard - Permission Required
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Insufficient Permissions</AlertTitle>
            You don't have permission to view this pipeline's operational intelligence dashboard.
          </Alert>

          <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VpnKeyIcon fontSize="small" />
              Required Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              To access this dashboard, you need at least one of the following authorities:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="FLOW_READ" size="small" color="primary" variant="outlined" />
                <Typography variant="body2" color="text.secondary">
                  - View flow data and dashboards
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="FLOW_WRITE" size="small" color="primary" variant="outlined" />
                <Typography variant="body2" color="text.secondary">
                  - Create and edit flow readings
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="FLOW_VALIDATE" size="small" color="primary" variant="outlined" />
                <Typography variant="body2" color="text.secondary">
                  - Validate and approve readings
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'info.lighter' }}>
            <Typography variant="h6" gutterBottom>
              How to get access:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <Typography variant="body2">
                  Contact your system administrator to request access
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Provide Pipeline ID: <strong>{pipelineId}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Specify which permission level you need (READ, WRITE, or VALIDATE)
                </Typography>
              </li>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/network/map/pipelines')}
              fullWidth
            >
              Back to Pipeline Map
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              fullWidth
            >
              Retry
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Other Error states
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Error Loading Dashboard
          </Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/network/map/pipelines')}
          sx={{ mt: 2 }}
        >
          Back to Pipeline Map
        </Button>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">No dashboard data available for this pipeline.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/network/map/pipelines')}
          sx={{ mt: 2 }}
        >
          Back to Pipeline Map
        </Button>
      </Container>
    );
  }

  const metrics: KeyMetricsDTO | undefined = dashboard.keyMetrics;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle />;
      case 'WARNING':
        return <Warning />;
      case 'CRITICAL':
        return <ErrorIcon />;
      default:
        return <TrendingUp />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return 'success';
      case 'LOW':
      case 'HIGH':
        return 'warning';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/network/map/pipelines')}
          sx={{ cursor: 'pointer' }}
        >
          Pipeline Map
        </Link>
        <Typography color="text.primary">Pipeline Dashboard</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {dashboard.pipelineName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pipeline ID: {dashboard.pipelineId} • Real-time Monitoring
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isRefetching && (
            <Chip
              icon={<RefreshIcon />}
              label="Refreshing..."
              color="primary"
              size="small"
            />
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={isRefetching}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Health Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getHealthIcon(dashboard.overallHealth)}
              Health Status
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={dashboard.overallHealth}
                    color={getHealthColor(dashboard.overallHealth)}
                    sx={{ fontSize: '1.2rem', py: 3, px: 2, width: '100%' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Overall Status
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="text.primary">
                    {dashboard.healthScore.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Health Score (0-100)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="error.main">
                    {dashboard.criticalAlertsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Critical Alerts
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main">
                    {dashboard.warningAlertsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Warnings
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Key Metrics - Type-safe access with KeyMetricsDTO */}
      {hasMetrics && metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Current Readings
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Pressure
                  </Typography>
                  <Chip
                    label={dashboard.pressureStatus}
                    color={getMetricStatusColor(dashboard.pressureStatus)}
                    size="small"
                  />
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                  {metrics.pressure !== undefined ? `${metrics.pressure}` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  bar
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Temperature
                  </Typography>
                  <Chip
                    label={dashboard.temperatureStatus}
                    color={getMetricStatusColor(dashboard.temperatureStatus)}
                    size="small"
                  />
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                  {metrics.temperature !== undefined ? `${metrics.temperature}` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  °C
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Flow Rate
                  </Typography>
                  <Chip
                    label={dashboard.flowRateStatus}
                    color={getMetricStatusColor(dashboard.flowRateStatus)}
                    size="small"
                  />
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                  {metrics.flowRate !== undefined ? `${metrics.flowRate}` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  m³/h
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Contained Volume
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                  {metrics.containedVolume !== undefined ? `${metrics.containedVolume}` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  m³
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 24-Hour Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            24-Hour Statistics
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Avg Pressure
              </Typography>
              <Typography variant="h5" component="div">
                {dashboard.avgPressureLast24h !== undefined
                  ? `${dashboard.avgPressureLast24h} bar`
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Avg Temperature
              </Typography>
              <Typography variant="h5" component="div">
                {dashboard.avgTemperatureLast24h !== undefined
                  ? `${dashboard.avgTemperatureLast24h} °C`
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Avg Flow Rate
              </Typography>
              <Typography variant="h5" component="div">
                {dashboard.avgFlowRateLast24h !== undefined
                  ? `${dashboard.avgFlowRateLast24h} m³/h`
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Throughput (24h)
              </Typography>
              <Typography variant="h5" component="div">
                {dashboard.throughputLast24h !== undefined
                  ? `${dashboard.throughputLast24h} m³`
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Quality & Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Quality
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {dashboard.dataCompletenessPercent.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completeness
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {dashboard.validatedReadingsToday}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Validated Today
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {dashboard.pendingReadingsToday}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {dashboard.eventsLast7Days}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Events (7 days)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main">
                    {dashboard.operationsLast7Days}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Operations (7 days)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Info */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Container>
  );
};
