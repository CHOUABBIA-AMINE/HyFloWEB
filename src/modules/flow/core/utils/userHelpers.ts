/**
 * User Helpers
 * 
 * Centralized helpers for accessing user employee/job/structure information.
 * Ensures consistent access patterns across the application.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/utils
 */

import { UserProfile } from '@/types/auth';

/**
 * User structure information
 */
export interface UserStructureInfo {
  structureId: number | null;
  structureName: string | null;
  structureCode: string | null;
  source: 'employee.job.structure' | 'organizational' | 'none';
}

/**
 * Get user's structure information
 * Tries to get from employee.job.structure first (most accurate)
 * Falls back to organizational structure fields if available
 * 
 * @param user - User profile
 * @returns Structure information with source indicator
 */
export const getUserStructure = (user: UserProfile | null): UserStructureInfo => {
  if (!user) {
    return {
      structureId: null,
      structureName: null,
      structureCode: null,
      source: 'none',
    };
  }

  // PREFERRED: Get from employee.job.structure (most accurate, reflects current assignment)
  if (user.employee?.job?.structure) {
    const structure = user.employee.job.structure;
    console.log('✅ Using structure from employee.job.structure:', structure);
    return {
      structureId: structure.id || null,
      structureName: structure.designationFr || structure.code,
      structureCode: structure.code,
      source: 'employee.job.structure',
    };
  }

  // FALLBACK: Get from organizational structure fields
  if (user.organizationalStructureId) {
    console.warn('⚠️ Using fallback organizational structure fields (job.structure not populated)');
    return {
      structureId: user.organizationalStructureId,
      structureName: user.organizationalStructureName,
      structureCode: user.organizationalStructureCode,
      source: 'organizational',
    };
  }

  // No structure found
  console.error('❌ No structure information available for user');
  return {
    structureId: null,
    structureName: null,
    structureCode: null,
    source: 'none',
  };
};

/**
 * Get user's employee ID
 * 
 * @param user - User profile
 * @returns Employee ID or null
 */
export const getUserEmployeeId = (user: UserProfile | null): number | null => {
  return user?.employee?.id || null;
};

/**
 * Get user's job information
 * 
 * @param user - User profile
 * @returns Job DTO or null
 */
export const getUserJob = (user: UserProfile | null) => {
  return user?.employee?.job || null;
};

/**
 * Check if user has complete employee profile with job and structure
 * 
 * @param user - User profile
 * @returns True if user has complete profile
 */
export const hasCompleteEmployeeProfile = (user: UserProfile | null): boolean => {
  if (!user?.employee) {
    console.warn('⚠️ User has no employee profile');
    return false;
  }

  if (!user.employee.job) {
    console.warn('⚠️ Employee has no job assignment');
    return false;
  }

  if (!user.employee.job.structure) {
    console.warn('⚠️ Job has no structure assigned');
    return false;
  }

  console.log('✅ User has complete employee profile');
  return true;
};

/**
 * Log user structure information for debugging
 * 
 * @param user - User profile
 */
export const debugUserStructure = (user: UserProfile | null): void => {
  console.group('👤 User Structure Debug');
  console.log('User ID:', user?.id);
  console.log('Username:', user?.username);
  console.log('Has Employee:', !!user?.employee);
  
  if (user?.employee) {
    console.log('Employee ID:', user.employee.id);
    console.log('Has Job:', !!user.employee.job);
    
    if (user.employee.job) {
      console.log('Job ID:', user.employee.job.id);
      console.log('Job Code:', user.employee.job.code);
      console.log('Has Structure:', !!user.employee.job.structure);
      
      if (user.employee.job.structure) {
        console.log('Structure:', user.employee.job.structure);
      }
    }
  }
  
  console.log('Organizational Structure ID:', user?.organizationalStructureId);
  console.log('Organizational Structure Name:', user?.organizationalStructureName);
  console.log('Organizational Structure Code:', user?.organizationalStructureCode);
  
  const structureInfo = getUserStructure(user);
  console.log('Final Structure Info:', structureInfo);
  
  console.groupEnd();
};
