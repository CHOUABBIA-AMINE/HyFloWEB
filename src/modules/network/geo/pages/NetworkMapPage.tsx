/**
 * Network Map Page
 * Main page component for infrastructure geovisualization
 * Full-screen map layout aligned with PipelineMapPage
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 02-02-2026 - Updated layout to match PipelineMapPage (full-screen, no container/paper)
 * @updated 12-25-2025
 */

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { MapView } from '../components';
import { TileModeToggle } from '../components';

export const NetworkMapPage: React.FC = () => {
  // State for tile mode control
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const [offlineTilesAvailable, setOfflineTilesAvailable] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Tile mode toggle - positioned absolutely over the map */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <TileModeToggle
          useOfflineMode={useOfflineMode}
          onModeChange={setUseOfflineMode}
          offlineTilesAvailable={offlineTilesAvailable}
          isNetworkOnline={isNetworkOnline}
        />
      </Box>

      {/* Full-screen map */}
      <MapView 
        forceOffline={useOfflineMode}
        onOfflineAvailabilityChange={setOfflineTilesAvailable}
      />
    </Box>
  );
};
