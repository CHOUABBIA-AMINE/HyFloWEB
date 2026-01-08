/**
 * Pipeline Helpers
 * Utility functions for pipeline operations and formatting
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-08-2026 - Fixed operationalStatus property access
 */

import { PipelineDTO } from '../../core/dto';

/**
 * Get pipeline color based on type
 */
export const getPipelineColor = (type?: string): string => {
  if (!type) return '#666666';
  
  const colors: Record<string, string> = {
    GAS: '#FF6B6B',
    OIL: '#4ECDC4',
    WATER: '#45B7D1',
    MIXED: '#96CEB4',
  };
  
  return colors[type.toUpperCase()] || '#666666';
};

/**
 * Get pipeline status color
 */
export const getPipelineStatusColor = (status?: string): string => {
  if (!status) return '#999999';
  
  const colors: Record<string, string> = {
    OPERATIONAL: '#51CF66',
    MAINTENANCE: '#FFD93D',
    INACTIVE: '#FF6B6B',
    PLANNED: '#A8DADC',
  };
  
  return colors[status.toUpperCase()] || '#999999';
};

/**
 * Format pipeline length
 */
export const formatPipelineLength = (lengthKm?: number): string => {
  if (!lengthKm) return 'N/A';
  return `${lengthKm.toFixed(2)} km`;
};

/**
 * Format pipeline diameter
 */
export const formatPipelineDiameter = (diameterInch?: number): string => {
  if (!diameterInch) return 'N/A';
  return `${diameterInch}" (${(diameterInch * 25.4).toFixed(0)} mm)`;
};

/**
 * Format pipeline capacity
 */
export const formatPipelineCapacity = (capacity?: number, unit?: string): string => {
  if (!capacity) return 'N/A';
  return `${capacity.toLocaleString()} ${unit || 'units'}`;
};

/**
 * Get pipeline type label
 */
export const getPipelineTypeLabel = (type?: string): string => {
  if (!type) return 'Unknown';
  
  const labels: Record<string, string> = {
    GAS: 'Gas Pipeline',
    OIL: 'Oil Pipeline',
    WATER: 'Water Pipeline',
    MIXED: 'Mixed Pipeline',
  };
  
  return labels[type.toUpperCase()] || type;
};

/**
 * Get pipeline status label
 */
export const getPipelineStatusLabel = (status?: string): string => {
  if (!status) return 'Unknown';
  
  const labels: Record<string, string> = {
    OPERATIONAL: 'Operational',
    MAINTENANCE: 'Under Maintenance',
    INACTIVE: 'Inactive',
    PLANNED: 'Planned',
  };
  
  return labels[status.toUpperCase()] || status;
};

/**
 * Calculate pipeline age
 */
export const calculatePipelineAge = (commissionDate?: string): number | null => {
  if (!commissionDate) return null;
  
  const commission = new Date(commissionDate);
  const now = new Date();
  const ageMs = now.getTime() - commission.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  
  return Math.floor(ageYears);
};

/**
 * Format pipeline age
 */
export const formatPipelineAge = (commissionDate?: string): string => {
  const age = calculatePipelineAge(commissionDate);
  if (age === null) return 'N/A';
  return `${age} years`;
};

/**
 * Check if pipeline needs maintenance
 */
export const needsMaintenance = (lastMaintenanceDate?: string, maintenanceIntervalDays: number = 365): boolean => {
  if (!lastMaintenanceDate) return true;
  
  const lastMaintenance = new Date(lastMaintenanceDate);
  const now = new Date();
  const daysSinceMaintenance = (now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceMaintenance >= maintenanceIntervalDays;
};

/**
 * Get pipeline summary text
 */
export const getPipelineSummary = (pipeline: PipelineDTO): string => {
  const parts: string[] = [];
  
  if (pipeline.name) {
    parts.push(pipeline.name);
  }
  
  if (pipeline.pipelineType) {
    parts.push(getPipelineTypeLabel(pipeline.pipelineType.code));
  }
  
  if (pipeline.length) {
    parts.push(formatPipelineLength(pipeline.length));
  }
  
  if (pipeline.operationalStatus) {
    // Handle operationalStatus as a DTO with code property
    const statusCode = (pipeline.operationalStatus as any).code || '';
    parts.push(`Status: ${statusCode}`);
  }
  
  return parts.join(' • ');
};

/**
 * Get pipeline details for tooltip
 */
export const getPipelineTooltip = (pipeline: PipelineDTO): string => {
  const lines: string[] = [];
  
  if (pipeline.name) {
    lines.push(`<strong>${pipeline.name}</strong>`);
  }
  
  if (pipeline.code) {
    lines.push(`Code: ${pipeline.code}`);
  }
  
  if (pipeline.pipelineType) {
    lines.push(`Type: ${getPipelineTypeLabel(pipeline.pipelineType.code)}`);
  }
  
  if (pipeline.length) {
    lines.push(`Length: ${formatPipelineLength(pipeline.length)}`);
  }
  
  if (pipeline.diameter) {
    lines.push(`Diameter: ${formatPipelineDiameter(pipeline.diameter)}`);
  }
  
  if (pipeline.operationalStatus) {
    const statusCode = (pipeline.operationalStatus as any).code || 'Unknown';
    lines.push(`Status: ${getPipelineStatusLabel(statusCode)}`);
  }
  
  return lines.join('<br>');
};
