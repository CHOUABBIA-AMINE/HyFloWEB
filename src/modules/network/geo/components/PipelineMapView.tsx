/**
 * Pipeline Map View Component
 * Main map component for displaying pipelines
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed coordinate type handling
 */

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Chip, Divider, Button } from '@mui/material';
import { PipelineGeoData } from '../types';
import { usePipelineFilters } from '../hooks/usePipelineFilters';
import { PipelineFilterPanel } from './PipelineFilterPanel';
import { getPipelineStyle } from '../utils/pipelineHelpers';
import { useNavigate } from 'react-router-dom';
import { LatLngTuple } from 'leaflet';
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
      navigate(`/network/core/pipelines/${pipelineId}`);
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

        {/* Render filtered pipelines */}
        {filteredPipelines.map((pipelineData) => {
          const { pipeline, coordinates } = pipelineData;

          if (!coordinates || coordinates.length < 2 || !pipeline.id) {
            return null;
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
              positions={coordinates}
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
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      if (pipeline.id !== undefined) {
                        handlePipelineClick(pipeline.id);
                      }
                    }}
                  >
                    View Details
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
