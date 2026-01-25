/**
 * JWT Utility Functions
 * 
 * Helper functions for working with JWT tokens
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

interface JWTPayload {
  sub?: string;        // Standard JWT 'subject' claim (usually username)
  username?: string;   // Custom username claim
  exp?: number;        // Expiration time
  iat?: number;        // Issued at
  [key: string]: any;  // Other claims
}

/**
 * Decode a JWT token without verification
 * Note: This does NOT verify the signature. Only use for reading claims.
 * 
 * @param token - JWT token string
 * @returns Decoded payload object
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 decode (handle URL-safe base64)
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Extract username from JWT token
 * Tries 'sub' claim first (standard), then 'username' custom claim
 * 
 * @param token - JWT token string (optional, defaults to token from localStorage)
 * @returns Username string or null if not found
 */
export const getUsernameFromToken = (token?: string): string | null => {
  try {
    // Get token from parameter or localStorage
    const jwtToken = token || localStorage.getItem('access_token');
    
    if (!jwtToken) {
      console.warn('No JWT token found');
      return null;
    }

    const payload = decodeJWT(jwtToken);
    
    if (!payload) {
      return null;
    }

    // Try standard 'sub' claim first, fallback to custom 'username'
    return payload.sub || payload.username || null;
  } catch (error) {
    console.error('Error extracting username from token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * 
 * @param token - JWT token string (optional, defaults to token from localStorage)
 * @returns true if expired, false if valid
 */
export const isTokenExpired = (token?: string): boolean => {
  try {
    const jwtToken = token || localStorage.getItem('access_token');
    
    if (!jwtToken) {
      return true;
    }

    const payload = decodeJWT(jwtToken);
    
    if (!payload || !payload.exp) {
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get all claims from JWT token
 * 
 * @param token - JWT token string (optional, defaults to token from localStorage)
 * @returns JWT payload object or null
 */
export const getTokenClaims = (token?: string): JWTPayload | null => {
  const jwtToken = token || localStorage.getItem('access_token');
  
  if (!jwtToken) {
    return null;
  }

  return decodeJWT(jwtToken);
};

/**
 * Get token expiration time as Date
 * 
 * @param token - JWT token string (optional, defaults to token from localStorage)
 * @returns Date object or null if not found
 */
export const getTokenExpirationDate = (token?: string): Date | null => {
  const payload = getTokenClaims(token);
  
  if (!payload || !payload.exp) {
    return null;
  }

  // Convert seconds to milliseconds
  return new Date(payload.exp * 1000);
};
