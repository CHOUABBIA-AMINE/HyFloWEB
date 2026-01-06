/**
 * Pipeline Map View Component
 * Dedicated map view for pipelines with product-based coloring and advanced filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026 - Zoom-dependent pipeline thickness
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import { MapContainer, Polyline, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import { useMapData } from '../hooks/useMapData';
import { usePipelineFilters } from '../hooks/usePipelineFilters';
import { PipelineFilterPanel } from './PipelineFilterPanel';
import { CoordinateDisplay } from './CoordinateDisplay';
import { OfflineTileLayer } from './OfflineTileLayer';
import { OfflineIndicator } from './OfflineIndicator';
import { getProductColor } from '../types/pipeline-filters.types';
import { PipelineGeoData } from '../types';
import { calculateCenter } from '../utils';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

interface PipelineMapViewProps {
  forceOffline?: boolean;
  onOfflineAvailabilityChange?: (available: boolean) => void;
}

// Helper component to track zoom changes
const ZoomWatcher: React.FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (e) => {
      const z = e.target.getZoom();
      onZoomChange(z);
    },
  });
  return null;
};

export const PipelineMapView: React.FC<PipelineMapViewProps> = ({
  forceOffline = false,
  onOfflineAvailabilityChange,
}) => {
  const navigate = useNavigate();
  const { data, loading, error } = useMapData();
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);

  // Track zoom to adjust line thickness
  const [zoom, setZoom] = useState<number>(6);

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

  // Debug: Log product distribution on mount
  useEffect(() => {
    if (pipelines.length > 0) {
      const productCounts = new Map<string, number>();
      const productSample = new Map<string, string>();

      pipelines.forEach((p) => {
        const productCode = p.pipeline.pipelineSystem?.product?.code || 'NO_PRODUCT';
        const color = getProductColor(productCode);
        productCounts.set(productCode, (productCounts.get(productCode) || 0) + 1);
        if (!productSample.has(productCode)) {
          productSample.set(productCode, color);
        }
      });

      console.log('PipelineMapView - Product distribution:', Object.fromEntries(productCounts));
      console.log('PipelineMapView - Product colors:', Object.fromEntries(productSample));
    }
  }, [pipelines]);

  // Calculate map center from all pipelines
  const mapCenter = useMemo(() => {
    if (pipelines.length === 0) return [28.0, 3.0] as [number, number];

    const allCoordinates = pipelines.flatMap((p) => p.coordinates);
    return calculateCenter(allCoordinates);
  }, [pipelines]);

  // Convert zoom level to a base stroke weight
  // zoom range: 6..10
  const baseWeightByZoom = useMemo(() => {
    if (zoom <= 6) return 1.5;
    if (zoom === 7) return 2;
    if (zoom === 8) return 2.5;
    if (zoom === 9) return 3;
    return 3.5; // zoom 10+
  }, [zoom]);

  // Get pipeline style based on product
  const getPipelineStyleByProduct = (pipelineData: PipelineGeoData, isHovered: boolean) => {
    const pipeline = pipelineData.pipeline;
    const productCode = pipeline.pipelineSystem?.product?.code;
    const statusCode = pipeline.operationalStatus?.code?.toLowerCase();

    const color = getProductColor(productCode);

    // Start from zoom-based weight
    let weight = baseWeightByZoom;
    let opacity = 0.85;
    let dashArray: string | undefined = undefined;

    // Slight diameter influence (kept subtle)
    if (pipeline.nominalDiameter) {
      if (pipeline.nominalDiameter >= 36) weight += 0.6;
      else if (pipeline.nominalDiameter >= 24) weight += 0.4;
      else if (pipeline.nominalDiameter >= 12) weight += 0.2;
    }

    // Adjust based on status
    if (statusCode === 'maintenance') {
      dashArray = '8, 8';
    } else if (statusCode === 'inactive' || statusCode === 'decommissioned') {
      opacity = 0.45;
      dashArray = '4, 8';
    } else if (statusCode === 'construction' || statusCode === 'under_construction') {
      dashArray = '12, 4';
    }

    // Hover effect (noticeable but not too thick)
    if (isHovered) {
      weight += 1;
      opacity = 1;
    }

    return { color, weight, opacity, dashArray };
  };

  // Get unique products in current view for legend
  const activeProducts = useMemo(() => {
    const products = new Map<string, { code: string; name: string; color: string }>();
    pipelines.forEach((p) => {
      const productCode = p.pipeline.pipelineSystem?.product?.code;
      const productName = p.pipeline.pipelineSystem?.product?.name;
      if (productCode && !products.has(productCode)) {
        products.set(productCode, {
          code: productCode,
          name: productName || productCode,
          color: getProductColor(productCode),
        });
      }
    });
    return Array.from(products.values());
  }, [pipelines]);

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
        <ZoomWatcher onZoomChange={setZoom} />

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
                        Product: {product.name} ({product.code})
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
                        <strong>Product:</strong> {product.name} ({product.code})
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

      {/* Color Legend */}
      {activeProducts.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 60,
            left: 16,
            p: 1.5,
            minWidth: 180,
            zIndex: 1000,
          }}
        >
          <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
            Product Colors
          </Typography>
          {activeProducts.map(({ code, name, color }) => (
            <Box
              key={code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 4,
                  bgcolor: color,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption">{name}</Typography>
            </Box>
          ))}
        </Paper>
      )}

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
