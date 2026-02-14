/**
 * Pipeline Map View Component
 * Main map component for displaying pipelines
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 02-14-2026 21:17 - Fixed filterState.filters.showLabels access
 * @updated 02-14-2026 21:10 - Added curve separation and enhanced tooltips
 * @updated 02-14-2026 - Updated click navigation to intelligence dashboard
 * @updated 01-08-2026 - Fixed coordinate type handling
 */

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { Box, Typography, Chip, Divider, Button } from '@mui/material';
import { PipelineGeoData } from '../types';
import { usePipelineFilters } from '../hooks/usePipelineFilters';
import { PipelineFilterPanel } from './PipelineFilterPanel';
import { getPipelineStyle } from '../utils/pipelineHelpers';
import { useNavigate } from 'react-router-dom';
import { LatLngTuple, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PipelineMapViewProps {
  pipelines?: PipelineGeoData[];
  onPipelineClick?: (pipelineId: number) => void;
}

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
  
  if (distance === 0) return [start, end];
  
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

// Map bounds updater component
const MapBoundsUpdater: React.FC<{ pipelines: PipelineGeoData[] }> = ({ pipelines }) => {
  const map = useMap();

  React.useEffect(() => {
    if (pipelines.length > 0) {
      const allCoordinates = pipelines.flatMap(p => p.coordinates);
      if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [pipelines, map]);

  return null;
};

export const PipelineMapView: React.FC<PipelineMapViewProps> = ({
  pipelines = [],
  onPipelineClick,
}) => {
  const navigate = useNavigate();
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);

  const {
    state: filterState,
    filteredPipelines,
    toggleProduct,
    toggleStatus,
    setSearchCode,
    toggleLabels,
    toggleDirection,
    resetFilters,
    toggleAllProducts,
    toggleAllStatuses,
  } = usePipelineFilters(pipelines);

  // Group pipelines by route to detect overlaps
  const routeGroups = useMemo(() => {
    return groupPipelinesByRoute(filteredPipelines);
  }, [filteredPipelines]);

  // Calculate center from all pipelines
  const center = useMemo(() => {
    if (pipelines.length === 0) return [36.7538, 3.0588] as [number, number]; // Default: Algiers

    const allCoordinates = pipelines.flatMap(p => p.coordinates);
    if (allCoordinates.length === 0) return [36.7538, 3.0588] as [number, number];

    // Convert to tuples for calculation
    const tuples = allCoordinates.map(coord => {
      if (Array.isArray(coord)) {
        return coord as LatLngTuple;
      }
      if (typeof coord === 'object' && 'lat' in coord && 'lng' in coord) {
        return [coord.lat, coord.lng] as LatLngTuple;
      }
      return [0, 0] as LatLngTuple;
    });

    const avgLat = tuples.reduce((sum, coord) => sum + coord[0], 0) / tuples.length;
    const avgLng = tuples.reduce((sum, coord) => sum + coord[1], 0) / tuples.length;

    return [avgLat, avgLng] as [number, number];
  }, [pipelines]);

  // Group pipelines by product for legend
  const pipelinesByProduct = useMemo(() => {
    const groups = new Map<string, number>();
    filteredPipelines.forEach(p => {
      const productCode = p.pipeline.pipelineSystem?.product?.code || 'Unknown';
      groups.set(productCode, (groups.get(productCode) || 0) + 1);
    });
    return Array.from(groups.entries());
  }, [filteredPipelines]);

  const handlePipelineClick = (pipelineId: number) => {
    if (onPipelineClick) {
      onPipelineClick(pipelineId);
    } else {
      // Navigate to real-time intelligence dashboard instead of edit page
      navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update map bounds when filtered pipelines change */}
        <MapBoundsUpdater pipelines={filteredPipelines} />

        {/* Render filtered pipelines with curve separation */}
        {filteredPipelines.map((pipelineData) => {
          const { pipeline, coordinates } = pipelineData;

          if (!coordinates || coordinates.length < 2 || !pipeline.id) {
            return null;
          }

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
              // INCREASED base offset from 0.0001 to 0.05 for better visibility
              const baseOffset = 0.05;
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

          const pipelineStyle = getPipelineStyle(pipeline);
          const isHovered = hoveredPipeline === pipeline.id;

          const effectiveStyle = {
            ...pipelineStyle,
            weight: isHovered ? pipelineStyle.weight + 2 : pipelineStyle.weight,
            opacity: isHovered ? 1 : pipelineStyle.opacity,
          };

          // Get product safely
          const product = pipeline.pipelineSystem?.product;

          return (
            <Polyline
              key={`pipeline-${pipeline.id}`}
              positions={displayCoordinates}
              pathOptions={effectiveStyle}
              eventHandlers={{
                mouseover: () => {
                  if (pipeline.id !== undefined) {
                    setHoveredPipeline(pipeline.id);
                  }
                },
                mouseout: () => setHoveredPipeline(null),
                click: () => {
                  if (pipeline.id !== undefined) {
                    handlePipelineClick(pipeline.id);
                  }
                },
              }}
            >
              {/* Enhanced Tooltip for quick info on hover - FIXED: filterState.filters.showLabels */}
              {filterState.filters.showLabels && (
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

              {/* Detailed Popup on click */}
              <Popup maxWidth={300}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {pipeline.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Code: {pipeline.code}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    {product && (
                      <Typography variant="body2">
                        <strong>Product:</strong> {product.code}
                      </Typography>
                    )}

                    {pipeline.operationalStatus && (
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={pipeline.operationalStatus.code}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    )}

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
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      if (pipeline.id !== undefined) {
                        handlePipelineClick(pipeline.id);
                      }
                    }}
                  >
                    View Dashboard
                  </Button>
                </Box>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>

      {/* Filter Panel */}
      <PipelineFilterPanel
        filterState={filterState}
        onToggleProduct={toggleProduct}
        onToggleStatus={toggleStatus}
        onSearchChange={setSearchCode}
        onToggleLabels={toggleLabels}
        onToggleDirection={toggleDirection}
        onReset={resetFilters}
        onToggleAllProducts={toggleAllProducts}
        onToggleAllStatuses={toggleAllStatuses}
        totalPipelines={pipelines.length}
        filteredCount={filteredPipelines.length}
      />

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          boxShadow: 2,
          maxWidth: 200,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Products
        </Typography>
        {pipelinesByProduct.map(([productCode, count]) => (
          <Box key={productCode} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ width: 20, height: 3, bgcolor: 'primary.main', borderRadius: 1 }} />
            <Typography variant="caption">
              {productCode} ({count})
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
