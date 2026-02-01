/**
 * Authorization Service
 * 
 * Permission-based access control for frontend.
 * Checks user permissions fetched from backend.
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import type { UserProfile } from '@/types/auth';
import { AuthService } from './AuthService';

export class AuthorizationService {
  private static currentUser: UserProfile | null = null;

  /**
   * Initialize authorization by loading user profile
   */
  static async initialize(): Promise<void> {
    if (!AuthService.isAuthenticated()) {
      this.currentUser = null;
      return;
    }

    try {
      this.currentUser = await AuthService.getCurrentUser();
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.currentUser = null;
    }
  }

  /**
   * Get current user profile
   */
  static getUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Set current user (after login)
   */
  static setUser(user: UserProfile): void {
    this.currentUser = user;
  }

  /**
   * Clear user data (after logout)
   */
  static clear(): void {
    this.currentUser = null;
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  static hasAnyPermission(...permissions: string[]): boolean {
    if (!this.currentUser) return false;
    return permissions.some(p => this.currentUser!.permissions.includes(p));
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  static hasAllPermissions(...permissions: string[]): boolean {
    if (!this.currentUser) return false;
    return permissions.every(p => this.currentUser!.permissions.includes(p));
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(role);
  }

  /**
   * Check if user has ANY of the specified roles
   */
  static hasAnyRole(...roles: string[]): boolean {
    if (!this.currentUser) return false;
    return roles.some(r => this.currentUser!.roles.includes(r));
  }

  /**
   * Check if user belongs to specific organizational structure
   */
  static belongsToStructure(structureId: number): boolean {
    if (!this.currentUser || !this.currentUser.organizationalStructureId) {
      return false;
    }
    return this.currentUser.organizationalStructureId === structureId;
  }

  /**
   * Check if user can validate readings
   * (based on permission)
   */
  static canValidateReadings(): boolean {
    return this.hasPermission('READING:VALIDATE');
  }

  /**
   * Get user's organizational structure ID
   */
  static getOrganizationalStructureId(): number | null {
    return this.currentUser?.organizationalStructureId || null;
  }

  /**
   * Check permission with fallback to role
   */
  static can(permission: string, fallbackRole?: string): boolean {
    if (this.hasPermission(permission)) return true;
    if (fallbackRole && this.hasRole(fallbackRole)) return true;
    return false;
  }

  /**
   * Get all user permissions
   */
  static getPermissions(): string[] {
    return this.currentUser?.permissions || [];
  }

  /**
   * Get all user roles
   */
  static getRoles(): string[] {
    return this.currentUser?.roles || [];
  }
}
