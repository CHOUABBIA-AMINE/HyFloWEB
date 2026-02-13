/**
 * @Author: MEDJERAB Abir
 * @Name: PipelineOverviewDTO
 * @CreatedOn: 02-07-2026
 * @UpdatedOn: 02-10-2026 - Phase 1: Use network PipelineDTO instead of PipelineAssetDTO
 * @Type: Interface
 * @Layer: DTO
 * @Package: Flow / Intelligence
 * @Description: Complete operational dashboard for a pipeline
 * 
 * Comprehensive overview combining asset information, current readings, and operational KPIs.
 * 
 * This DTO aggregates:
 * - Pipeline asset specifications (from network module via PipelineDTO)
 * - Real-time operational measurements
 * - Daily slot coverage statistics
 * - Weekly completion trends
 * - Alert summaries
 * 
 * Used by dashboard/overview endpoints to provide complete pipeline operational status.
 */

import { PipelineDTO } from '../../../network/core/dto';

export interface PipelineOverviewDTO {
  // ========== ASSET INFORMATION ==========
  
  /**
   * Pipeline asset specifications and configuration.
   * 
   * REFACTORED: Now uses PipelineDTO from network module instead of
   * the redundant PipelineAssetDTO that was previously defined in
   * intelligence module.
   * 
   * PipelineDTO provides:
   * - Basic identification (id, code, name)
   * - Physical characteristics (length, diameter, thickness)
   * - Pressure specifications (design/operational min/max)
   * - Capacity specifications (design/operational)
   * - Network connections (departure/arrival terminals)
   * - Material information (construction material, coatings)
   * - Organization references (owner, manager, pipeline system)
   */
  asset: PipelineDTO;
  
  // ========== OPERATIONAL STATUS ==========
  
  /**
   * Current operational status
   * @example "ACTIVE"
   * Allowed values: "ACTIVE", "STANDBY", "MAINTENANCE", "SHUTDOWN"
   */
  operationalStatus: string;
  
  // ========== CURRENT MEASUREMENTS (Latest Reading) ==========
  
  /**
   * Current pressure reading in bar
   * @example 75.8
   */
  currentPressure: number | null;
  
  /**
   * Current temperature reading in °C
   * @example 22.5
   */
  currentTemperature: number | null;
  
  /**
   * Current flow rate in m³/h
   * @example 1875.20
   */
  currentFlowRate: number | null;
  
  /**
   * Timestamp of last recorded reading
   * ISO 8601 format
   * @example "2026-02-07T15:45:00"
   */
  lastReadingTime: string | null;
  
  // ========== SLOT COVERAGE KPIs (Today) ==========
  
  /**
   * Total number of slots in a day (typically 12 for 2-hour intervals)
   * @example 12
   */
  totalSlotsToday: number;
  
  /**
   * Number of slots with recordings
   * @example 9
   */
  recordedSlots: number;
  
  /**
   * Number of approved slots
   * @example 7
   */
  approvedSlots: number;
  
  /**
   * Number of slots pending validation
   * @example 2
   */
  pendingValidationSlots: number;
  
  /**
   * Number of overdue slots (past deadline without approval)
   * @example 1
   */
  overdueSlots: number;
  
  /**
   * Completion rate (approved/total) as percentage
   * @example 58.33
   */
  completionRate: number;
  
  /**
   * Average weekly completion rate (last 7 days) as percentage
   * @example 87.50
   */
  weeklyCompletionRate: number;
  
  // ========== ALERT SUMMARY ==========
  
  /**
   * Number of active alerts for this pipeline
   * @example 0
   */
  activeAlertsCount: number;
  
  // ========== VOLUME STATISTICS ==========
  
  /**
   * Total volume transported today in m³
   * @example 45000.75
   */
  volumeTransportedToday: number | null;
  
  /**
   * Total volume transported this week in m³
   * @example 315000.50
   */
  volumeTransportedWeek: number | null;
}
