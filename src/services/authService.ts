import type { AuthResponse, LoginCredentials, User } from '@/types'
import { mockUser } from '@/data/mockData'

const AUTH_KEY = 'nmskins_auth'
const TOKEN_KEY = 'nmskins_token'

const MOCK_CREDENTIALS = {
  email: 'admin@nmskins.com',
  password: 'admin123',
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800)

    if (
      credentials.email === MOCK_CREDENTIALS.email &&
      credentials.password === MOCK_CREDENTIALS.password
    ) {
      const response: AuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now(),
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(response.user))
      localStorage.setItem(TOKEN_KEY, response.token)
      return response
    }

    throw new Error('Invalid email or password')
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(TOKEN_KEY)
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem(AUTH_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored) as User
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!this.getStoredUser() && !!this.getToken()
  },

  updateStoredUser(updates: Partial<User>): User | null {
    const user = this.getStoredUser()
    if (!user) return null
    const updated = { ...user, ...updates }
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
    return updated
  },
}
