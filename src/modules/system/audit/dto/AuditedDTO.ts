/**
 * Audited DTO
 * Data Transfer Object for Audited entity
 * Contains audit information for tracking entity changes
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 */

export interface AuditedDTO {
  id: number;
  entityName: string;
  entityId: number;
  action: string; // CREATE, UPDATE, DELETE, READ
  oldValue?: string;
  newValue?: string;
  userId?: number;
  userName?: string;
  timestamp?: string;
  ipAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}
