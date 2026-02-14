/**
 * Key Metrics DTO
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Key operational metrics from latest pipeline reading.
 *              Replaces Record<string, number> for type safety.
 *              
 * @source FlowReading (latest reading)
 * @backend dz.sh.trc.hyflo.flow.intelligence.dto.KeyMetricsDTO
 */

export interface KeyMetricsDTO {
  /**
   * Current pressure reading in bar
   * @example 45.2
   */
  pressure?: number;

  /**
   * Current temperature reading in Celsius
   * @example 42.0
   */
  temperature?: number;

  /**
   * Current flow rate in cubic meters per hour (m³/h)
   * @example 1250.5
   */
  flowRate?: number;

  /**
   * Current contained volume in cubic meters (m³)
   * @example 520.8
   */
  containedVolume?: number;
}

/**
 * Type guard to check if KeyMetricsDTO has any metric
 */
export function hasAnyMetric(metrics?: KeyMetricsDTO): boolean {
  if (!metrics) return false;
  return (
    metrics.pressure !== undefined ||
    metrics.temperature !== undefined ||
    metrics.flowRate !== undefined ||
    metrics.containedVolume !== undefined
  );
}

/**
 * Type guard to check if KeyMetricsDTO has all metrics
 */
export function hasAllMetrics(metrics?: KeyMetricsDTO): boolean {
  if (!metrics) return false;
  return (
    metrics.pressure !== undefined &&
    metrics.temperature !== undefined &&
    metrics.flowRate !== undefined &&
    metrics.containedVolume !== undefined
  );
}
