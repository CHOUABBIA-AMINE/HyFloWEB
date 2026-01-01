/**
 * Map Legend Component
 * Displays legend for map markers showing infrastructure types and status colors
 * 
 * @author CHOUABBIA Amine
 * @created 12-26-2025
 */

import { Box, Paper, Typography, Divider, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { infrastructureColors } from '../utils/iconFactory';
import { Circle, Warning, Cancel, HelpOutline } from '@mui/icons-material';

export const MapLegend: React.FC = () => {
  const { t } = useTranslation();

  const infrastructureTypes = [
    { key: 'station', color: infrastructureColors.station, icon: '🏭' },
    { key: 'terminal', color: infrastructureColors.terminal, icon: '🏢' },
    { key: 'hydrocarbonField', color: infrastructureColors.hydrocarbonField, icon: '⛽' },
    { key: 'pipeline', color: infrastructureColors.pipeline, icon: '━' }
  ];

  const statusTypes = [
    { key: 'operational', color: infrastructureColors.operational, icon: <Circle /> },
    { key: 'maintenance', color: infrastructureColors.maintenance, icon: <Warning /> },
    { key: 'offline', color: infrastructureColors.offline, icon: <Cancel /> },
    { key: 'unknown', color: infrastructureColors.unknown, icon: <HelpOutline /> }
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        p: 2,
        minWidth: 200,
        maxWidth: 250,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        {t('map.legend.title', 'Map Legend')}
      </Typography>

      {/* Infrastructure Types */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
          {t('map.legend.infrastructureTypes', 'Infrastructure Types')}
        </Typography>
        {infrastructureTypes.map((type) => (
          <Box
            key={type.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.5
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: type.color,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Typography sx={{ transform: 'rotate(45deg)', fontSize: '12px' }}>
                {type.icon}
              </Typography>
            </Box>
            <Typography variant="body2">
              {t(`map.legend.${type.key}`, type.key)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Status Colors */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
          {t('map.legend.status', 'Operational Status')}
        </Typography>
        {statusTypes.map((status) => (
          <Box
            key={status.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.5
            }}
          >
            <Box sx={{ color: status.color, display: 'flex', fontSize: '18px' }}>
              {status.icon}
            </Box>
            <Typography variant="body2">
              {t(`map.legend.status${status.key.charAt(0).toUpperCase() + status.key.slice(1)}`, status.key)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Info */}
      <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {t('map.legend.hint', 'Hover to view details, click to edit')}
        </Typography>
      </Box>
    </Paper>
  );
};
