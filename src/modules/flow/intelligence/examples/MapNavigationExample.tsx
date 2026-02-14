/**
 * Map Navigation Example
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * 
 * @description Demonstrates how to navigate from pipeline map to dashboard.
 *              Shows various integration patterns with Leaflet/map libraries.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

/**
 * Example 1: Simple Click Handler
 * Use when clicking on a pipeline feature
 */
export function SimplePipelineClick() {
  const navigate = useNavigate();

  const handlePipelineClick = (pipelineId: number) => {
    // Navigate to dashboard
    navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`);
  };

  return (
    <div>
      {/* Example: In your map event handler */}
      <button onClick={() => handlePipelineClick(1)}>
        Pipeline GT-2023-A
      </button>
    </div>
  );
}

/**
 * Example 2: Popup with Dashboard Button
 * Use in Leaflet popup or tooltip
 */
interface PipelinePopupProps {
  pipelineId: number;
  pipelineName: string;
  status: string;
}

export function PipelinePopup({ pipelineId, pipelineName, status }: PipelinePopupProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2, minWidth: 250 }}>
      <Typography variant="h6" gutterBottom>
        {pipelineName}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Status: {status}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<DashboardIcon />}
          onClick={() => navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`)}
          fullWidth
        >
          View Dashboard
        </Button>
      </Box>
    </Box>
  );
}

/**
 * Example 3: Icon Button for Compact Display
 * Use in map overlay or small popup
 */
interface PipelineQuickActionsProps {
  pipelineId: number;
}

export function PipelineQuickActions({ pipelineId }: PipelineQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="View Dashboard">
        <IconButton
          size="small"
          color="primary"
          onClick={() => navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`)}
        >
          <DashboardIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="View Analytics">
        <IconButton
          size="small"
          color="secondary"
          onClick={() => navigate(`/flow/monitoring`)}
        >
          <TimelineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Pipeline Info">
        <IconButton
          size="small"
          onClick={() => navigate(`/network/core/pipelines/${pipelineId}/edit`)}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/**
 * Example 4: Context Menu Integration
 * Use for right-click context menu on map features
 */
interface PipelineContextMenuProps {
  pipelineId: number;
  pipelineName: string;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export function PipelineContextMenu({
  pipelineId,
  pipelineName,
  anchorEl,
  open,
  onClose,
}: PipelineContextMenuProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem disabled>
        <Typography variant="caption" color="text.secondary">
          {pipelineName}
        </Typography>
      </MenuItem>
      
      <MenuItem onClick={() => handleNavigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`)}>
        <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
        View Dashboard
      </MenuItem>
      
      <MenuItem onClick={() => handleNavigate(`/flow/monitoring`)}>
        <TimelineIcon fontSize="small" sx={{ mr: 1 }} />
        View Analytics
      </MenuItem>
      
      <MenuItem onClick={() => handleNavigate(`/network/core/pipelines/${pipelineId}/edit`)}>
        <InfoIcon fontSize="small" sx={{ mr: 1 }} />
        Pipeline Details
      </MenuItem>
    </Menu>
  );
}

/**
 * Example 5: Complete Map Feature Component
 * Full example with state management
 */
interface PipelineFeatureCardProps {
  pipelineId: number;
  pipelineName: string;
  status: string;
  pressure?: number;
  temperature?: number;
}

export function PipelineFeatureCard({
  pipelineId,
  pipelineName,
  status,
  pressure,
  temperature,
}: PipelineFeatureCardProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        minWidth: 300,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{pipelineName}</Typography>
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Status */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Status
          </Typography>
          <Typography variant="body2">{status}</Typography>
        </Box>
        {pressure && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Pressure
            </Typography>
            <Typography variant="body2">{pressure} bar</Typography>
          </Box>
        )}
        {temperature && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Temperature
            </Typography>
            <Typography variant="body2">{temperature} °C</Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Button
        variant="contained"
        startIcon={<DashboardIcon />}
        onClick={() => navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`)}
        fullWidth
      >
        Open Dashboard
      </Button>

      {/* Context Menu */}
      <PipelineContextMenu
        pipelineId={pipelineId}
        pipelineName={pipelineName}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      />
    </Box>
  );
}

/**
 * Example 6: Leaflet Integration
 * Use with react-leaflet library
 */
export function LeafletPipelineIntegrationExample() {
  const navigate = useNavigate();

  // Example: Leaflet event handler
  const onPipelineClick = (event: any) => {
    const pipelineId = event.target.feature.properties.id;
    navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`);
  };

  /* Example JSX for react-leaflet:
  
  <GeoJSON
    data={pipelineGeoJson}
    onEachFeature={(feature, layer) => {
      layer.on('click', onPipelineClick);
      
      layer.bindPopup(
        ReactDOMServer.renderToString(
          <PipelinePopup
            pipelineId={feature.properties.id}
            pipelineName={feature.properties.name}
            status={feature.properties.status}
          />
        )
      );
    }}
  />
  */

  return null;
}

/**
 * Example 7: Custom Hook for Navigation
 * Reusable hook for pipeline navigation
 */
export function usePipelineNavigation() {
  const navigate = useNavigate();

  const navigateToDashboard = (pipelineId: number) => {
    navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`);
  };

  const navigateToAnalytics = () => {
    navigate('/flow/monitoring');
  };

  const navigateToPipelineEdit = (pipelineId: number) => {
    navigate(`/network/core/pipelines/${pipelineId}/edit`);
  };

  return {
    navigateToDashboard,
    navigateToAnalytics,
    navigateToPipelineEdit,
  };
}

/**
 * Example 8: Using the Custom Hook
 */
export function MapComponentWithHook() {
  const { navigateToDashboard } = usePipelineNavigation();

  return (
    <div>
      <button onClick={() => navigateToDashboard(1)}>
        View Pipeline 1 Dashboard
      </button>
    </div>
  );
}

/**
 * USAGE IN YOUR MAP COMPONENT:
 * 
 * import { usePipelineNavigation } from '@/modules/flow/intelligence/examples/MapNavigationExample';
 * 
 * function PipelineMap() {
 *   const { navigateToDashboard } = usePipelineNavigation();
 *   
 *   const handlePipelineClick = (pipelineId: number) => {
 *     navigateToDashboard(pipelineId);
 *   };
 *   
 *   return (
 *     <Map>
 *       {pipelines.map(pipeline => (
 *         <Feature
 *           key={pipeline.id}
 *           onClick={() => handlePipelineClick(pipeline.id)}
 *         />
 *       ))}
 *     </Map>
 *   );
 * }
 */
