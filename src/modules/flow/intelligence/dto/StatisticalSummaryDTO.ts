/**
 * @Author: MEDJERAB Abir
 * @Name: StatisticalSummaryDTO
 * @CreatedOn: 02-07-2026
 * @Type: Interface
 * @Layer: DTO
 * @Package: Flow / Intelligence
 * @Description: Statistical analysis of time-series data
 */

export interface StatisticalSummaryDTO {
  /**
   * Minimum value in dataset
   * @example 68.5
   */
  min: number;
  
  /**
   * Maximum value in dataset
   * @example 82.3
   */
  max: number;
  
  /**
   * Average (mean) value
   * @example 75.4
   */
  avg: number;
  
  /**
   * Median value
   * @example 75.0
   */
  median: number;
  
  /**
   * Standard deviation
   * @example 3.2
   */
  stdDev: number;
}
