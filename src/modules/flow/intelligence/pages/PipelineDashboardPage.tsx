/**
 * Pipeline Intelligence Dashboard Page
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Comprehensive operational intelligence dashboard.
 *              Combines infrastructure details, real-time metrics,
 *              connected assets, and activity timeline.
 *              
 * @route /flow/intelligence/pipeline/:pipelineId/dashboard
 */

import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
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
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  ShowChart as ShowChartIcon,
  Info as InfoIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import axiosInstance from '@/shared/config/axios';
import { usePipelineDashboard } from '../hooks';
import type { KeyMetricsDTO } from '../dto';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Pipeline Intelligence Dashboard Page
 */
export const PipelineDashboardPage: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [pipelineInfo, setPipelineInfo] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const { dashboard, isLoading, error, refresh, isRefetching, hasMetrics } =
    usePipelineDashboard(Number(pipelineId), {
      autoRefresh: true,
      refreshInterval: 30000,
    });

  // Fetch pipeline info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setInfoLoading(true);
        setInfoError(null);
        const response = await axiosInstance.get(
          `/flow/intelligence/pipeline/${pipelineId}/info?includeHealth=false&includeEntities=false`
        );
        setPipelineInfo(response.data);
      } catch (err: any) {
        console.error('Failed to fetch pipeline info:', err);
        const is403 = err?.response?.status === 403 || err?.message?.includes('403');
        setInfoError(is403 ? 'permission' : 'error');
      } finally {
        setInfoLoading(false);
      }
    };

    if (pipelineId) {
      fetchInfo();
    }
  }, [pipelineId]);

  // Fetch timeline
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await axiosInstance.get(
          `/flow/intelligence/pipeline/${pipelineId}/timeline?page=0&size=10`
        );
        setTimeline(response.data);
      } catch (err) {
        console.error('Failed to fetch timeline:', err);
      }
    };

    if (pipelineId) {
      fetchTimeline();
    }
  }, [pipelineId]);

  // Check if error is 403
  const isForbidden = 
    error?.message?.includes('403') || 
    error?.message?.toLowerCase().includes('forbidden') ||
    (error as any)?.response?.status === 403 ||
    (error as any)?.status === 403;

  if (isLoading && !dashboard) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Loading dashboard...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // 403 Permission Error
  if (error && isForbidden) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, border: '2px solid', borderColor: 'warning.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <LockIcon sx={{ fontSize: 48, color: 'warning.main' }} />
            <Box>
              <Typography variant="h4" gutterBottom>Access Denied</Typography>
              <Typography variant="body1" color="text.secondary">Permission Required</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Insufficient Permissions</AlertTitle>
            You need FLOW_READ, FLOW_WRITE, or FLOW_VALIDATE authority.
          </Alert>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VpnKeyIcon fontSize="small" />
              Required Permissions
            </Typography>
            <Stack direction="column" spacing={1} sx={{ ml: 2 }}>
              <Chip label="FLOW_READ" size="small" color="primary" variant="outlined" />
              <Chip label="FLOW_WRITE" size="small" color="primary" variant="outlined" />
              <Chip label="FLOW_VALIDATE" size="small" color="primary" variant="outlined" />
            </Stack>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/network/map/pipelines')} fullWidth>
              Back to Map
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()} fullWidth>
              Retry
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={refresh}>Retry</Button>}>
          <Typography variant="h6" gutterBottom>Error Loading Dashboard</Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/network/map/pipelines')} sx={{ mt: 2 }}>
          Back to Map
        </Button>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">No dashboard data available.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/network/map/pipelines')} sx={{ mt: 2 }}>
          Back to Map
        </Button>
      </Container>
    );
  }

  const metrics: KeyMetricsDTO | undefined = dashboard.keyMetrics;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'success';
      case 'WARNING': return 'warning';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'success';
      case 'LOW':
      case 'HIGH': return 'warning';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" variant="body1" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>Home</Link>
        <Link component="button" variant="body1" onClick={() => navigate('/network/map/pipelines')} sx={{ cursor: 'pointer' }}>Pipelines</Link>
        <Typography color="text.primary">{dashboard.pipelineName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1">{dashboard.pipelineName}</Typography>
              <Chip 
                icon={dashboard.overallHealth === 'HEALTHY' ? <CheckCircle /> : dashboard.overallHealth === 'WARNING' ? <Warning /> : <ErrorIcon />}
                label={dashboard.overallHealth}
                color={getHealthColor(dashboard.overallHealth)}
                size="medium"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Pipeline ID: {dashboard.pipelineId}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isRefetching && <CircleIcon sx={{ fontSize: 12, color: 'primary.main', animation: 'pulse 1.5s ease-in-out infinite' }} />}
            <IconButton onClick={refresh} disabled={isRefetching} color="primary" size="large">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Metrics */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
              <Typography variant="h4" color="primary.main">{metrics?.pressure?.toFixed(1) || '--'}</Typography>
              <Typography variant="caption">bar - Pressure</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
              <Typography variant="h4" color="error.main">{metrics?.temperature?.toFixed(0) || '--'}</Typography>
              <Typography variant="caption">°C - Temperature</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="h4" color="info.main">{metrics?.flowRate?.toFixed(0) || '--'}</Typography>
              <Typography variant="caption">m³/h - Flow</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
              <Typography variant="h4" color="success.main">{dashboard.healthScore.toFixed(0)}</Typography>
              <Typography variant="caption">% - Health</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} aria-label="dashboard tabs">
          <Tab icon={<ShowChartIcon />} label="Overview" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Analytics" iconPosition="start" disabled />
          <Tab icon={<NotificationsIcon />} label="Timeline" iconPosition="start" />
          <Tab icon={<Warning />} label="Alerts" iconPosition="start" disabled />
        </Tabs>
      </Paper>

      {/* Tab: Overview */}
      <TabPanel value={tabValue} index={0}>
        {/* Infrastructure Details */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon /> Infrastructure Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {infoLoading ? (
              <LinearProgress />
            ) : infoError === 'permission' ? (
              <Alert severity="warning" icon={<LockIcon />}>
                <AlertTitle>Access Restricted</AlertTitle>
                Infrastructure details require the same permissions as dashboard access.
                Your account has dashboard access but infrastructure data may be restricted.
              </Alert>
            ) : infoError ? (
              <Alert severity="error">
                <AlertTitle>Failed to Load Infrastructure Details</AlertTitle>
                Unable to retrieve pipeline infrastructure information. Please try refreshing the page.
              </Alert>
            ) : pipelineInfo ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Length</Typography>
                  <Typography variant="body1" fontWeight="bold">{pipelineInfo.length ? `${pipelineInfo.length} km` : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Diameter</Typography>
                  <Typography variant="body1" fontWeight="bold">{pipelineInfo.nominalDiameter || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Material</Typography>
                  <Typography variant="body1" fontWeight="bold">{pipelineInfo.materialName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Operator</Typography>
                  <Typography variant="body1" fontWeight="bold">{pipelineInfo.managerName || pipelineInfo.ownerName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Commissioned</Typography>
                  <Typography variant="body1" fontWeight="bold">{pipelineInfo.commissionDate ? new Date(pipelineInfo.commissionDate).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No infrastructure data available</Alert>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Real-Time Operations */}
        <Accordion defaultExpanded sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon /> Real-Time Operations
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {hasMetrics && metrics && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">Pressure</Typography>
                          <Chip label={dashboard.pressureStatus} size="small" color={getMetricStatusColor(dashboard.pressureStatus)} />
                        </Box>
                        <Typography variant="h3">{metrics.pressure !== undefined ? metrics.pressure.toFixed(2) : 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">bar</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">Temperature</Typography>
                          <Chip label={dashboard.temperatureStatus} size="small" color={getMetricStatusColor(dashboard.temperatureStatus)} />
                        </Box>
                        <Typography variant="h3">{metrics.temperature !== undefined ? metrics.temperature.toFixed(1) : 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">°C</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">Flow Rate</Typography>
                          <Chip label={dashboard.flowRateStatus} size="small" color={getMetricStatusColor(dashboard.flowRateStatus)} />
                        </Box>
                        <Typography variant="h3">{metrics.flowRate !== undefined ? metrics.flowRate.toFixed(0) : 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">m³/h</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Volume</Typography>
                        <Typography variant="h3">{metrics.containedVolume !== undefined ? metrics.containedVolume.toFixed(0) : 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">m³</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>

            {/* 24h Statistics */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>24-Hour Statistics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Avg Pressure</Typography>
                  <Typography variant="h5">{dashboard.avgPressureLast24h ? `${dashboard.avgPressureLast24h.toFixed(1)} bar` : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Avg Temperature</Typography>
                  <Typography variant="h5">{dashboard.avgTemperatureLast24h ? `${dashboard.avgTemperatureLast24h.toFixed(1)} °C` : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Avg Flow</Typography>
                  <Typography variant="h5">{dashboard.avgFlowRateLast24h ? `${dashboard.avgFlowRateLast24h.toFixed(0)} m³/h` : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Throughput</Typography>
                  <Typography variant="h5">{dashboard.throughputLast24h ? `${dashboard.throughputLast24h.toFixed(0)} m³` : 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Data Quality */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Data Quality & Monitoring</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">Completeness</Typography>
                <Typography variant="h4" color="primary">{dashboard.dataCompletenessPercent.toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">Validated Today</Typography>
                <Typography variant="h4" color="success.main">{dashboard.validatedReadingsToday}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">Pending</Typography>
                <Typography variant="h4" color="warning.main">{dashboard.pendingReadingsToday}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">Sensors Online</Typography>
                <Typography variant="h4">{dashboard.onlineSensors}/{dashboard.totalSensors}</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      {/* Tab: Timeline */}
      <TabPanel value={tabValue} index={2}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon /> Recent Activity
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {timeline && timeline.items && timeline.items.length > 0 ? (
            <List>
              {timeline.items.map((item: any, index: number) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemIcon>
                    {item.severity === 'CRITICAL' ? <ErrorIcon color="error" /> :
                     item.severity === 'WARNING' ? <Warning color="warning" /> :
                     <InfoIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">{item.title || item.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                        </Typography>
                      </Box>
                    }
                    secondary={item.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">No recent activity</Typography>
              <Typography variant="caption" color="text.secondary">Events and alerts will appear here</Typography>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* Footer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Container>
  );
};
