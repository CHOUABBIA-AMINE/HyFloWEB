/**
 * Auth Context
 * Global authentication state management with JWT
 * Refresh token used only reactively on 401 responses (handled by axios interceptors)
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 01-25-2026 - Updated to use /user/username/{username} endpoint with JWT utils
 * @updated 01-20-2026 - Updated to use employee data from new UserDTO structure
 * @updated 01-08-2026 - Fixed LoginRequest import name
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../../modules/system/auth/services';
import { LoginRequest } from '../../modules/system/auth/dto';
import { UserDTO } from '../../modules/system/security/dto';
import UserService from '../../modules/system/security/services/UserService';
import { getUsernameFromToken } from '../utils/jwtUtils';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  employeeId?: number;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Convert UserDTO to User format
   */
  const convertUserDTO = (userDTO: UserDTO): User => {
    // Extract first and last name from employee if available
    const firstName = userDTO.employee?.firstNameLt || userDTO.employee?.firstNameAr;
    const lastName = userDTO.employee?.lastNameLt || userDTO.employee?.lastNameAr;

    return {
      id: userDTO.id!,
      username: userDTO.username,
      email: userDTO.email,
      firstName,
      lastName,
      employeeId: userDTO.employeeId,
      roles: userDTO.roles?.map(role => role.name) || [],
    };
  };

  /**
   * Fetch user data from backend using username from JWT token
   */
  const fetchUserData = async (jwtToken: string): Promise<User | null> => {
    try {
      // Extract username from JWT token
      const username = getUsernameFromToken(jwtToken);
      
      if (!username) {
        console.error('No username found in JWT token');
        return null;
      }

      // Fetch user data from backend using /user/username/{username}
      const userDTO = await UserService.getByUsername(username);
      
      // Convert to User format
      return convertUserDTO(userDTO);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  };

  /**
   * Refresh user data from backend
   */
  const refreshUserData = async () => {
    try {
      const storedToken = authService.getToken();
      
      if (!storedToken) {
        console.warn('No token found, cannot refresh user data');
        return;
      }

      const userData = await fetchUserData(storedToken);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data refreshed from backend');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getToken();
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Set token and user from localStorage
          setToken(storedToken);
          setUser(parsedUser);
          
          console.log('Auth state initialized from localStorage');
          
          // Optionally refresh user data from backend in background
          // This ensures we have the latest data without blocking the UI
          fetchUserData(storedToken).then(freshUser => {
            if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(parsedUser)) {
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
              console.log('User data updated with fresh data from backend');
            }
          }).catch(error => {
            console.error('Background user data refresh failed:', error);
          });
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        console.log('No stored authentication found');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      // authService.login returns { token, refreshToken, user }
      const { token: receivedToken, user: userDTO } = await authService.login(credentials);

      // Set token in state
      setToken(receivedToken);

      // Convert UserDTO to User format
      const userData = convertUserDTO(userDTO);

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call authService logout which sends request to backend
      await authService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout request error:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      // Always clear local state
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('User profile updated');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
