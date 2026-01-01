/**
 * Marker Popup Component
 * Displays detailed information in map marker popups with enhanced styling
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-25-2025
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { StationDTO, TerminalDTO, HydrocarbonFieldDTO } from '../../core/dto';

interface MarkerPopupProps {
  data: StationDTO | TerminalDTO | HydrocarbonFieldDTO;
  type: 'station' | 'terminal' | 'hydrocarbonField';
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
  const { t } = useTranslation();

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
      case 'hydrocarbonField':
        return {
          label: `🛢️ ${t('map.hydrocarbonField')}`,
          color: '#2e7d32',
          bgColor: '#e8f5e9'
        };
    }
  };

  const config = getTypeConfig();
  const stationData = type === 'station' ? (data as StationDTO) : null;
  const terminalData = type === 'terminal' ? (data as TerminalDTO) : null;
  const fieldData = type === 'hydrocarbonField' ? (data as HydrocarbonFieldDTO) : null;

  // Get the specific type name
  const getTypeName = () => {
    if (stationData?.stationType?.name) return stationData.stationType.name;
    if (terminalData?.terminalType?.name) return terminalData.terminalType.name;
    if (fieldData?.fieldType?.name) return fieldData.fieldType.name;
    
    // Fallback to legacy string fields
    if ((data as any).stationTypeName) return (data as any).stationTypeName;
    if ((data as any).terminalTypeName) return (data as any).terminalTypeName;
    if ((data as any).fieldTypeName) return (data as any).fieldTypeName;
    
    return null;
  };

  const typeName = getTypeName();

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

      {/* Description */}
      {data.description && (
        <div style={{
          fontSize: '13px',
          color: '#555',
          marginBottom: '12px',
          lineHeight: '1.4',
          fontStyle: 'italic'
        }}>
          {data.description}
        </div>
      )}

      {/* Location Info */}
      <div style={{ marginBottom: '12px' }}>
        <InfoRow 
          icon="📍" 
          label={t('map.location')}
          value={data.placeName || 'N/A'} 
        />
        <InfoRow 
          icon="🌐" 
          label={t('map.coordinates')}
          value={formatCoordinates(data.latitude, data.longitude)} 
        />
        {data.elevation != null && (
          <InfoRow 
            icon="⛰️" 
            label={t('map.elevation')}
            value={`${data.elevation} ${t('map.meters')}`}
          />
        )}
      </div>

      {/* Type-specific information */}
      <div style={{
        borderTop: '1px solid #e0e0e0',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        {stationData && (
          <>
            {stationData.capacity != null && (
              <InfoRow 
                icon="⚡" 
                label={t('map.capacity')}
                value={`${stationData.capacity.toLocaleString()} ${t('map.units')}`}
              />
            )}
            {stationData.commissioningDate && (
              <InfoRow 
                icon="📅" 
                label={t('map.commissioned')}
                value={formatDate(stationData.commissioningDate)} 
              />
            )}
          </>
        )}

        {terminalData && (
          <>
            {terminalData.storageCapacity != null && (
              <InfoRow 
                icon="📦" 
                label={t('map.storage')}
                value={`${terminalData.storageCapacity.toLocaleString()} ${t('map.cubicMeters')}`}
              />
            )}
            {terminalData.commissioningDate && (
              <InfoRow 
                icon="📅" 
                label={t('map.commissioned')}
                value={formatDate(terminalData.commissioningDate)} 
              />
            )}
          </>
        )}

        {fieldData && (
          <>
            {fieldData.reserves != null && (
              <InfoRow 
                icon="💎" 
                label={t('map.reserves')}
                value={`${fieldData.reserves.toLocaleString()} ${t('map.units')}`}
              />
            )}
            {fieldData.discoveryDate && (
              <InfoRow 
                icon="🔍" 
                label={t('map.discovered')}
                value={formatDate(fieldData.discoveryDate)} 
              />
            )}
          </>
        )}

        {/* Operational Status */}
        {data.operationalStatus && data.operationalStatus.name && (
          <div style={{ marginTop: '8px' }}>
            <StatusBadge status={data.operationalStatus.name} />
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
    if (statusLower.includes('operational') || statusLower.includes('active')) {
      return { bg: '#e8f5e9', color: '#2e7d32', icon: '✓' };
    }
    if (statusLower.includes('maintenance') || statusLower.includes('planned')) {
      return { bg: '#fff3e0', color: '#e65100', icon: '⚠' };
    }
    if (statusLower.includes('inactive') || statusLower.includes('closed')) {
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
