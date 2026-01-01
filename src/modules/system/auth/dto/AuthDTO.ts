/**
 * Authentication DTOs
 * Matches backend auth DTOs
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface User {
  id?: number
  username?: string
  email?: string
  fullName?: string
  roles?: string[]
  permissions?: string[]
}
