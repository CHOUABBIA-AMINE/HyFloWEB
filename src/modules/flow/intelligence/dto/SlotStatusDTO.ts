/**
 * @Author: MEDJERAB Abir
 * @Name: SlotStatusDTO
 * @CreatedOn: 02-07-2026
 * @Type: Interface
 * @Layer: DTO
 * @Package: Flow / Intelligence
 * @Description: Status and data for a specific 2-hour reading slot
 */

export interface SlotStatusDTO {
  // ========== SLOT METADATA ==========
  
  /**
   * Slot identifier
   * @example 1
   */
  slotId: number;
  
  /**
   * Slot code
   * @example "SLOT_02"
   */
  slotCode: string;
  
  /**
   * Slot start time (HH:mm:ss format)
   * @example "02:00:00"
   */
  startTime: string;
  
  /**
   * Slot end time (HH:mm:ss format)
   * @example "04:00:00"
   */
  endTime: string;
  
  /**
   * Slot designation in French
   * @example "02h00 - 04h00"
   */
  designation: string;
  
  /**
   * Display order (1-12)
   * @example 2
   */
  displayOrder: number;
  
  // ========== RECORDING STATUS ==========
  
  /**
   * Reading record ID if exists
   * @example 1523
   */
  readingId: number | null;
  
  /**
   * Validation status
   * @example "APPROVED"
   * Allowed values: "NOT_RECORDED", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"
   */
  validationStatus: string;
  
  /**
   * Timestamp when reading was recorded
   * ISO 8601 format
   * @example "2026-02-07T03:45:00"
   */
  recordedAt: string | null;
  
  /**
   * Timestamp when reading was validated
   * ISO 8601 format
   * @example "2026-02-07T09:15:00"
   */
  validatedAt: string | null;
  
  // ========== OPERATOR INFORMATION ==========
  
  /**
   * Name of operator who recorded reading
   * @example "Mohammed BENALI"
   */
  recorderName: string | null;
  
  /**
   * Name of validator who approved reading
   * @example "Fatima KHELIF"
   */
  validatorName: string | null;
  
  // ========== MEASUREMENT DATA ==========
  
  /**
   * Pressure reading in bar
   * @example 75.5
   */
  pressure: number | null;
  
  /**
   * Temperature reading in °C
   * @example 22.3
   */
  temperature: number | null;
  
  /**
   * Flow rate in m³/h
   * @example 1850.75
   */
  flowRate: number | null;
  
  /**
   * Contained volume in m³
   * @example 3700.50
   */
  containedVolume: number | null;
  
  // ========== STATUS FLAGS ==========
  
  /**
   * Indicates if slot is past deadline without approved reading
   * @example false
   */
  isOverdue: boolean;
  
  /**
   * Indicates if reading has warnings or notes
   * @example false
   */
  hasWarnings: boolean;
  
  /**
   * Optional notes or observations
   * @example "Slight pressure fluctuation observed"
   */
  notes: string | null;
}
