/**
 * Icon Factory
 * Factory functions for creating custom Leaflet marker icons
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-26-2025
 */

import L from 'leaflet';

// Fix Leaflet default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Infrastructure and Status Colors
 * Centralized color scheme for consistency across the application
 */
export const infrastructureColors = {
  // Infrastructure Types
  station: '#2196F3',           // Blue
  terminal: '#4CAF50',          // Green
  hydrocarbonField: '#FF9800',  // Orange
  pipeline: '#9C27B0',          // Purple
  
  // Operational Status
  operational: '#4CAF50',       // Green
  maintenance: '#FF9800',       // Orange
  offline: '#F44336',           // Red
  unknown: '#9E9E9E'            // Gray
};

/**
 * Create custom colored marker icon with emoji
 */
export const createCustomIcon = (color: string, emoji: string): L.DivIcon => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 16px;
        ">${emoji}</div>
      </div>
    `,
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [1, -34]
  });
};

/**
 * Create custom colored marker icon (simple version without emoji)
 */
export const createColoredIcon = (color: string): L.DivIcon => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
};

/**
 * Get infrastructure type emoji
 */
const getInfrastructureEmoji = (type: string): string => {
  const emojis: Record<string, string> = {
    station: '🏭',
    terminal: '🏢',
    hydrocarbonField: '⛽',
    field: '⛽'
  };
  return emojis[type] || '📍';
};

/**
 * Get icon color based on operational status
 */
const getStatusColor = (statusCode?: string): string => {
  if (!statusCode) return infrastructureColors.unknown;
  
  const code = statusCode.toLowerCase();
  
  if (code.includes('operational') || code.includes('active')) {
    return infrastructureColors.operational;
  }
  if (code.includes('maintenance') || code.includes('under_maintenance')) {
    return infrastructureColors.maintenance;
  }
  if (code.includes('offline') || code.includes('inactive') || code.includes('decommissioned')) {
    return infrastructureColors.offline;
  }
  
  return infrastructureColors.unknown;
};

/**
 * Get icon by infrastructure type and operational status
 */
export const getIconByStatus = (type: string, statusCode?: string): L.DivIcon => {
  const emoji = getInfrastructureEmoji(type);
  const color = getStatusColor(statusCode);
  return createCustomIcon(color, emoji);
};

/**
 * Predefined icons for different infrastructure types (using base colors)
 */
export const icons = {
  station: createCustomIcon(infrastructureColors.station, '🏭'),
  terminal: createCustomIcon(infrastructureColors.terminal, '🏢'),
  hydrocarbonField: createCustomIcon(infrastructureColors.hydrocarbonField, '⛽'),
  pipeline: infrastructureColors.pipeline // Color for polylines
};
