/**
 * @Author: MEDJERAB Abir
 * @Name: TimeSeriesDataPointDTO
 * @CreatedOn: 02-07-2026
 * @Type: Interface
 * @Layer: DTO
 * @Package: Flow / Intelligence
 * @Description: Single data point with timestamp and value
 */

export interface TimeSeriesDataPointDTO {
  /**
   * Timestamp of the reading
   * ISO 8601 format
   * @example "2026-02-07T08:30:00"
   */
  timestamp: string;
  
  /**
   * Measured value
   * @example 75.5
   */
  value: number;
  
  /**
   * Reading slot code
   * @example "SLOT_02"
   */
  slotCode: string;
  
  /**
   * Validation status
   * @example "APPROVED"
   * Allowed values: "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"
   */
  validationStatus: string;
  
  /**
   * Indicates if this reading has warnings or notes
   * @example false
   */
  hasWarning: boolean;
}
