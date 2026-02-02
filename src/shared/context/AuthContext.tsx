/**
 * Auth Context
 * Global authentication state management with permissions
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 02-02-2026 - Updated to use new AuthService with permission support
 * @updated 01-25-2026 - Updated to use /user/username/{username} endpoint with JWT utils
 * @updated 01-20-2026 - Updated to use employee data from new UserDTO structure
 * @updated 01-08-2026 - Fixed LoginRequest import name
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/AuthService';
import type { UserProfile } from '@/types/auth';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh user data from backend
   */
  const refreshUserData = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        console.warn('No authentication token found, cannot refresh user data');
        return;
      }

      const userData = await AuthService.getCurrentUser();
      
      setUser(userData);
      console.log('User data refreshed from backend');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails (e.g., token expired), logout
      await logout();
    }
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize AuthService (loads user from localStorage or fetches from backend)
        await AuthService.initialize();
        
        // Get user and token
        const storedToken = AuthService.getToken();
        const storedUser = localStorage.getItem('currentUser');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as UserProfile;
            
            setToken(storedToken);
            setUser(parsedUser);
            
            console.log('Auth state initialized:', {
              username: parsedUser.username,
              permissions: parsedUser.permissions?.length || 0,
              roles: parsedUser.roles?.length || 0,
            });
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            // Clear invalid data
            await AuthService.logout();
          }
        } else {
          console.log('No stored authentication found');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Use new AuthService.login
      const response = await AuthService.login(credentials);

      // Set token and user in state
      setToken(response.accessToken);
      setUser(response.user);
      
      console.log('Login successful:', {
        username: response.user.username,
        permissions: response.user.permissions?.length || 0,
        roles: response.user.roles?.length || 0,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout request error:', error);
    } finally {
      // Always clear local state
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    console.log('User profile updated:', {
      username: updatedUser.username,
      permissions: updatedUser.permissions?.length || 0,
    });
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
