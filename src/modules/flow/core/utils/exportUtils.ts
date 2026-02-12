/**
 * Export Utilities - Flow Core Module
 * 
 * Helper functions for exporting flow data to various formats.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 01-30-2026 - Fixed FlowOperationDTO property access
 */

import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { FlowOperationDTO } from '../dto/FlowOperationDTO';
import type { FlowAlertDTO } from '../dto/FlowAlertDTO';
import type { FlowEventDTO } from '../dto/FlowEventDTO';
import { formatDate, formatDateTime, formatPressure, formatTemperature, formatFlowRate, formatVolume } from './formattingUtils';

/**
 * Convert FlowReadingDTO array to CSV format
 */
export function exportReadingsToCSV(readings: FlowReadingDTO[]): string {
  const headers = [
    'ID',
    'Recorded At',
    'Pressure (bar)',
    'Temperature (°C)',
    'Flow Rate (m³/h)',
    'Contained Volume (m³)',
    'Validation Status',
    'Pipeline',
    'Notes',
  ];

  const rows = readings.map(reading => [
    reading.id || '',
    formatDateTime(reading.recordedAt),
    reading.pressure !== null && reading.pressure !== undefined ? reading.pressure.toString() : '',
    reading.temperature !== null && reading.temperature !== undefined ? reading.temperature.toString() : '',
    reading.flowRate !== null && reading.flowRate !== undefined ? reading.flowRate.toString() : '',
    reading.containedVolume !== null && reading.containedVolume !== undefined ? reading.containedVolume.toString() : '',
    reading.validationStatus?.code || '',
    reading.pipeline?.code || '',
    reading.notes || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Convert FlowOperationDTO array to CSV format
 */
export function exportOperationsToCSV(operations: FlowOperationDTO[]): string {
  const headers = [
    'ID',
    'Date',
    'Operation Type',
    'Product',
    'Infrastructure',
    'Volume (m³)',
    'Validation Status',
    'Notes',
  ];

  const rows = operations.map(operation => [
    operation.id || '',
    formatDate(operation.operationDate),
    operation.type?.code || '',
    operation.product?.code || '',
    operation.infrastructure?.code || '',
    operation.volume !== null && operation.volume !== undefined ? operation.volume.toString() : '',
    operation.validationStatus?.code || '',
    operation.notes || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Convert FlowAlertDTO array to CSV format
 */
export function exportAlertsToCSV(alerts: FlowAlertDTO[]): string {
  const headers = [
    'ID',
    'Alert Timestamp',
    'Status',
    'Threshold ID',
    'Actual Value',
    'Threshold Value',
    'Message',
    'Acknowledged At',
    'Resolved At',
    'Resolution Notes',
  ];

  const rows = alerts.map(alert => [
    alert.id || '',
    formatDateTime(alert.alertTimestamp),
    alert.threshold?.id?.toString() || '',
    alert.actualValue !== null && alert.actualValue !== undefined ? alert.actualValue.toString() : '',
    alert.thresholdValue !== null && alert.thresholdValue !== undefined ? alert.thresholdValue.toString() : '',
    alert.message || '',
    formatDateTime(alert.acknowledgedAt),
    formatDateTime(alert.resolvedAt),
    alert.resolutionNotes || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Convert FlowEventDTO array to CSV format
 */
export function exportEventsToCSV(events: FlowEventDTO[]): string {
  const headers = [
    'ID',
    'Event Type',
    'Start Time',
    'End Time',
    'Title',
    'Status',
    'Severity',
    'Infrastructure',
    'Description',
    'Impact',
    'Resolution',
  ];

  const rows = events.map(event => [
    event.id || '',
    event.type?.code || '',
    formatDateTime(event.startTime),
    formatDateTime(event.endTime),
    event.title || '',
    event.status?.code || '',
    event.severity?.code || '',
    event.infrastructure?.code || '',
    event.description || '',
    event.impact || '',
    event.resolution || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export readings to CSV file
 */
export function downloadReadingsCSV(readings: FlowReadingDTO[], filename: string = 'flow_readings.csv'): void {
  const csv = exportReadingsToCSV(readings);
  downloadCSV(csv, filename);
}

/**
 * Export operations to CSV file
 */
export function downloadOperationsCSV(operations: FlowOperationDTO[], filename: string = 'flow_operations.csv'): void {
  const csv = exportOperationsToCSV(operations);
  downloadCSV(csv, filename);
}

/**
 * Export alerts to CSV file
 */
export function downloadAlertsCSV(alerts: FlowAlertDTO[], filename: string = 'flow_alerts.csv'): void {
  const csv = exportAlertsToCSV(alerts);
  downloadCSV(csv, filename);
}

/**
 * Export events to CSV file
 */
export function downloadEventsCSV(events: FlowEventDTO[], filename: string = 'flow_events.csv'): void {
  const csv = exportEventsToCSV(events);
  downloadCSV(csv, filename);
}
