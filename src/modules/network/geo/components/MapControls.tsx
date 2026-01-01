/**
 * Map Controls Component
 * Provides collapsible layer visibility controls and legend
 * Legend content moved from bottom corner to hover panel
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-26-2025
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import InfoIcon from '@mui/icons-material/Info';
import { Circle, Warning, Cancel, HelpOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MapFilters } from '../types';
import { infrastructureColors } from '../utils/iconFactory';

interface MapControlsProps {
  filters: MapFilters;
  onToggleFilter: (filterKey: keyof MapFilters) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({ filters, onToggleFilter }) => {
  const { t } = useTranslation();
  const [isLayersExpanded, setIsLayersExpanded] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

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
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* LAYERS CONTROL */}
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
        onMouseEnter={() => setIsLayersExpanded(true)}
        onMouseLeave={() => setIsLayersExpanded(false)}
      >
        {/* Layers Icon Button */}
        {!isLayersExpanded && (
          <Paper elevation={3} sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', bgcolor: 'white', cursor: 'pointer' }}>
            <Tooltip title={t('map.layers')} placement="left">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <LayersIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        )}

        {/* Expandable Layers Panel */}
        <Fade in={isLayersExpanded} timeout={300}>
          <Paper elevation={3} sx={{ p: 2, minWidth: 220, maxWidth: 300, borderRadius: '4px', display: isLayersExpanded ? 'block' : 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LayersIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('map.layers')}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            
            <Stack spacing={1.5}>
              {/* Stations */}
              <FormControlLabel
                control={<Switch checked={filters.showStations} onChange={() => onToggleFilter('showStations')} size="small" color="primary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#2196F3', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t('map.showStations')}</Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
              
              {/* Terminals */}
              <FormControlLabel
                control={<Switch checked={filters.showTerminals} onChange={() => onToggleFilter('showTerminals')} size="small" color="success" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4CAF50', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t('map.showTerminals')}</Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
              
              {/* Hydrocarbon Fields */}
              <FormControlLabel
                control={<Switch checked={filters.showHydrocarbonFields} onChange={() => onToggleFilter('showHydrocarbonFields')} size="small" color="warning" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#FF9800', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t('map.showHydrocarbonFields')}</Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
              
              {/* Pipelines */}
              <FormControlLabel
                control={<Switch checked={filters.showPipelines} onChange={() => onToggleFilter('showPipelines')} size="small" color="secondary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 3, bgcolor: '#9C27B0', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', borderRadius: '2px' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t('map.showPipelines')}</Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
            </Stack>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('map.clickToToggle')}
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>

      {/* LEGEND CONTROL */}
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
        onMouseEnter={() => setIsLegendExpanded(true)}
        onMouseLeave={() => setIsLegendExpanded(false)}
      >
        {/* Legend Icon Button */}
        {!isLegendExpanded && (
          <Paper elevation={3} sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', bgcolor: 'white', cursor: 'pointer' }}>
            <Tooltip title={t('map.legend')} placement="left">
              <IconButton size="small" sx={{ color: 'info.main' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        )}

        {/* Expandable Legend Panel - Using MapLegend content */}
        <Fade in={isLegendExpanded} timeout={300}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              minWidth: 200,
              maxWidth: 250,
              borderRadius: '4px',
              display: isLegendExpanded ? 'block' : 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main' }}>
                {t('map.legend')}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            
            {/* Infrastructure Types */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                {t('map.legend.infrastructureTypes', 'Infrastructure Types')}
              </Typography>
              {infrastructureTypes.map((type) => (
                <Box key={type.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
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
                    {t(`map.${type.key}`)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Status Colors */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                {t('map.legend.status', 'Operational Status')}
              </Typography>
              {statusTypes.map((status) => (
                <Box key={status.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
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
        </Fade>
      </Box>
    </Box>
  );
};
