/**
 * Pipeline Map View Component
 * Dedicated map view for pipelines with product-based coloring and advanced filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026 - Fixed product access from pipelineSystem
 */

import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { MapContainer, TileLayer, Polyline, Popup, Tooltip } from 'react-leaflet';
import { useMapData } from '../hooks/useMapData';
import { usePipelineFilters } from '../hooks/usePipelineFilters';
import { PipelineFilterPanel } from './PipelineFilterPanel';
import { CoordinateDisplay } from './CoordinateDisplay';
import { OfflineTileLayer } from './OfflineTileLayer';
import { OfflineIndicator } from './OfflineIndicator';
import { DEFAULT_PRODUCT_COLORS } from '../types/pipeline-filters.types';
import { PipelineGeoData } from '../types';
import { calculateCenter } from '../utils';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

interface PipelineMapViewProps {
  forceOffline?: boolean;
  onOfflineAvailabilityChange?: (available: boolean) => void;
}

export const PipelineMapView: React.FC<PipelineMapViewProps> = ({
  forceOffline = false,
  onOfflineAvailabilityChange,
}) => {
  const navigate = useNavigate();
  const { data, loading, error } = useMapData();
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);

  // Initialize filters with pipeline data
  const pipelines = data?.pipelines || [];
  
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

  // Calculate map center from all pipelines
  const mapCenter = useMemo(() => {
    if (pipelines.length === 0) return [28.0, 3.0] as [number, number];
    
    const allCoordinates = pipelines.flatMap((p) => p.coordinates);
    return calculateCenter(allCoordinates);
  }, [pipelines]);

  // Get pipeline style based on product
  const getPipelineStyleByProduct = (pipelineData: PipelineGeoData, isHovered: boolean) => {
    const pipeline = pipelineData.pipeline;
    // Product comes from pipelineSystem
    const productCode = pipeline.pipelineSystem?.product?.code || 'OTHER';
    const statusCode = pipeline.operationalStatus?.code?.toLowerCase();
    
    let color = DEFAULT_PRODUCT_COLORS[productCode] || DEFAULT_PRODUCT_COLORS['OTHER'];
    let weight = 4;
    let opacity = 0.8;
    let dashArray: string | undefined = undefined;

    // Adjust based on status
    if (statusCode === 'maintenance') {
      dashArray = '10, 10';
    } else if (statusCode === 'inactive' || statusCode === 'decommissioned') {
      opacity = 0.5;
      dashArray = '5, 10';
    } else if (statusCode === 'construction' || statusCode === 'under_construction') {
      dashArray = '15, 5';
    }

    // Adjust weight based on diameter
    if (pipeline.nominalDiameter) {
      if (pipeline.nominalDiameter >= 36) {
        weight = 6;
      } else if (pipeline.nominalDiameter >= 24) {
        weight = 5;
      } else if (pipeline.nominalDiameter >= 12) {
        weight = 4;
      } else {
        weight = 3;
      }
    }

    // Apply hover effect
    if (isHovered) {
      weight += 2;
      opacity = 1;
    }

    return { color, weight, opacity, dashArray };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '500px',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Loading pipeline data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Error loading pipeline data
          </Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
      </Box>
    );
  }

  if (pipelines.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No pipeline data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: '600px' }}>
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        maxZoom={10}
        minZoom={6}
      >
        <OfflineTileLayer
          offlineUrl="/tiles/algeria/{z}/{x}/{y}.png"
          onlineUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={10}
          minZoom={6}
          forceOffline={forceOffline}
          onOfflineAvailabilityChange={onOfflineAvailabilityChange}
        />

        <CoordinateDisplay />

        {/* Render filtered pipelines */}
        {filteredPipelines.map((pipelineData) => {
          const pipeline = pipelineData.pipeline;
          const isHovered = hoveredPipeline === pipeline.id;
          const style = getPipelineStyleByProduct(pipelineData, isHovered);
          const product = pipeline.pipelineSystem?.product;

          return (
            <Polyline
              key={`pipeline-${pipeline.id}`}
              positions={pipelineData.coordinates}
              pathOptions={style}
              eventHandlers={{
                mouseover: () => setHoveredPipeline(pipeline.id),
                mouseout: () => setHoveredPipeline(null),
                click: () => navigate(`/network/core/pipelines/${pipeline.id}`),
              }}
            >
              {/* Tooltip for quick info */}
              {filterState.filters.showLabels && (
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {pipeline.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pipeline.code}
                    </Typography>
                    {product && (
                      <Typography variant="caption" display="block">
                        Product: {product.name}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              )}

              {/* Detailed popup */}
              <Popup maxWidth={300}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {pipeline.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Code: {pipeline.code}
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 0.5, mt: 1 }}>
                    {pipeline.pipelineSystem && (
                      <Typography variant="body2">
                        <strong>System:</strong> {pipeline.pipelineSystem.name}
                      </Typography>
                    )}
                    {product && (
                      <Typography variant="body2">
                        <strong>Product:</strong> {product.name}
                      </Typography>
                    )}
                    {pipeline.operationalStatus && (
                      <Typography variant="body2">
                        <strong>Status:</strong> {pipeline.operationalStatus.name}
                      </Typography>
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
                    {pipeline.designCapacity && (
                      <Typography variant="body2">
                        <strong>Capacity:</strong> {pipeline.designCapacity.toLocaleString()} m³/day
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>

      {/* Compact Hover-Expandable Filter Panel - Always Visible */}
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

      <OfflineIndicator />
    </Box>
  );
};
