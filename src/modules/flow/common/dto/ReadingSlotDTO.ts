/**
 * Reading Slot DTO - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.dto.ReadingSlotDTO
 * Created: 01-28-2026 - Slot-based reading system implementation
 * 
 * @author CHOUABBIA Amine
 */

export interface ReadingSlotDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Slot configuration
  code: string; // @NotBlank, @Size(min=2, max=20) (e.g., "SLOT_1", "SLOT_2") (required)
  startTime: string; // @NotNull, LocalTime format: HH:mm:ss (e.g., "08:00:00") (required)
  endTime: string; // @NotNull, LocalTime format: HH:mm:ss (e.g., "10:00:00") (required)
  
  // Multilingual designations
  designationAr?: string; // Arabic designation, max 100 chars
  designationEn?: string; // English designation, max 100 chars
  designationFr: string; // @NotBlank, French designation (required), max 100 chars
  
  // UI display
  displayOrder?: number; // For UI sorting (1, 2, 3, etc.)
}

/**
 * Validates ReadingSlotDTO according to backend constraints
 * @param data - Partial reading slot data to validate
 * @returns Array of validation error messages
 */
export const validateReadingSlotDTO = (data: Partial<ReadingSlotDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code || data.code.trim() === '') {
    errors.push('Slot code is required');
  } else if (data.code.length < 2 || data.code.length > 20) {
    errors.push('Code must be between 2 and 20 characters');
  }
  
  // Start time validation
  if (!data.startTime) {
    errors.push('Start time is required');
  } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(data.startTime)) {
    errors.push('Start time must be in HH:mm:ss format');
  }
  
  // End time validation
  if (!data.endTime) {
    errors.push('End time is required');
  } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(data.endTime)) {
    errors.push('End time must be in HH:mm:ss format');
  }
  
  // Time range validation
  if (data.startTime && data.endTime) {
    const start = parseTime(data.startTime);
    const end = parseTime(data.endTime);
    
    if (start >= end && end !== 0) { // Allow 00:00:00 as end time for midnight
      errors.push('End time must be after start time');
    }
  }
  
  // French designation validation (required)
  if (!data.designationFr || data.designationFr.trim() === '') {
    errors.push('French designation is required');
  } else if (data.designationFr.length > 100) {
    errors.push('French designation must not exceed 100 characters');
  }
  
  // Arabic designation validation
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push('Arabic designation must not exceed 100 characters');
  }
  
  // English designation validation
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push('English designation must not exceed 100 characters');
  }
  
  return errors;
};

/**
 * Helper function to parse time string to minutes for comparison
 */
const parseTime = (timeStr: string): number => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 60 + minutes + seconds / 60;
};

/**
 * Format time range for display
 * @param slot - Reading slot
 * @returns Formatted time range (e.g., "08:00 - 10:00")
 */
export const formatTimeRange = (slot: ReadingSlotDTO): string => {
  const start = slot.startTime.substring(0, 5); // Remove seconds
  const end = slot.endTime.substring(0, 5);
  return `${start} - ${end}`;
};

/**
 * Get localized designation
 * @param slot - Reading slot
 * @param locale - Locale code ('ar', 'en', 'fr')
 * @returns Localized designation
 */
export const getLocalizedDesignation = (
  slot: ReadingSlotDTO, 
  locale: 'ar' | 'en' | 'fr' = 'en'
): string => {
  switch (locale) {
    case 'ar':
      return slot.designationAr || slot.designationFr;
    case 'en':
      return slot.designationEn || slot.designationFr;
    case 'fr':
    default:
      return slot.designationFr;
  }
};

/**
 * Reading slot constraints
 */
export const ReadingSlotConstraints = {
  code: {
    minLength: 2,
    maxLength: 20,
  },
  designationAr: {
    maxLength: 100,
  },
  designationEn: {
    maxLength: 100,
  },
  designationFr: {
    maxLength: 100,
    required: true,
  },
};
