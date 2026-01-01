import axiosInstance from '../../../../shared/config/axios'
import { LoginRequest, TokenResponse, User } from '../dto/AuthDTO'

class AuthService {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>('/auth/login', credentials)
    const { accessToken, refreshToken, expiresIn, tokenType } = response.data
    this.storeAuthData(accessToken, refreshToken, expiresIn, tokenType)
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout')
    } finally {
      this.clearAuthData()
    }
  }

  storeAuthData(accessToken: string, refreshToken: string, expiresIn: number, tokenType: string): void {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('expiresIn', expiresIn.toString())
    localStorage.setItem('tokenType', tokenType)
    localStorage.setItem('tokenTimestamp', Date.now().toString())
  }

  clearAuthData(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresIn')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('tokenTimestamp')
    localStorage.removeItem('user')
  }

  getStoredToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  getTokenType(): string | null {
    return localStorage.getItem('tokenType') || 'Bearer'
  }

  getTokenExpiration(): number | null {
    const expiresIn = localStorage.getItem('expiresIn')
    const timestamp = localStorage.getItem('tokenTimestamp')
    if (!expiresIn || !timestamp) return null
    return parseInt(timestamp) + parseInt(expiresIn) * 1000
  }

  isTokenExpired(): boolean {
    const expirationTime = this.getTokenExpiration()
    if (!expirationTime) return true
    return Date.now() >= expirationTime
  }

  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      return JSON.parse(userStr) as User
    } catch (error) {
      this.clearAuthData()
      return null
    }
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken()
    if (!token) return false
    if (this.isTokenExpired()) {
      this.clearAuthData()
      return false
    }
    return true
  }
}

export default new AuthService()
