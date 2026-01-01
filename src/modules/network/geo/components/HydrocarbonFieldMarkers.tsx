/**
 * Hydrocarbon Field Markers Component
 * Renders hydrocarbon field markers on the map with custom SVG icons
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
import { HydrocarbonFieldDTO } from '../../core/dto';
import { getIconByStatus, toLatLng } from '../utils';
import { MarkerPopup } from './MarkerPopup';
import { renderToStaticMarkup } from 'react-dom/server';

interface HydrocarbonFieldMarkersProps {
  hydrocarbonFields: HydrocarbonFieldDTO[];
}

export const HydrocarbonFieldMarkers: React.FC<HydrocarbonFieldMarkersProps> = ({ 
  hydrocarbonFields 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      {hydrocarbonFields.map((field) => {
        const markerRef = useRef<LeafletMarker>(null);
        
        // Get icon based on operational status
        const icon = getIconByStatus('hydrocarbonField', field.operationalStatus?.code);
        
        return (
          <Marker
            key={`field-${field.id}`}
            position={toLatLng(field)}
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
                navigate(`/network/core/hydrocarbon-fields/${field.id}/edit`);
              },
            }}
          >
            <Popup closeButton={false}>
              <div dangerouslySetInnerHTML={{ 
                __html: renderToStaticMarkup(
                  <MarkerPopup data={field} type="hydrocarbonField" />
                )
              }} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
