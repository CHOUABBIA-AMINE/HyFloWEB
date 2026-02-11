/**
 * Monitoring Period DTO - Flow Intelligence Module
 * 
 * Defines monitoring time periods for analytics queries.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.analytics.MonitoringPeriodDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/analytics
 */

export interface MonitoringPeriodDTO {
  /**
   * Period start date (YYYY-MM-DD)
   * Backend: LocalDate
   */
  startDate: string;
  
  /**
   * Period end date (YYYY-MM-DD)
   * Backend: LocalDate
   */
  endDate: string;
  
  /**
   * Period type identifier
   * @example "CURRENT_MONTH", "LAST_7_DAYS", "CUSTOM"
   */
  periodType?: string;
  
  /**
   * Human-readable period label
   * Backend: String
   * @example "February 2026", "Last 7 Days"
   */
  label?: string;
}

/**
 * Predefined monitoring periods
 */
export const MonitoringPeriods = {
  /**
   * Get today's period
   */
  today: (): MonitoringPeriodDTO => {
    const today = new Date().toISOString().split('T')[0];
    return {
      startDate: today,
      endDate: today,
      periodType: 'TODAY',
      label: 'Today',
    };
  },
  
  /**
   * Get last 7 days period
   */
  last7Days: (): MonitoringPeriodDTO => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      periodType: 'LAST_7_DAYS',
      label: 'Last 7 Days',
    };
  },
  
  /**
   * Get last 30 days period
   */
  last30Days: (): MonitoringPeriodDTO => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      periodType: 'LAST_30_DAYS',
      label: 'Last 30 Days',
    };
  },
  
  /**
   * Get current month period
   */
  currentMonth: (): MonitoringPeriodDTO => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      periodType: 'CURRENT_MONTH',
      label: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    };
  },
} as const;
