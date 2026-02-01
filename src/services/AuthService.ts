/**
 * Authentication Service
 * 
 * Handles user authentication, authorization, and session management.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 02-01-2026 - Integrated with AuthorizationService and new auth types
 */

import axiosInstance from '@/shared/config/axios';
import type { LoginRequest, LoginResponse, UserProfile, TokenRefreshResponse } from '@/types/auth';
import { AuthorizationService } from './AuthorizationService';

const BASE_URL = '/auth';

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(`${BASE_URL}/login`, credentials);
    
    const data = response.data;
    
    // Store tokens
    localStorage.setItem('authToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Store user profile
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    // Initialize authorization with user permissions
    AuthorizationService.setUser(data.user);
    
    return data;
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
      AuthorizationService.clear();
    }
  }
  
  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(): Promise<UserProfile> {
    // Check cache first
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      try {
        const user = JSON.parse(cached);
        AuthorizationService.setUser(user);
        return user;
      } catch (e) {
        // Invalid cache, fetch fresh
      }
    }
    
    const response = await axiosInstance.get<UserProfile>(`${BASE_URL}/me`);
    
    // Cache the user
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    AuthorizationService.setUser(response.data);
    
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
    
    const response = await axiosInstance.post<TokenRefreshResponse>(`${BASE_URL}/refresh`, {
      refreshToken,
    });
    
    localStorage.setItem('authToken', response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data.accessToken;
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
  
  /**
   * Initialize authentication on app startup
   */
  static async initialize(): Promise<void> {
    if (this.isAuthenticated()) {
      try {
        await this.getCurrentUser();
      } catch (error) {
        // Token might be expired
        console.error('Failed to initialize auth:', error);
        await this.logout();
      }
    }
  }
}
