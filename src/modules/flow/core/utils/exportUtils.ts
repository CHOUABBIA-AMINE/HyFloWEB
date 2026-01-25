/**
 * Export Utilities - Flow Core Module
 * 
 * Helper functions for exporting flow data to various formats.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
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
    'Reading Date',
    'Pressure (bar)',
    'Temperature (°C)',
    'Flow Rate (m³/h)',
    'Volume (m³)',
    'Quality Flag',
    'Validation Status',
    'Notes',
  ];

  const rows = readings.map(reading => [
    reading.id || '',
    formatDateTime(reading.readingDate),
    reading.pressure !== null && reading.pressure !== undefined ? reading.pressure.toString() : '',
    reading.temperature !== null && reading.temperature !== undefined ? reading.temperature.toString() : '',
    reading.flowRate !== null && reading.flowRate !== undefined ? reading.flowRate.toString() : '',
    reading.volume !== null && reading.volume !== undefined ? reading.volume.toString() : '',
    reading.qualityFlag?.code || '',
    reading.validationStatus?.code || '',
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
    'Operation Date',
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
    operation.operationType?.code || '',
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
    'Triggered At',
    'Status',
    'Threshold',
    'Triggered Value',
    'Acknowledged At',
    'Resolved At',
    'Resolution Notes',
  ];

  const rows = alerts.map(alert => [
    alert.id || '',
    formatDateTime(alert.triggeredAt),
    alert.alertStatus?.code || '',
    alert.threshold?.id?.toString() || '',
    alert.triggeredValue !== null && alert.triggeredValue !== undefined ? alert.triggeredValue.toString() : '',
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
    'Status',
    'Severity',
    'Infrastructure',
    'Description',
    'Resolution',
  ];

  const rows = events.map(event => [
    event.id || '',
    event.eventType?.code || '',
    formatDateTime(event.startTime),
    formatDateTime(event.endTime),
    event.eventStatus?.code || '',
    event.severity?.code || '',
    event.infrastructure?.code || '',
    event.description || '',
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
