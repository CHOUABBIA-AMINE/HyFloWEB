/**
 * Tile Mode Toggle Component
 * Allows users to manually switch between online and offline map tiles
 * 
 * @author CHOUABBIA Amine
 * @created 12-25-2025
 * @updated 12-25-2025
 */

import { Box, Switch, FormControlLabel, Paper, Tooltip, Chip } from '@mui/material';
import { WifiOff, Wifi, Cloud, CloudOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface TileModeToggleProps {
  /** Current tile mode (true = offline, false = online) */
  useOfflineMode: boolean;
  /** Callback when mode changes */
  onModeChange: (useOffline: boolean) => void;
  /** Whether offline tiles are available */
  offlineTilesAvailable: boolean;
  /** Whether device is currently online */
  isNetworkOnline: boolean;
}

/**
 * Toggle control for switching between online and offline map tiles
 */
export const TileModeToggle: React.FC<TileModeToggleProps> = ({
  useOfflineMode,
  onModeChange,
  offlineTilesAvailable,
  isNetworkOnline
}) => {
  const { t } = useTranslation();

  // Determine if user can switch modes
  const canUseOnline = isNetworkOnline;
  const canUseOffline = offlineTilesAvailable;
  const isDisabled = !isNetworkOnline && !offlineTilesAvailable;

  const getStatusChip = () => {
    if (!isNetworkOnline) {
      return (
        <Chip
          icon={<WifiOff />}
          label={t('map.network.offline')}
          size="small"
          color="warning"
          sx={{ ml: 1 }}
        />
      );
    }
    if (!offlineTilesAvailable) {
      return (
        <Chip
          icon={<CloudOff />}
          label={t('map.tiles.notAvailable')}
          size="small"
          color="info"
          sx={{ ml: 1 }}
        />
      );
    }
    return null;
  };

  const getTooltipText = () => {
    if (!isNetworkOnline) {
      return t('map.tiles.offlineOnly');
    }
    if (!canUseOffline && useOfflineMode) {
      return t('map.tiles.offlineNotAvailable');
    }
    return useOfflineMode ? t('map.tiles.switchToOnline') : t('map.tiles.switchToOffline');
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 1.5,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Tooltip title={getTooltipText()} arrow>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={useOfflineMode}
                onChange={(e) => onModeChange(e.target.checked)}
                disabled={isDisabled || (!canUseOffline && useOfflineMode)}
                color="primary"
                icon={<Wifi />}
                checkedIcon={<Cloud />}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {useOfflineMode ? (
                  <>
                    <Cloud fontSize="small" />
                    <span>{t('map.tiles.offline')}</span>
                  </>
                ) : (
                  <>
                    <Wifi fontSize="small" />
                    <span>{t('map.tiles.online')}</span>
                  </>
                )}
              </Box>
            }
            labelPlacement="start"
            sx={{
              m: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500
              }
            }}
          />
          {getStatusChip()}
        </Box>
      </Tooltip>
    </Paper>
  );
};
