/**
 * Organization Mapper - Backend to Frontend DTO conversion
 * 
 * Handles transformation between backend JSON responses and frontend TypeScript interfaces
 * for Organization module entities: Job, Structure, Person, Employee
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 */

import { JobDTO, StructureDTO, PersonDTO, EmployeeDTO } from '../dto';

export class OrganizationMapper {
  
  // ============== JOB ==============
  
  /**
   * Maps backend Job response to frontend JobDTO
   * @param data - Raw backend response data
   * @returns Mapped JobDTO
   */
  static mapToJobDTO(data: any): JobDTO {
    return {
      id: data.id,
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
      structureId: data.structureId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Maps frontend JobDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromJobDTO(data: Partial<JobDTO>): Record<string, any> {
    return {
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
      structureId: data.structureId,
    };
  }

  /**
   * Maps array of backend jobs to frontend DTOs
   * @param data - Array of backend job objects
   * @returns Array of JobDTO
   */
  static mapJobsArray(data: any[]): JobDTO[] {
    return data.map(item => this.mapToJobDTO(item));
  }

  // ============== STRUCTURE ==============

  /**
   * Maps backend Structure response to frontend StructureDTO
   * @param data - Raw backend response data
   * @returns Mapped StructureDTO
   */
  static mapToStructureDTO(data: any): StructureDTO {
    return {
      id: data.id,
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
      structureTypeId: data.structureTypeId,
      parentStructureId: data.parentStructureId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Maps frontend StructureDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromStructureDTO(data: Partial<StructureDTO>): Record<string, any> {
    return {
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
      structureTypeId: data.structureTypeId,
      parentStructureId: data.parentStructureId,
    };
  }

  /**
   * Maps array of backend structures to frontend DTOs
   * @param data - Array of backend structure objects
   * @returns Array of StructureDTO
   */
  static mapStructuresArray(data: any[]): StructureDTO[] {
    return data.map(item => this.mapToStructureDTO(item));
  }

  // ============== PERSON ==============

  /**
   * Maps backend Person response to frontend PersonDTO
   * @param data - Raw backend response data
   * @returns Mapped PersonDTO
   */
  static mapToPersonDTO(data: any): PersonDTO {
    return {
      id: data.id,
      lastNameAr: data.lastNameAr,
      firstNameAr: data.firstNameAr,
      lastNameLt: data.lastNameLt,
      firstNameLt: data.firstNameLt,
      birthDate: data.birthDate,
      birthPlaceAr: data.birthPlaceAr,
      birthPlaceLt: data.birthPlaceLt,
      addressAr: data.addressAr,
      addressLt: data.addressLt,
      birthStateId: data.birthStateId,
      addressStateId: data.addressStateId,
      pictureId: data.pictureId,
      countryId: data.countryId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Maps frontend PersonDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromPersonDTO(data: Partial<PersonDTO>): Record<string, any> {
    return {
      lastNameAr: data.lastNameAr,
      firstNameAr: data.firstNameAr,
      lastNameLt: data.lastNameLt,
      firstNameLt: data.firstNameLt,
      birthDate: data.birthDate,
      birthPlaceAr: data.birthPlaceAr,
      birthPlaceLt: data.birthPlaceLt,
      addressAr: data.addressAr,
      addressLt: data.addressLt,
      birthStateId: data.birthStateId,
      addressStateId: data.addressStateId,
      pictureId: data.pictureId,
      countryId: data.countryId,
    };
  }

  /**
   * Maps array of backend persons to frontend DTOs
   * @param data - Array of backend person objects
   * @returns Array of PersonDTO
   */
  static mapPersonsArray(data: any[]): PersonDTO[] {
    return data.map(item => this.mapToPersonDTO(item));
  }

  // ============== EMPLOYEE ==============

  /**
   * Maps backend Employee response to frontend EmployeeDTO
   * @param data - Raw backend response data
   * @returns Mapped EmployeeDTO
   */
  static mapToEmployeeDTO(data: any): EmployeeDTO {
    return {
      id: data.id,
      lastNameAr: data.lastNameAr,
      firstNameAr: data.firstNameAr,
      lastNameLt: data.lastNameLt,
      firstNameLt: data.firstNameLt,
      birthDate: data.birthDate,
      birthPlaceAr: data.birthPlaceAr,
      birthPlaceLt: data.birthPlaceLt,
      addressAr: data.addressAr,
      addressLt: data.addressLt,
      registrationNumber: data.registrationNumber,
      birthStateId: data.birthStateId,
      addressStateId: data.addressStateId,
      pictureId: data.pictureId,
      countryId: data.countryId,
      jobId: data.jobId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Maps frontend EmployeeDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromEmployeeDTO(data: Partial<EmployeeDTO>): Record<string, any> {
    return {
      lastNameAr: data.lastNameAr,
      firstNameAr: data.firstNameAr,
      lastNameLt: data.lastNameLt,
      firstNameLt: data.firstNameLt,
      birthDate: data.birthDate,
      birthPlaceAr: data.birthPlaceAr,
      birthPlaceLt: data.birthPlaceLt,
      addressAr: data.addressAr,
      addressLt: data.addressLt,
      registrationNumber: data.registrationNumber,
      birthStateId: data.birthStateId,
      addressStateId: data.addressStateId,
      pictureId: data.pictureId,
      countryId: data.countryId,
      jobId: data.jobId,
    };
  }

  /**
   * Maps array of backend employees to frontend DTOs
   * @param data - Array of backend employee objects
   * @returns Array of EmployeeDTO
   */
  static mapEmployeesArray(data: any[]): EmployeeDTO[] {
    return data.map(item => this.mapToEmployeeDTO(item));
  }
}
