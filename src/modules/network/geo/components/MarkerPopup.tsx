/**
 * Marker Popup Component
 * Displays detailed information in map marker popups with enhanced styling
 * Updated for U-006 schema (location reference) and localized names
 * 
 * Updated: 01-16-2026 - Replaced HydrocarbonFieldDTO with ProductionFieldDTO
 * Updated: 01-19-2026 - Fixed placeName to use localized designations (designationFr/En/Ar)
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-19-2026
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { StationDTO, TerminalDTO, ProductionFieldDTO } from '../../core/dto';
import { getLocalizedName } from '../../core/utils/localizationUtils';

interface MarkerPopupProps {
  data: StationDTO | TerminalDTO | ProductionFieldDTO;
  type: 'station' | 'terminal' | 'productionField';
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const formatCoordinates = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

export const MarkerPopup: React.FC<MarkerPopupProps> = ({ data, type }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const getTypeConfig = () => {
    switch (type) {
      case 'station':
        return {
          label: `🏭 ${t('map.station')}`,
          color: '#1976d2',
          bgColor: '#e3f2fd'
        };
      case 'terminal':
        return {
          label: `🚢 ${t('map.terminal')}`,
          color: '#9c27b0',
          bgColor: '#f3e5f5'
        };
      case 'productionField':
        return {
          label: `🛢️ ${t('map.productionField')}`,
          color: '#2e7d32',
          bgColor: '#e8f5e9'
        };
    }
  };

  const config = getTypeConfig();
  const stationData = type === 'station' ? (data as StationDTO) : null;
  const terminalData = type === 'terminal' ? (data as TerminalDTO) : null;
  const fieldData = type === 'productionField' ? (data as ProductionFieldDTO) : null;

  // Get the specific type name using localized designations
  const getTypeName = () => {
    if (stationData?.stationType) {
      return getLocalizedName(stationData.stationType, currentLanguage);
    }
    if (terminalData?.terminalType) {
      return getLocalizedName(terminalData.terminalType, currentLanguage);
    }
    if (fieldData?.productionFieldType) {
      return getLocalizedName(fieldData.productionFieldType, currentLanguage);
    }
    return null;
  };

  const typeName = getTypeName();

  // Helper to get localized location name from LocationDTO
  const getLocationName = (location: any) => {
    if (!location) return 'N/A';
    
    // Use designationAr if language is 'ar' and designationAr is not null
    if (currentLanguage === 'ar' && location.designationAr) {
      return location.designationAr;
    }
    
    // Use designationEn if language is 'en' and designationEn is not null
    if (currentLanguage === 'en' && location.designationEn) {
      return location.designationEn;
    }
    
    // Otherwise use default designation (designationFr)
    return location.designationFr || 'N/A';
  };

  // Get coordinates based on entity type (U-006 schema)
  const getCoordinates = () => {
    if (stationData?.location) {
      // Station: via location object
      return {
        latitude: stationData.location.latitude || 0,
        longitude: stationData.location.longitude || 0,
        placeName: getLocationName(stationData.location),
        elevation: stationData.location.elevation
      };
    }
    if (terminalData?.location) {
      // Terminal: via location object (updated)
      return {
        latitude: terminalData.location.latitude || 0,
        longitude: terminalData.location.longitude || 0,
        placeName: getLocationName(terminalData.location),
        elevation: terminalData.location.elevation
      };
    }
    if (fieldData?.location) {
      // Production Field: via location object
      return {
        latitude: fieldData.location.latitude || 0,
        longitude: fieldData.location.longitude || 0,
        placeName: getLocationName(fieldData.location),
        elevation: fieldData.location.elevation
      };
    }
    return { latitude: 0, longitude: 0, placeName: 'N/A', elevation: undefined };
  };

  const coordinates = getCoordinates();

  // Get operational status name using localized designations
  const getOperationalStatusName = () => {
    if (data.operationalStatus) {
      return getLocalizedName(data.operationalStatus, currentLanguage);
    }
    return null;
  };

  const operationalStatusName = getOperationalStatusName();

  return (
    <div style={{ 
      fontFamily: 'Roboto, sans-serif',
      minWidth: '280px',
      maxWidth: '350px',
      cursor: 'pointer'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: config.bgColor,
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '4px',
        borderLeft: `4px solid ${config.color}`
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: config.color,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }}>
          {config.label}
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: typeName ? '6px' : '4px'
        }}>
          {data.name}
        </div>
        {/* Display the specific type prominently */}
        {typeName && (
          <div style={{
            fontSize: '13px',
            color: config.color,
            fontWeight: 600,
            marginBottom: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '3px 10px',
            borderRadius: '4px',
            display: 'inline-block',
            border: `1px solid ${config.color}40`
          }}>
            {typeName}
          </div>
        )}
        <div style={{
          fontSize: '13px',
          color: '#666',
          fontFamily: 'monospace',
          marginTop: typeName ? '0' : '0'
        }}>
          {data.code}
        </div>
      </div>

      {/* Location Info */}
      <div style={{ marginBottom: '12px' }}>
        <InfoRow 
          icon="📍" 
          label={t('map.location')}
          value={coordinates.placeName} 
        />
        <InfoRow 
          icon="🌐" 
          label={t('map.coordinates')}
          value={formatCoordinates(coordinates.latitude, coordinates.longitude)} 
        />
        {coordinates.elevation != null && (
          <InfoRow 
            icon="⛰️" 
            label={t('map.elevation')}
            value={`${coordinates.elevation} ${t('map.meters')}`}
          />
        )}
      </div>

      {/* Installation/Commissioning Dates */}
      <div style={{
        borderTop: '1px solid #e0e0e0',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        {data.installationDate && (
          <InfoRow 
            icon="🔧" 
            label={t('map.installed')}
            value={formatDate(data.installationDate)} 
          />
        )}
        {data.commissioningDate && (
          <InfoRow 
            icon="📅" 
            label={t('map.commissioned')}
            value={formatDate(data.commissioningDate)} 
          />
        )}
        {data.decommissioningDate && (
          <InfoRow 
            icon="🚫" 
            label={t('map.decommissioned')}
            value={formatDate(data.decommissioningDate)} 
          />
        )}

        {/* Operational Status */}
        {operationalStatusName && (
          <div style={{ marginTop: '8px' }}>
            <StatusBadge status={operationalStatusName} />
          </div>
        )}
      </div>
      
      {/* Click to edit hint */}
      <div style={{
        marginTop: '12px',
        paddingTop: '8px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '11px',
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        ✏️ {t('map.clickToEdit')}
      </div>
    </div>
  );
};

// Helper Components
const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ 
  icon, 
  label, 
  value 
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '13px',
    marginBottom: '6px',
    lineHeight: '1.4'
  }}>
    <span style={{ marginRight: '6px', fontSize: '14px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <span style={{ color: '#666', fontWeight: 500 }}>{label}:</span>
      {' '}
      <span style={{ color: '#1a1a1a' }}>{value}</span>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (!status) return null;

  const getStatusColor = () => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('operational') || statusLower.includes('active') || 
        statusLower.includes('opérationnel') || statusLower.includes('actif')) {
      return { bg: '#e8f5e9', color: '#2e7d32', icon: '✓' };
    }
    if (statusLower.includes('maintenance') || statusLower.includes('planned') ||
        statusLower.includes('planifié')) {
      return { bg: '#fff3e0', color: '#e65100', icon: '⚠' };
    }
    if (statusLower.includes('inactive') || statusLower.includes('closed') ||
        statusLower.includes('inactif') || statusLower.includes('fermé')) {
      return { bg: '#ffebee', color: '#c62828', icon: '✕' };
    }
    return { bg: '#f5f5f5', color: '#616161', icon: '•' };
  };

  const colors = getStatusColor();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: colors.bg,
      color: colors.color,
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      border: `1px solid ${colors.color}30`
    }}>
      <span style={{ marginRight: '4px' }}>{colors.icon}</span>
      {status}
    </div>
  );
};
