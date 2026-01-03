/**
 * Structure Type Data Transfer Object
 * Represents the type/category of an organizational structure
 * 
 * Backend mapping: dz.sh.trc.hyflo.general.type.StructureTypeDTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

export interface StructureTypeDTO {
  /**
   * Unique identifier
   */
  id: number;

  /**
   * Type code (unique identifier)
   */
  code: string;

  /**
   * Designation in Arabic
   */
  designationAr?: string;

  /**
   * Designation in French
   */
  designationFr?: string;

  /**
   * Designation in English
   */
  designationEn?: string;

  /**
   * Short name/abbreviation
   */
  shortName?: string;

  /**
   * Description of the structure type
   */
  description?: string;

  /**
   * Display order for sorting
   */
  displayOrder?: number;

  /**
   * Whether this type is active
   */
  active?: boolean;

  /**
   * Audit: Creation timestamp
   */
  createdAt?: string;

  /**
   * Audit: Last update timestamp
   */
  updatedAt?: string;

  /**
   * Audit: Created by user
   */
  createdBy?: string;

  /**
   * Audit: Last updated by user
   */
  updatedBy?: string;
}

export default StructureTypeDTO;
