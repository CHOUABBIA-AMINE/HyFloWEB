/**
 * Offline Indicator Component
 * Shows network connectivity status on the map
 * 
 * @author CHOUABBIA Amine
 * @created 12-25-2025
 * @updated 12-25-2025
 */

import { useEffect, useState } from 'react';
import { Box, Chip, Fade } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useTranslation } from 'react-i18next';

export const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Fade in={showIndicator} timeout={500}>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          display: showIndicator ? 'block' : 'none'
        }}
      >
        <Chip
          icon={<CloudOffIcon />}
          label={t('map.offlineMode')}
          color="warning"
          size="small"
          sx={{
            fontWeight: 600,
            boxShadow: 2,
            animation: 'pulse 2s infinite'
          }}
        />
      </Box>
    </Fade>
  );
};
