/**
 * @Author: MEDJERAB Abir
 * @Name: ReadingsTimeSeriesDTO
 * @CreatedOn: 02-07-2026
 * @Type: Interface
 * @Layer: DTO
 * @Package: Flow / Intelligence
 * @Description: Time-series data for historical readings with statistical analysis
 */

import { TimeSeriesDataPointDTO } from './TimeSeriesDataPointDTO';
import { StatisticalSummaryDTO } from './StatisticalSummaryDTO';

export interface ReadingsTimeSeriesDTO {
  /**
   * Type of measurement
   * @example "PRESSURE"
   * Allowed values: "PRESSURE", "TEMPERATURE", "FLOW_RATE", "CONTAINED_VOLUME"
   */
  measurementType: string;
  
  /**
   * List of data points ordered chronologically
   */
  dataPoints: TimeSeriesDataPointDTO[];
  
  /**
   * Statistical summary of the dataset
   */
  statistics: StatisticalSummaryDTO;
}
