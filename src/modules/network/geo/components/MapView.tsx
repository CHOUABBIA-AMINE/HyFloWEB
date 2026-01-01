/**
 * Map View Component
 * Main map container with Leaflet integration
 * Legend now integrated in MapControls hover panel
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-26-2025
 */

import { useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMapData, useMapFilters } from '../hooks';
import { StationMarkers } from './StationMarkers';
import { TerminalMarkers } from './TerminalMarkers';
import { HydrocarbonFieldMarkers } from './HydrocarbonFieldMarkers';
import { MapControls } from './MapControls';
import { OfflineTileLayer } from './OfflineTileLayer';
import { OfflineIndicator } from './OfflineIndicator';
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
  const hasFields = data.hydrocarbonFields && data.hydrocarbonFields.length > 0;

  if (!hasStations && !hasTerminals && !hasFields) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          {t('map.noData')}
        </Alert>
      </Box>
    );
  }

  // Calculate map center based on all infrastructure
  const allCoordinates = [
    ...(data.stations || []).filter(s => s.latitude && s.longitude).map(toLatLng),
    ...(data.terminals || []).filter(t => t.latitude && t.longitude).map(toLatLng),
    ...(data.hydrocarbonFields || []).filter(f => f.latitude && f.longitude).map(toLatLng)
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

        {/* Infrastructure markers with custom SVG icons */}
        {filters.showStations && hasStations && (
          <StationMarkers stations={data.stations} />
        )}
        {filters.showTerminals && hasTerminals && (
          <TerminalMarkers terminals={data.terminals} />
        )}
        {filters.showHydrocarbonFields && hasFields && (
          <HydrocarbonFieldMarkers hydrocarbonFields={data.hydrocarbonFields} />
        )}
      </MapContainer>

      {/* Map controls with integrated legend */}
      <MapControls filters={filters} onToggleFilter={toggleFilter} />
      
      {/* Offline indicator */}
      <OfflineIndicator />
    </Box>
  );
};
