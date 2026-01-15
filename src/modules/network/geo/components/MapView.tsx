/**
 * Map View Component
 * Main map container with Leaflet integration
 * Legend now integrated in MapControls hover panel
 * Updated for U-006 schema (location reference)
 * 
 * Updated: 01-16-2026 - Replaced HydrocarbonFieldMarkers with ProductionFieldMarkers
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-16-2026
 */

import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MapContainer } from 'react-leaflet';
import { useMapData, useMapFilters } from '../hooks';
import { StationMarkers } from './StationMarkers';
import { TerminalMarkers } from './TerminalMarkers';
import { ProductionFieldMarkers } from './ProductionFieldMarkers';
import { PipelinePolylines } from './PipelinePolylines';
import { MapControls } from './MapControls';
import { OfflineTileLayer } from './OfflineTileLayer';
import { OfflineIndicator } from './OfflineIndicator';
import { CoordinateDisplay } from './CoordinateDisplay';
import { calculateCenter, toLatLng } from '../utils';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  /** Force offline tile mode */
  forceOffline?: boolean;
  /** Callback when offline tiles availability changes */
  onOfflineAvailabilityChange?: (available: boolean) => void;
}

export const MapView: React.FC<MapViewProps> = ({ 
  forceOffline = false,
  onOfflineAvailabilityChange 
}) => {
  const { t } = useTranslation();
  const { data, loading, error } = useMapData();
  const { filters, toggleFilter } = useMapFilters();

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
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          {t('map.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            {t('map.error')}
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          {t('map.noData')}
        </Alert>
      </Box>
    );
  }

  // Check if we have any data with coordinates
  const hasStations = data.stations && data.stations.length > 0;
  const hasTerminals = data.terminals && data.terminals.length > 0;
  const hasFields = data.productionFields && data.productionFields.length > 0;
  const hasPipelines = data.pipelines && data.pipelines.length > 0;

  if (!hasStations && !hasTerminals && !hasFields && !hasPipelines) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          {t('map.noData')}
        </Alert>
      </Box>
    );
  }

  // Calculate map center based on all infrastructure
  // U-006 Update: All entities now use location.latitude/longitude via location object
  const allCoordinates = [
    // Stations: access via location object
    ...(data.stations || [])
      .filter(s => s.location?.latitude && s.location?.longitude)
      .map(s => toLatLng({ location: { latitude: s.location!.latitude!, longitude: s.location!.longitude! } })),
    // Terminals: access via location object
    ...(data.terminals || [])
      .filter(t => t.location?.latitude && t.location?.longitude)
      .map(t => toLatLng({ location: { latitude: t.location!.latitude!, longitude: t.location!.longitude! } })),
    // Production Fields: access via location object
    ...(data.productionFields || [])
      .filter(f => f.location?.latitude && f.location?.longitude)
      .map(f => toLatLng({ location: { latitude: f.location!.latitude!, longitude: f.location!.longitude! } })),
    // Add pipeline coordinates for center calculation
    ...(data.pipelines || []).flatMap(p => p.coordinates)
  ];
  
  const center = calculateCenter(allCoordinates);

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: '600px' }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        maxZoom={10}
        minZoom={6}
      >
        {/* Offline-capable tile layer with manual control */}
        <OfflineTileLayer
          offlineUrl="/tiles/algeria/{z}/{x}/{y}.png"
          onlineUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={10}
          minZoom={6}
          forceOffline={forceOffline}
          onOfflineAvailabilityChange={onOfflineAvailabilityChange}
        />

        {/* Floating coordinate display */}
        <CoordinateDisplay />

        {/* Pipeline polylines - render first so markers appear on top */}
        {filters.showPipelines && hasPipelines && (
          <PipelinePolylines pipelines={data.pipelines || []} />
        )}

        {/* Infrastructure markers with custom SVG icons */}
        {filters.showStations && hasStations && (
          <StationMarkers stations={data.stations} />
        )}
        {filters.showTerminals && hasTerminals && (
          <TerminalMarkers terminals={data.terminals} />
        )}
        {filters.showProductionFields && hasFields && (
          <ProductionFieldMarkers productionFields={data.productionFields} />
        )}
      </MapContainer>

      {/* Map controls with integrated legend */}
      <MapControls filters={filters} onToggleFilter={toggleFilter} />
      
      {/* Offline indicator */}
      <OfflineIndicator />
    </Box>
  );
};
