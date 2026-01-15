/**
 * Production Field Markers Component
 * Renders production field markers on the map with custom SVG icons
 * Icons change color based on operational status
 * 
 * Renamed: 01-16-2026 - From HydrocarbonFieldMarkers to ProductionFieldMarkers
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-16-2026
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marker, Popup } from 'react-leaflet';
import { Marker as LeafletMarker } from 'leaflet';
import { ProductionFieldDTO } from '../../core/dto';
import { getIconByStatus, toLatLng } from '../utils';
import { MarkerPopup } from './MarkerPopup';
import { renderToStaticMarkup } from 'react-dom/server';

interface ProductionFieldMarkersProps {
  productionFields: ProductionFieldDTO[];
}

export const ProductionFieldMarkers: React.FC<ProductionFieldMarkersProps> = ({ 
  productionFields 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      {productionFields.map((field) => {
        const markerRef = useRef<LeafletMarker>(null);
        
        // Get icon based on operational status
        const icon = getIconByStatus('productionField', field.operationalStatus?.code);
        
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
                navigate(`/network/core/production-fields/${field.id}/edit`);
              },
            }}
          >
            <Popup closeButton={false}>
              <div dangerouslySetInnerHTML={{ 
                __html: renderToStaticMarkup(
                  <MarkerPopup data={field} type="productionField" />
                )
              }} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
