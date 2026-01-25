/**
 * Authentication Service
 * 
 * Handles user authentication, authorization, and session management.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

const BASE_URL = '/auth';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: EmployeeDTO;
}

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(`${BASE_URL}/login`, credentials);
    
    // Store tokens
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }
  
  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await axiosInstance.post(`${BASE_URL}/logout`);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }
  
  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<EmployeeDTO> {
    // Check cache first
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Invalid cache, fetch fresh
      }
    }
    
    const response = await axiosInstance.get<EmployeeDTO>(`${BASE_URL}/me`);
    
    // Cache the user
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    
    return response.data;
  }
  
  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axiosInstance.post<{ token: string }>(`${BASE_URL}/refresh`, {
      refreshToken,
    });
    
    localStorage.setItem('authToken', response.data.token);
    
    return response.data.token;
  }
  
  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    const cached = localStorage.getItem('currentUser');
    if (!cached) return false;
    
    try {
      const user: EmployeeDTO = JSON.parse(cached);
      // Assuming user has permissions array
      // @ts-ignore - Type may need to be extended
      return user.permissions?.includes(permission) || false;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    const cached = localStorage.getItem('currentUser');
    if (!cached) return false;
    
    try {
      const user: EmployeeDTO = JSON.parse(cached);
      // Assuming user has roles array
      // @ts-ignore - Type may need to be extended
      return user.roles?.includes(role) || false;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
  
  /**
   * Get authentication token
   */
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
