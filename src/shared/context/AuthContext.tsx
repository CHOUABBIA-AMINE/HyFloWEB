/**
 * Auth Context
 * Global authentication state management with JWT
 * Refresh token used only reactively on 401 responses (handled by axios interceptors)
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-27-2025
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../../modules/system/auth/services';
import { LoginRequestDTO } from '../../modules/system/auth/dto';
import { UserDTO } from '../../modules/system/security/dto';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
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

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = authService.getToken();
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Set token and user from localStorage
          // No proactive token validation - axios interceptors will handle expired tokens
          setToken(storedToken);
          setUser(parsedUser);
          
          console.log('✅ Auth state initialized from localStorage');
        } catch (error) {
          console.error('❌ Failed to parse stored user:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        console.log('ℹ️ No stored authentication found');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequestDTO) => {
    try {
      // authService.login returns { token, refreshToken, user }
      const { token: receivedToken, user: userDTO } = await authService.login(credentials);

      // Set token in state
      setToken(receivedToken);

      // Convert UserDTO to User format and extract role names
      const userData: User = {
        id: userDTO.id,
        username: userDTO.username,
        email: userDTO.email,
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        roles: userDTO.roles?.map(role => role.name) || [],
      };

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call authService logout which sends request to backend
      await authService.logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('⚠️ Logout request error:', error);
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
    console.log('✅ User profile updated');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
