/**
 * Pipeline Helper Utilities
 * 
 * Utility functions for working with PipelineDTO objects.
 * Includes formatting, validation helpers, and data transformation.
 * 
 * Updated: 02-14-2026 01:32 - Removed coordinateIds helpers (coordinates belong to PipelineSegment)
 * Updated: 02-06-2026 - Fixed coordinateIds/vendorIds (removed old coordinates/vendors/vendorId fields)
 * Updated: 02-06-2026 - Aligned with updated PipelineDTO (nominalDiameter/Thickness as string, coordinates support)
 * Updated: 02-02-2026 - Fixed DTO field names (designationFr instead of name)
 * 
 * @author CHOUABBIA Amine
 * @created 02-02-2026
 */

import type { PipelineDTO } from '../dto/PipelineDTO';

/**
 * Format pipeline display name
 * Combines code and name for user-friendly display
 * 
 * @param pipeline - Pipeline DTO
 * @returns Formatted display name
 * 
 * @example
 * formatPipelineDisplayName({ code: 'PL-001', name: 'Main Pipeline' })
 * // Returns: "PL-001 - Main Pipeline"
 */
export const formatPipelineDisplayName = (pipeline: PipelineDTO): string => {
  if (!pipeline) return '';
  return `${pipeline.code} - ${pipeline.name}`;
};

/**
 * Format pipeline pressure specification
 * Creates readable pressure range text
 * 
 * @param pipeline - Pipeline DTO
 * @param type - Type of pressure (design or operational)
 * @param unit - Pressure unit (default: 'bar')
 * @returns Formatted pressure range
 * 
 * @example
 * formatPipelinePressureRange(pipeline, 'design', 'psi')
 * // Returns: "100 - 1000 psi"
 */
export const formatPipelinePressureRange = (
  pipeline: PipelineDTO,
  type: 'design' | 'operational' = 'operational',
  unit: string = 'bar'
): string => {
  if (!pipeline) return '';
  
  const minPressure = type === 'design' 
    ? pipeline.designMinServicePressure 
    : pipeline.operationalMinServicePressure;
  const maxPressure = type === 'design' 
    ? pipeline.designMaxServicePressure 
    : pipeline.operationalMaxServicePressure;
  
  return `${minPressure} - ${maxPressure} ${unit}`;
};

/**
 * Format pipeline capacity
 * 
 * @param pipeline - Pipeline DTO
 * @param type - Type of capacity (design or operational)
 * @param unit - Capacity unit (default: 'm³/day')
 * @returns Formatted capacity
 * 
 * @example
 * formatPipelineCapacity(pipeline, 'operational', 'bbl/day')
 * // Returns: "45,000 bbl/day"
 */
export const formatPipelineCapacity = (
  pipeline: PipelineDTO,
  type: 'design' | 'operational' = 'operational',
  unit: string = 'm³/day'
): string => {
  if (!pipeline) return '';
  
  const capacity = type === 'design' 
    ? pipeline.designCapacity 
    : pipeline.operationalCapacity;
  
  return `${capacity.toLocaleString()} ${unit}`;
};

/**
 * Get pipeline route description
 * Creates readable route from departure to arrival terminals
 * 
 * @param pipeline - Pipeline DTO with populated terminals
 * @returns Route description
 * 
 * @example
 * getPipelineRoute(pipeline)
 * // Returns: "Field A → Terminal B"
 */
export const getPipelineRoute = (pipeline: PipelineDTO): string => {
  if (!pipeline) return '';
  
  const departure = pipeline.departureTerminal?.name || 'Unknown';
  const arrival = pipeline.arrivalTerminal?.name || 'Unknown';
  
  return `${departure} → ${arrival}`;
};

/**
 * Calculate pipeline utilization percentage
 * 
 * @param pipeline - Pipeline DTO
 * @returns Utilization percentage (0-100)
 * 
 * @example
 * calculatePipelineUtilization(pipeline)
 * // Returns: 90.0 (if operational is 45000 and design is 50000)
 */
export const calculatePipelineUtilization = (pipeline: PipelineDTO): number => {
  if (!pipeline || !pipeline.designCapacity) return 0;
  
  return (pipeline.operationalCapacity / pipeline.designCapacity) * 100;
};

/**
 * Check if pipeline is near capacity
 * 
 * @param pipeline - Pipeline DTO
 * @param threshold - Threshold percentage (default: 90)
 * @returns True if utilization is above threshold
 */
export const isPipelineNearCapacity = (
  pipeline: PipelineDTO,
  threshold: number = 90
): boolean => {
  return calculatePipelineUtilization(pipeline) >= threshold;
};

/**
 * Get pipeline status color based on operational status
 * 
 * @param pipeline - Pipeline DTO with populated operational status
 * @returns MUI color name
 */
export const getPipelineStatusColor = (pipeline: PipelineDTO): string => {
  if (!pipeline?.operationalStatus) return 'default';
  
  const statusCode = pipeline.operationalStatus.code?.toUpperCase();
  
  switch (statusCode) {
    case 'OPERATIONAL':
    case 'ACTIVE':
      return 'success';
    case 'MAINTENANCE':
    case 'TESTING':
      return 'warning';
    case 'INACTIVE':
    case 'DECOMMISSIONED':
      return 'error';
    case 'UNDER_CONSTRUCTION':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Check if pipeline has all required fields for creation
 * 
 * @param pipeline - Partial pipeline DTO
 * @returns True if all required fields are present
 */
export const isPipelineComplete = (pipeline: Partial<PipelineDTO>): boolean => {
  const requiredFields: (keyof PipelineDTO)[] = [
    'code',
    'name',
    'nominalDiameter',      // String (e.g., "48 inches")
    'length',
    'nominalThickness',     // String (e.g., "12.7 mm")
    'nominalRoughness',     // Number (e.g., 0.045)
    'designMaxServicePressure',
    'operationalMaxServicePressure',
    'designMinServicePressure',
    'operationalMinServicePressure',
    'designCapacity',
    'operationalCapacity',
    'operationalStatusId',
    'ownerId',
    'managerId',
    'pipelineSystemId',
    'departureTerminalId',
    'arrivalTerminalId',
  ];
  
  return requiredFields.every(field => {
    const value = pipeline[field];
    // For strings: check not empty, for numbers: check not null/undefined
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    return value !== undefined && value !== null;
  });
};

/**
 * Get missing required fields
 * 
 * @param pipeline - Partial pipeline DTO
 * @returns Array of missing field names
 */
export const getMissingPipelineFields = (pipeline: Partial<PipelineDTO>): string[] => {
  const requiredFields: (keyof PipelineDTO)[] = [
    'code',
    'name',
    'nominalDiameter',
    'length',
    'nominalThickness',
    'nominalRoughness',
    'designMaxServicePressure',
    'operationalMaxServicePressure',
    'designMinServicePressure',
    'operationalMinServicePressure',
    'designCapacity',
    'operationalCapacity',
    'operationalStatusId',
    'ownerId',
    'managerId',
    'pipelineSystemId',
    'departureTerminalId',
    'arrivalTerminalId',
  ];
  
  return requiredFields.filter(field => {
    const value = pipeline[field];
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    return value === undefined || value === null;
  });
};

/**
 * Format pipeline length with unit
 * 
 * @param pipeline - Pipeline DTO
 * @param unit - Length unit (default: 'km')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted length
 * 
 * @example
 * formatPipelineLength(pipeline, 'km', 2)
 * // Returns: "150.50 km"
 */
export const formatPipelineLength = (
  pipeline: PipelineDTO,
  unit: string = 'km',
  decimals: number = 2
): string => {
  if (!pipeline) return '';
  return `${pipeline.length.toFixed(decimals)} ${unit}`;
};

/**
 * Format pipeline diameter (already includes unit from backend)
 * 
 * @param pipeline - Pipeline DTO
 * @returns Formatted diameter with unit (e.g., "48 inches", "1200 mm")
 * 
 * @example
 * formatPipelineDiameter(pipeline)
 * // Returns: "48 inches"
 */
export const formatPipelineDiameter = (pipeline: PipelineDTO): string => {
  if (!pipeline) return '';
  return pipeline.nominalDiameter; // Already includes unit from backend
};

/**
 * Format pipeline thickness (already includes unit from backend)
 * 
 * @param pipeline - Pipeline DTO
 * @returns Formatted thickness with unit (e.g., "12.7 mm", "0.5 inch")
 * 
 * @example
 * formatPipelineThickness(pipeline)
 * // Returns: "12.7 mm"
 */
export const formatPipelineThickness = (pipeline: PipelineDTO): string => {
  if (!pipeline) return '';
  return pipeline.nominalThickness; // Already includes unit from backend
};

/**
 * Format pipeline roughness (numeric value, add unit if needed)
 * 
 * @param pipeline - Pipeline DTO
 * @param unit - Roughness unit (default: 'mm')
 * @returns Formatted roughness
 * 
 * @example
 * formatPipelineRoughness(pipeline, 'mm')
 * // Returns: "0.045 mm"
 */
export const formatPipelineRoughness = (
  pipeline: PipelineDTO,
  unit: string = 'mm'
): string => {
  if (!pipeline) return '';
  return `${pipeline.nominalRoughness} ${unit}`;
};

/**
 * Get pipeline age in years
 * 
 * @param pipeline - Pipeline DTO
 * @returns Age in years (null if no installation date)
 */
export const getPipelineAge = (pipeline: PipelineDTO): number | null => {
  if (!pipeline?.installationDate) return null;
  
  const installDate = new Date(pipeline.installationDate);
  const now = new Date();
  const ageMs = now.getTime() - installDate.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  
  return Math.floor(ageYears);
};

/**
 * Check if pipeline is commissioned
 * 
 * @param pipeline - Pipeline DTO
 * @returns True if pipeline has commissioning date and it's in the past
 */
export const isPipelineCommissioned = (pipeline: PipelineDTO): boolean => {
  if (!pipeline?.commissioningDate) return false;
  
  const commissionDate = new Date(pipeline.commissioningDate);
  const now = new Date();
  
  return commissionDate <= now;
};

/**
 * Check if pipeline is decommissioned
 * 
 * @param pipeline - Pipeline DTO
 * @returns True if pipeline has decommissioning date and it's in the past
 */
export const isPipelineDecommissioned = (pipeline: PipelineDTO): boolean => {
  if (!pipeline?.decommissioningDate) return false;
  
  const decommissionDate = new Date(pipeline.decommissioningDate);
  const now = new Date();
  
  return decommissionDate <= now;
};

/**
 * Get pipeline lifecycle status
 * 
 * @param pipeline - Pipeline DTO
 * @returns Lifecycle status string
 */
export const getPipelineLifecycleStatus = (pipeline: PipelineDTO): string => {
  if (!pipeline) return 'Unknown';
  
  if (isPipelineDecommissioned(pipeline)) {
    return 'Decommissioned';
  }
  
  if (isPipelineCommissioned(pipeline)) {
    return 'Commissioned';
  }
  
  if (pipeline.installationDate) {
    const installDate = new Date(pipeline.installationDate);
    const now = new Date();
    if (installDate <= now) {
      return 'Installed (Awaiting Commissioning)';
    }
  }
  
  return 'Planned';
};

/**
 * Get pipeline vendor count (supports ManyToMany)
 * 
 * @param pipeline - Pipeline DTO
 * @returns Number of vendors associated with pipeline
 */
export const getPipelineVendorCount = (pipeline: PipelineDTO): number => {
  return pipeline?.vendorIds?.length || 0;
};

/**
 * Create pipeline summary object for display
 * 
 * @param pipeline - Pipeline DTO
 * @returns Summary object with formatted fields
 */
export const createPipelineSummary = (pipeline: PipelineDTO) => {
  return {
    displayName: formatPipelineDisplayName(pipeline),
    route: getPipelineRoute(pipeline),
    length: formatPipelineLength(pipeline),
    diameter: formatPipelineDiameter(pipeline),
    thickness: formatPipelineThickness(pipeline),
    roughness: formatPipelineRoughness(pipeline),
    capacity: formatPipelineCapacity(pipeline),
    pressureRange: formatPipelinePressureRange(pipeline),
    utilization: calculatePipelineUtilization(pipeline),
    statusColor: getPipelineStatusColor(pipeline),
    lifecycleStatus: getPipelineLifecycleStatus(pipeline),
    age: getPipelineAge(pipeline),
    isNearCapacity: isPipelineNearCapacity(pipeline),
    isCommissioned: isPipelineCommissioned(pipeline),
    isDecommissioned: isPipelineDecommissioned(pipeline),
    vendorCount: getPipelineVendorCount(pipeline),
    // Note: Coordinates now belong to PipelineSegment, not Pipeline
    // To check path, fetch segments and check segment.coordinateIds
  };
};

/**
 * Sort pipelines by code
 * 
 * @param pipelines - Array of pipeline DTOs
 * @param ascending - Sort order (default: true)
 * @returns Sorted array
 */
export const sortPipelinesByCode = (
  pipelines: PipelineDTO[],
  ascending: boolean = true
): PipelineDTO[] => {
  return [...pipelines].sort((a, b) => {
    const comparison = a.code.localeCompare(b.code);
    return ascending ? comparison : -comparison;
  });
};

/**
 * Sort pipelines by capacity utilization
 * 
 * @param pipelines - Array of pipeline DTOs
 * @param ascending - Sort order (default: false, highest utilization first)
 * @returns Sorted array
 */
export const sortPipelinesByUtilization = (
  pipelines: PipelineDTO[],
  ascending: boolean = false
): PipelineDTO[] => {
  return [...pipelines].sort((a, b) => {
    const utilizationA = calculatePipelineUtilization(a);
    const utilizationB = calculatePipelineUtilization(b);
    const comparison = utilizationA - utilizationB;
    return ascending ? comparison : -comparison;
  });
};

/**
 * Filter pipelines by owner
 * 
 * @param pipelines - Array of pipeline DTOs
 * @param ownerId - Owner structure ID
 * @returns Filtered array
 */
export const filterPipelinesByOwner = (
  pipelines: PipelineDTO[],
  ownerId: number
): PipelineDTO[] => {
  return pipelines.filter(p => p.ownerId === ownerId);
};

/**
 * Filter pipelines by manager
 * 
 * @param pipelines - Array of pipeline DTOs
 * @param managerId - Manager structure ID
 * @returns Filtered array
 */
export const filterPipelinesByManager = (
  pipelines: PipelineDTO[],
  managerId: number
): PipelineDTO[] => {
  return pipelines.filter(p => p.managerId === managerId);
};

/**
 * Filter pipelines by system
 * 
 * @param pipelines - Array of pipeline DTOs
 * @param systemId - Pipeline system ID
 * @returns Filtered array
 */
export const filterPipelinesBySystem = (
  pipelines: PipelineDTO[],
  systemId: number
): PipelineDTO[] => {
  return pipelines.filter(p => p.pipelineSystemId === systemId);
};

/**
 * Group pipelines by system
 * 
 * @param pipelines - Array of pipeline DTOs with populated systems
 * @returns Map of system name to pipelines
 */
export const groupPipelinesBySystem = (
  pipelines: PipelineDTO[]
): Map<string, PipelineDTO[]> => {
  const grouped = new Map<string, PipelineDTO[]>();
  
  pipelines.forEach(pipeline => {
    const systemName = pipeline.pipelineSystem?.name || 'Unknown System';
    const existing = grouped.get(systemName) || [];
    grouped.set(systemName, [...existing, pipeline]);
  });
  
  return grouped;
};

/**
 * Export pipelines to CSV format
 * 
 * @param pipelines - Array of pipeline DTOs
 * @returns CSV string
 */
export const exportPipelinesToCSV = (pipelines: PipelineDTO[]): string => {
  const headers = [
    'Code',
    'Name',
    'Length (km)',
    'Diameter',
    'Thickness',
    'Roughness',
    'Design Capacity',
    'Operational Capacity',
    'Utilization %',
    'Owner',
    'Manager',
    'System',
    'Status',
    'Vendors',
  ];
  
  const rows = pipelines.map(p => [
    p.code,
    p.name,
    p.length,
    p.nominalDiameter,        // Now string with unit
    p.nominalThickness,       // Now string with unit
    p.nominalRoughness,       // Now number
    p.designCapacity,
    p.operationalCapacity,
    calculatePipelineUtilization(p).toFixed(2),
    p.owner?.designationFr || '',
    p.manager?.designationFr || '',
    p.pipelineSystem?.name || '',
    p.operationalStatus?.designationFr || '',
    getPipelineVendorCount(p),
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};