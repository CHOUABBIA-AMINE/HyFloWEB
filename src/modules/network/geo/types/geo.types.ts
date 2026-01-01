/**
 * Geo Types
 * TypeScript types for geovisualization functionality
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-24-2025
 */

import { StationDTO, TerminalDTO, HydrocarbonFieldDTO } from '../../core/dto';
import { LatLngExpression } from 'leaflet';

export interface InfrastructureData {
  stations: StationDTO[];
  terminals: TerminalDTO[];
  hydrocarbonFields: HydrocarbonFieldDTO[];
}

export interface MapFilters {
  showStations: boolean;
  showTerminals: boolean;
  showHydrocarbonFields: boolean;
  showPipelines: boolean;
}

export interface MarkerData {
  id: number;
  name: string;
  code: string;
  position: LatLngExpression;
  type: 'station' | 'terminal' | 'hydrocarbonField';
  data: StationDTO | TerminalDTO | HydrocarbonFieldDTO;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
