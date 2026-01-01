/**
 * Network Map Page
 * Main page component for infrastructure geovisualization
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-25-2025
 */

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components';
import { TileModeToggle } from '../components';

export const NetworkMapPage: React.FC = () => {
  const { t } = useTranslation();
  
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
    <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('map.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('map.description')}
            </Typography>
          </Box>
          
          {/* Tile mode toggle - now outside the map */}
          <TileModeToggle
            useOfflineMode={useOfflineMode}
            onModeChange={setUseOfflineMode}
            offlineTilesAvailable={offlineTilesAvailable}
            isNetworkOnline={isNetworkOnline}
          />
        </Box>

        <Box sx={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          <MapView 
            forceOffline={useOfflineMode}
            onOfflineAvailabilityChange={setOfflineTilesAvailable}
          />
        </Box>
      </Paper>
    </Container>
  );
};
