/**
 * Terminal Markers Component
 * Renders terminal markers on the map with custom SVG icons
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
import { TerminalDTO } from '../../core/dto';
import { getIconByStatus, toLatLng } from '../utils';
import { MarkerPopup } from './MarkerPopup';
import { renderToStaticMarkup } from 'react-dom/server';

interface TerminalMarkersProps {
  terminals: TerminalDTO[];
}

export const TerminalMarkers: React.FC<TerminalMarkersProps> = ({ terminals }) => {
  const navigate = useNavigate();
  
  return (
    <>
      {terminals.map((terminal) => {
        const markerRef = useRef<LeafletMarker>(null);
        
        // Get icon based on operational status
        const icon = getIconByStatus('terminal', terminal.operationalStatus?.code);
        
        return (
          <Marker
            key={`terminal-${terminal.id}`}
            position={toLatLng(terminal)}
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
                navigate(`/network/core/terminals/${terminal.id}/edit`);
              },
            }}
          >
            <Popup closeButton={false}>
              <div dangerouslySetInnerHTML={{ 
                __html: renderToStaticMarkup(
                  <MarkerPopup data={terminal} type="terminal" />
                )
              }} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
