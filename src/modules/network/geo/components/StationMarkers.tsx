/**
 * Station Markers Component
 * Renders station markers on the map with custom SVG icons
 * Icons change color based on operational status
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-26-2025
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marker, Popup } from 'react-leaflet';
import { Marker as LeafletMarker } from 'leaflet';
import { StationDTO } from '../../core/dto';
import { getIconByStatus, toLatLng } from '../utils';
import { MarkerPopup } from './MarkerPopup';
import { renderToStaticMarkup } from 'react-dom/server';

interface StationMarkersProps {
  stations: StationDTO[];
}

export const StationMarkers: React.FC<StationMarkersProps> = ({ stations }) => {
  const navigate = useNavigate();
  
  return (
    <>
      {stations.map((station) => {
        const markerRef = useRef<LeafletMarker>(null);
        
        // Get icon based on operational status
        const icon = getIconByStatus('station', station.operationalStatus?.code);
        
        return (
          <Marker
            key={`station-${station.id}`}
            position={toLatLng(station)}
            icon={icon}
            ref={markerRef}
            eventHandlers={{
              mouseover: () => {
                markerRef.current?.openPopup();
              },
              mouseout: () => {
                markerRef.current?.closePopup();
              },
              click: () => {
                // Navigate to edit page on click
                navigate(`/network/core/stations/${station.id}/edit`);
              },
            }}
          >
            <Popup closeButton={false}>
              <div dangerouslySetInnerHTML={{ 
                __html: renderToStaticMarkup(
                  <MarkerPopup data={station} type="station" />
                )
              }} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
