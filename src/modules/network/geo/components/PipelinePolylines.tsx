/**
 * Pipeline Polylines Component
 * Renders pipeline routes on the map as polylines
 * 
 * Updated: 02-14-2026 21:00 - Added curve separation for overlapping pipelines + enhanced tooltips
 * Updated: 01-16-2026 - Fixed to use departureTerminal and arrivalTerminal instead of departureFacility/arrivalFacility
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 02-14-2026
 */

import React, { useMemo, useState } from 'react';
import { Polyline, Popup, Tooltip } from 'react-leaflet';
import { PipelineGeoData, PipelineDisplayOptions } from '../types';
import { getPipelineStyle } from '../utils/pipelineHelpers';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, Divider } from '@mui/material';
import type { LatLngExpression } from 'leaflet';

interface PipelinePolylinesProps {
  pipelines: PipelineGeoData[];
  displayOptions?: Partial<PipelineDisplayOptions>;
  onPipelineClick?: (pipelineId: number) => void;
}

const defaultDisplayOptions: PipelineDisplayOptions = {
  color: '#2196F3',
  weight: 3,
  opacity: 0.8,
  showLabels: true,
  showDirection: true,
  highlightOnHover: true,
};

/**
 * Calculate a curved path between two points using a bezier curve
 * This creates visual separation for overlapping pipelines
 */
const calculateCurvedPath = (
  start: [number, number],
  end: [number, number],
  curveOffset: number,
  segments: number = 50
): LatLngExpression[] => {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;
  
  // Calculate midpoint
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  
  // Calculate perpendicular offset for curve control point
  const dx = endLng - startLng;
  const dy = endLat - startLat;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Perpendicular direction (rotated 90 degrees)
  const perpLat = -dx / distance;
  const perpLng = dy / distance;
  
  // Control point offset perpendicular to the line
  const controlLat = midLat + perpLat * curveOffset;
  const controlLng = midLng + perpLng * curveOffset;
  
  // Generate bezier curve points
  const points: LatLngExpression[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const invT = 1 - t;
    
    // Quadratic bezier formula
    const lat = invT * invT * startLat + 2 * invT * t * controlLat + t * t * endLat;
    const lng = invT * invT * startLng + 2 * invT * t * controlLng + t * t * endLng;
    
    points.push([lat, lng]);
  }
  
  return points;
};

/**
 * Group pipelines by their departure and arrival terminals
 * to identify overlapping routes
 */
const groupPipelinesByRoute = (pipelines: PipelineGeoData[]) => {
  const routeGroups = new Map<string, PipelineGeoData[]>();
  
  pipelines.forEach((pipelineData) => {
    const { pipeline } = pipelineData;
    
    if (pipeline.departureTerminalId && pipeline.arrivalTerminalId) {
      // Create a unique key for this route (sorted to handle both directions)
      const routeKey = [pipeline.departureTerminalId, pipeline.arrivalTerminalId]
        .sort()
        .join('-');
      
      if (!routeGroups.has(routeKey)) {
        routeGroups.set(routeKey, []);
      }
      
      routeGroups.get(routeKey)!.push(pipelineData);
    }
  });
  
  return routeGroups;
};

export const PipelinePolylines: React.FC<PipelinePolylinesProps> = ({
  pipelines,
  displayOptions = {},
  onPipelineClick,
}) => {
  const navigate = useNavigate();
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);
  
  const options = { ...defaultDisplayOptions, ...displayOptions };
  
  const pipelineElements = useMemo(() => {
    // Group pipelines by route to detect overlaps
    const routeGroups = groupPipelinesByRoute(pipelines);
    
    return pipelines.map((pipelineData) => {
      const { pipeline, coordinates } = pipelineData;
      
      if (!coordinates || coordinates.length < 2) {
        return null;
      }
      
      // Skip if pipeline doesn't have an ID
      if (!pipeline.id) {
        return null;
      }
      
      // Get dynamic style based on pipeline properties
      const pipelineStyle = getPipelineStyle(pipeline);
      const isHovered = hoveredPipeline === pipeline.id;
      
      // Apply hover effect
      const effectiveStyle = {
        ...pipelineStyle,
        weight: isHovered ? pipelineStyle.weight + 2 : pipelineStyle.weight,
        opacity: isHovered ? 1 : pipelineStyle.opacity,
      };
      
      // Calculate curve offset for overlapping pipelines
      let displayCoordinates: LatLngExpression[] = coordinates;
      
      if (pipeline.departureTerminalId && pipeline.arrivalTerminalId) {
        const routeKey = [pipeline.departureTerminalId, pipeline.arrivalTerminalId]
          .sort()
          .join('-');
        
        const groupPipelines = routeGroups.get(routeKey) || [];
        
        // Only apply curve if there are multiple pipelines on this route
        if (groupPipelines.length > 1) {
          const pipelineIndex = groupPipelines.findIndex(
            (p) => p.pipeline.id === pipeline.id
          );
          
          // Apply different curve offsets for each pipeline
          // Base offset increases with index: 0.0001, 0.0002, 0.0003, etc.
          const baseOffset = 0.0001;
          const curveOffset = baseOffset * (pipelineIndex - (groupPipelines.length - 1) / 2);
          
          // Only apply curve if we have exactly 2 coordinate points (start and end)
          // For multi-segment pipelines, keep original path
          if (coordinates.length === 2) {
            displayCoordinates = calculateCurvedPath(
              coordinates[0] as [number, number],
              coordinates[1] as [number, number],
              curveOffset
            );
          }
        }
      }
      
      const handleClick = () => {
        if (onPipelineClick && pipeline.id !== undefined) {
          onPipelineClick(pipeline.id);
        } else if (pipeline.id !== undefined) {
          navigate(`/network/core/pipelines/${pipeline.id}`);
        }
      };
      
      return (
        <Polyline
          key={`pipeline-${pipeline.id}`}
          positions={displayCoordinates}
          pathOptions={effectiveStyle}
          eventHandlers={{
            mouseover: () => {
              if (options.highlightOnHover && pipeline.id !== undefined) {
                setHoveredPipeline(pipeline.id);
              }
            },
            mouseout: () => {
              if (options.highlightOnHover) {
                setHoveredPipeline(null);
              }
            },
            click: handleClick,
          }}
        >
          {/* Enhanced Tooltip for quick info on hover */}
          {options.showLabels && (
            <Tooltip 
              direction="top" 
              offset={[0, -10]} 
              opacity={0.95}
              permanent={false}
              sticky
            >
              <Box 
                sx={{ 
                  p: 1, 
                  minWidth: 120,
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {pipeline.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipeline.name}
                </Typography>
                {pipeline.departureTerminal && pipeline.arrivalTerminal && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                    {pipeline.departureTerminal.code} → {pipeline.arrivalTerminal.code}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          )}
          
          {/* Detailed popup on click */}
          <Popup maxWidth={300}>
            <Box sx={{ p: 1 }}>
              <Typography variant="h6" gutterBottom>
                {pipeline.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Code: {pipeline.code}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              {pipeline.operationalStatus && (
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={pipeline.operationalStatus.code}
                    size="small"
                    color={getStatusColor(pipeline.operationalStatus.code)}
                  />
                </Box>
              )}
              
              <Box sx={{ display: 'grid', gap: 0.5 }}>
                {pipeline.nominalDiameter && (
                  <Typography variant="body2">
                    <strong>Diameter:</strong> {pipeline.nominalDiameter}"
                  </Typography>
                )}
                
                {pipeline.length && (
                  <Typography variant="body2">
                    <strong>Length:</strong> {pipeline.length.toFixed(2)} km
                  </Typography>
                )}
                
                {pipeline.designCapacity && (
                  <Typography variant="body2">
                    <strong>Capacity:</strong> {pipeline.designCapacity.toLocaleString()} m³/day
                  </Typography>
                )}
                
                {pipeline.pipelineSystem && (
                  <Typography variant="body2">
                    <strong>System:</strong> {pipeline.pipelineSystem.name}
                  </Typography>
                )}
                
                {pipeline.departureTerminal && (
                  <Typography variant="body2">
                    <strong>From:</strong> {pipeline.departureTerminal.name}
                  </Typography>
                )}
                
                {pipeline.arrivalTerminal && (
                  <Typography variant="body2">
                    <strong>To:</strong> {pipeline.arrivalTerminal.name}
                  </Typography>
                )}
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleClick}
              >
                View Details
              </Button>
            </Box>
          </Popup>
        </Polyline>
      );
    }).filter(element => element !== null);
  }, [pipelines, hoveredPipeline, options, onPipelineClick, navigate]);
  
  return <>{pipelineElements}</>;
};

// Helper function to get color based on status
const getStatusColor = (statusCode?: string): 'success' | 'warning' | 'error' | 'default' => {
  if (!statusCode) return 'default';
  
  const code = statusCode.toLowerCase();
  
  if (code.includes('operational') || code.includes('active')) {
    return 'success';
  } else if (code.includes('maintenance')) {
    return 'warning';
  } else if (code.includes('inactive') || code.includes('decommissioned')) {
    return 'error';
  }
  
  return 'default';
};
