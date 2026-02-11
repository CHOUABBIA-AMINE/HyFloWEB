/**
 * Overdue Reading DTO - Flow Intelligence Module
 * 
 * Represents a reading past its validation deadline.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.monitoring.OverdueReadingDTO
 * 
 * Backend endpoint: GET /flow/monitoring/overdue-readings
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/monitoring
 */

export interface OverdueReadingDTO {
  /**
   * Reading ID
   * Backend: Long
   */
  readingId: number;
  
  /**
   * Reading date (YYYY-MM-DD)
   * Backend: LocalDate
   */
  readingDate: string;
  
  /**
   * Slot ID (1-12)
   * Backend: Long
   */
  slotId: number;
  
  /**
   * Pipeline ID
   * Backend: Long
   */
  pipelineId: number;
  
  /**
   * Pipeline name
   * Backend: String
   * @example "Main Supply Line B"
   */
  pipelineName: string;
  
  /**
   * Pipeline code
   * Backend: String
   * @example "PIP-002"
   */
  pipelineCode?: string;
  
  /**
   * Submitted timestamp
   * Backend: LocalDateTime → ISO 8601
   * @example "2026-02-07T10:15:00"
   */
  submittedAt: string;
  
  /**
   * Validation deadline timestamp
   * Backend: submittedAt + configurable delay (e.g., 24 hours)
   * @example "2026-02-08T10:15:00"
   */
  deadlineAt: string;
  
  /**
   * Overdue duration (minutes)
   * Calculated by backend: (NOW - deadlineAt) in minutes
   * Backend: Integer
   * @example 120 (2 hours overdue)
   */
  overdueDurationMinutes: number;
  
  /**
   * Severity based on overdue duration
   * Backend calculates:
   * - CRITICAL: > 48 hours
   * - HIGH: 24-48 hours
   * - MEDIUM: < 24 hours
   */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  
  /**
   * Operator name
   * Backend: String (from Employee)
   * @example "BENALI Fatima"
   */
  operatorName: string;
}

/**
 * Get severity color for UI display
 */
export const getSeverityColor = (
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
): 'error' | 'warning' | 'info' => {
  switch (severity) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
  }
};

/**
 * Get severity label
 */
export const getSeverityLabel = (
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM',
  lang: 'en' | 'fr' | 'ar' = 'en'
): string => {
  const labels = {
    CRITICAL: {
      en: 'Critical',
      fr: 'Critique',
      ar: 'حرج',
    },
    HIGH: {
      en: 'High',
      fr: 'Élevé',
      ar: 'عالي',
    },
    MEDIUM: {
      en: 'Medium',
      fr: 'Moyen',
      ar: 'متوسط',
    },
  };
  
  return labels[severity][lang];
};

/**
 * Format overdue duration for display
 */
export const formatOverdueDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};
