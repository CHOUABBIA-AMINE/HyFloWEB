/**
 * Pending Validation DTO - Flow Intelligence Module
 * 
 * Represents a reading awaiting validation with queue information.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.monitoring.PendingValidationDTO
 * 
 * Backend endpoint: GET /flow/monitoring/pending-validations
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/monitoring
 */

import type { FlowReadingDTO } from '../../../core/dto/FlowReadingDTO';

export interface PendingValidationDTO {
  /**
   * Flow reading ID
   * Backend: Long
   */
  readingId: number;
  
  /**
   * Pipeline code
   * Backend: String
   * @example "PIP-001"
   */
  pipelineCode: string;
  
  /**
   * Pipeline name
   * Backend: String
   * @example "Main Supply Line"
   */
  pipelineName: string;
  
  /**
   * Reading slot designation
   * Backend: String (from ReadingSlot)
   * @example "Morning Shift" or "Slot 1 (00:00-02:00)"
   */
  readingSlot: string;
  
  /**
   * Submission timestamp
   * Backend: LocalDateTime → ISO 8601
   * @example "2026-02-07T08:30:00"
   */
  submittedAt: string;
  
  /**
   * Hours waiting for validation
   * Calculated by backend: (NOW - submittedAt) in hours
   * Backend: Double
   * @example 2.5
   */
  waitingHours: number;
  
  /**
   * Validation priority (backend calculated)
   * Based on waiting time:
   * - HIGH: > 4 hours
   * - MEDIUM: 2-4 hours
   * - LOW: < 2 hours
   */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  
  /**
   * Employee who recorded the reading
   * Backend: String (from Employee)
   * @example "AHMED Mohamed"
   */
  recordedBy: string;
  
  /**
   * Flow measurement value
   * Backend: Double
   * @example 125.50
   */
  flowValue: number;
  
  /**
   * Full reading details (optional)
   * Populated when expanding row in UI
   */
  reading?: FlowReadingDTO;
}

/**
 * Get priority color for UI display
 */
export const getPriorityColor = (
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
): 'error' | 'warning' | 'success' => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'success';
  }
};

/**
 * Get priority label
 */
export const getPriorityLabel = (
  priority: 'HIGH' | 'MEDIUM' | 'LOW',
  lang: 'en' | 'fr' | 'ar' = 'en'
): string => {
  const labels = {
    HIGH: {
      en: 'High Priority',
      fr: 'Priorité Haute',
      ar: 'أولوية عالية',
    },
    MEDIUM: {
      en: 'Medium Priority',
      fr: 'Priorité Moyenne',
      ar: 'أولوية متوسطة',
    },
    LOW: {
      en: 'Low Priority',
      fr: 'Priorité Basse',
      ar: 'أولوية منخفضة',
    },
  };
  
  return labels[priority][lang];
};
