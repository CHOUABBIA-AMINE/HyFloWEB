/**
 * @Author: MEDJERAB Abir
 * @Name: FlowEventDTO
 * @CreatedOn: 01-23-2026
 * @UpdatedOn: 02-13-2026 - Complete backend alignment audit
 * @Type: Interface
 * @Layer: DTO
 * @Package: Flow / Core
 * @Description: Flow event DTO for operational events and incidents
 * 
 * CRITICAL FIX: Complete realignment with backend fields
 * - Replaced 'startTime' with 'eventTimestamp' (PRIMARY field)
 * - Added missing 'startTime' and 'endTime' fields
 * - Replaced 'impact'/'resolution' with 'actionTaken'
 * - Removed 'typeId' (not in backend)
 * - Added 'impactOnFlow' boolean flag
 * - Added 'relatedReadingId' and 'relatedAlertId'
 * - Updated all field names, types, and constraints to match backend exactly
 */

import { EventStatusDTO } from '../../common/dto/EventStatusDTO';
import { SeverityDTO } from '../../common/dto/SeverityDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';
import { FlowReadingDTO } from './FlowReadingDTO';
import { FlowAlertDTO } from './FlowAlertDTO';

export interface FlowEventDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // ========== EVENT CORE FIELDS ==========
  
  /**
   * Timestamp when event occurred
   * ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
   * @example "2026-01-22T03:15:00"
   * @required
   */
  eventTimestamp: string;

  /**
   * Brief event title (3-100 characters)
   * @example "Emergency Shutdown - Pipeline P-101"
   * @required
   */
  title: string;

  /**
   * Detailed event description (max 2000 characters)
   * @example "Automatic shutdown triggered"
   */
  description?: string;

  /**
   * Event start timestamp
   * ISO 8601 format
   * @example "2026-01-22T03:15:00"
   */
  startTime?: string;

  /**
   * Event end timestamp
   * ISO 8601 format
   * @example "2026-01-22T05:30:00"
   */
  endTime?: string;

  /**
   * Corrective action description (max 2000 characters)
   * @example "Isolated segment, deployed repair crew"
   */
  actionTaken?: string;

  /**
   * Did this event impact flow operations
   * @example true
   * @required
   */
  impactOnFlow: boolean;

  // ========== FOREIGN KEY IDS ==========
  
  /**
   * Severity ID
   */
  severityId?: number;

  /**
   * Infrastructure ID
   * @required
   */
  infrastructureId: number;

  /**
   * Reported by employee ID
   * @required
   */
  reportedById: number;

  /**
   * Related flow reading ID
   */
  relatedReadingId?: number;

  /**
   * Related alert ID
   */
  relatedAlertId?: number;

  /**
   * Event status ID
   */
  statusId?: number;

  // ========== NESTED DTOs ==========
  
  /**
   * Severity details
   */
  severity?: SeverityDTO;

  /**
   * Infrastructure details
   */
  infrastructure?: InfrastructureDTO;

  /**
   * Reporter employee details
   */
  reportedBy?: EmployeeDTO;

  /**
   * Related flow reading details
   */
  relatedReading?: FlowReadingDTO;

  /**
   * Related alert details
   */
  relatedAlert?: FlowAlertDTO;

  /**
   * Event status details
   */
  status?: EventStatusDTO;
}
