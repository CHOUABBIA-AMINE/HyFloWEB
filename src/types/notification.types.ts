/**
 * Notification Type Definitions
 * Aligned with HyFloAPI backend NotificationDTO structure
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

/**
 * Notification type structure from backend
 */
export interface NotificationTypeDTO {
  code: string;            // e.g. "READING_SUBMITTED", "OPERATION_CREATED"
  label?: string;          // Human-readable label
  severity?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

/**
 * Main notification DTO matching backend structure
 * Backend: dz.sh.trc.hyflo.system.notification.core.dto.NotificationDTO
 */
export interface NotificationDTO {
  id?: string | number;    // GenericDTO ID from backend
  title: string;           // @NotBlank, @Size(max = 200)
  message: string;         // @NotBlank, @Size(max = 1000)
  type: NotificationTypeDTO;
  recipientUsername?: string;
  relatedEntityId?: string;     // Reference to entity (e.g. Reading ID)
  relatedEntityType?: string;   // Entity type (e.g. "READING", "OPERATION")
  isRead?: boolean;
  createdAt?: string;      // ISO-8601, backend uses LocalDateTime
  readAt?: string;         // ISO-8601
}

/**
 * WebSocket connection status
 */
export interface WebSocketStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}
