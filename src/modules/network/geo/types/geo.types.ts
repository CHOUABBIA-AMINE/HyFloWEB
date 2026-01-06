/**
 * Geo Types
 * TypeScript types for geovisualization functionality
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-06-2026
 */

import { StationDTO, TerminalDTO, HydrocarbonFieldDTO, PipelineDTO } from '../../core/dto';
import { LatLngExpression } from 'leaflet';

export interface LocationPoint {
  id: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  sequence?: number;
}

export interface PipelineGeoData {
  pipeline: PipelineDTO;
  locations: LocationPoint[];
  coordinates: LatLngExpression[];
}

export interface InfrastructureData {
  stations: StationDTO[];
  terminals: TerminalDTO[];
  hydrocarbonFields: HydrocarbonFieldDTO[];
  pipelines?: PipelineGeoData[];
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

export interface PipelineStyleOptions {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
}

export interface PipelineDisplayOptions extends PipelineStyleOptions {
  showLabels: boolean;
  showDirection: boolean;
  highlightOnHover: boolean;
}
