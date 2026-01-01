/**
 * Auth Service
 * Matches: dz.mdn.iaas.system.auth.service.AuthService.java
 * Communicates with: AuthController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-27-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { LoginRequestDTO, LoginResponseDTO } from '../dto';
import { userService } from '../../security/services';
import { UserDTO } from '../../security/dto';

interface LoginResult {
  token: string;
  refreshToken?: string;
  user: UserDTO;
}

class AuthService {
  private readonly BASE_URL = '/auth';

  /**
   * Login user with username and password
   * After authentication, fetches user details from /system/security/user/username/{username}
   */
  async login(credentials: LoginRequestDTO): Promise<LoginResult> {
    // Step 1: Authenticate and get token
    const authResponse = await axiosInstance.post<LoginResponseDTO>(
      `${this.BASE_URL}/login`,
      credentials
    );

    // Extract token (check multiple possible field names from backend)
    const responseData = authResponse.data as any;
    const token = responseData.token || responseData.accessToken || responseData.access_token || responseData.jwt;
    const refreshToken = responseData.refreshToken || responseData.refresh_token;

    if (!token) {
      throw new Error('No token received from backend');
    }

    // Store tokens using consistent naming: access_token and refresh_token
    // This matches what axios interceptor expects
    localStorage.setItem('access_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    // Clean up any legacy token keys that might exist
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');

    // Step 2: Fetch user details by username
    let user: UserDTO;
    try {
      user = await userService.getByUsername(credentials.username);
    } catch (error) {
      // Create minimal user object if fetch fails
      user = {
        id: 0,
        username: credentials.username,
        email: credentials.username,
        roles: [],
      };
    }

    return {
      token,
      refreshToken,
      user,
    };
  }

  /**
   * Logout current user
   * Sends logout request to backend and clears local storage
   */
  async logout(): Promise<void> {
    try {
      // Send logout request to backend
      await axiosInstance.post(`${this.BASE_URL}/logout`);
    } catch (error) {
      // Log error but don't throw - we still want to clear local storage
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local storage regardless of backend response
      this.clearLocalStorage();
    }
  }

  /**
   * Clear authentication data from local storage
   */
  private clearLocalStorage(): void {
    // Remove all possible token key variants
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');     // Legacy
    localStorage.removeItem('refreshToken');    // Legacy
    localStorage.removeItem('authToken');       // Legacy
    localStorage.removeItem('user');
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<LoginResponseDTO> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axiosInstance.post<LoginResponseDTO>(
      `${this.BASE_URL}/refresh`,
      { refreshToken }
    );

    // Extract token with fallback for different response formats
    const responseData = response.data as any;
    const token = responseData.token || responseData.accessToken || responseData.access_token;
    const newRefreshToken = responseData.refreshToken || responseData.refresh_token;

    if (token) {
      localStorage.setItem('access_token', token);
      // Clean up legacy key
      localStorage.removeItem('accessToken');
    }
    
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
      // Clean up legacy key
      localStorage.removeItem('refreshToken');
    }

    return response.data;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    // Check both possible keys for backward compatibility
    return localStorage.getItem('access_token') || localStorage.getItem('accessToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
