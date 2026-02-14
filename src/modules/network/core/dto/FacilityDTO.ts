/**
 * Facility Data Transfer Object
 * Represents infrastructure facilities (stations, terminals, etc.)
 * 
 * Backend entity: Facility
 * Fields match backend exactly for API communication
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026 11:53
 */

export interface FacilityDTO {
  // Identification
  id?: number;
  code: string;
  name: string;

  // Dates
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;

  // Capacity Specifications (m³/day)
  designCapacity?: number;
  operationalCapacity?: number;

  // Pressure Specifications (bar)
  designMaxServicePressure?: number;
  operationalMaxServicePressure?: number;
  designMinServicePressure?: number;
  operationalMinServicePressure?: number;

  // Volume
  internalVolume?: number; // m³

  // Operational Status
  operationalStatus?: {
    id: number;
    code: string;
    nameEn: string;
    nameFr: string;
    nameAr: string;
  };
  operationalStatusId?: number;

  // Organizational
  owner?: {
    id: number;
    code: string;
    designationFr: string;
  };
  ownerId?: number;

  manager?: {
    id: number;
    code: string;
    designationFr: string;
  };
  managerId?: number;

  // Vendors (Many-to-Many)
  vendorIds?: number[];

  // Location (coordinates)
  coordinateIds?: number[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}