import api from './index'
import type { AxiosResponse } from 'axios'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  phone?: string
  password: string
  password_confirm: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: number
    username: string
    email: string
    phone?: string
  }
}

export interface UserProfile {
  id: number
  username: string
  email: string
  phone?: string
  birth_date?: string
  blood_type?: string
  hobbies?: string
  emergency_contact?: string
}

export const authApi = {
  login(data: LoginData): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/users/login/', data)
  },

  register(data: RegisterData): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/users/register/', data)
  },

  refreshToken(refresh: string): Promise<AxiosResponse<{ access: string }>> {
    return api.post('/users/token/refresh/', { refresh })
  },

  logout(): Promise<AxiosResponse<void>> {
    return api.post('/users/logout/')
  },

  getProfile(): Promise<AxiosResponse<UserProfile>> {
    return api.get('/users/me/')
  },

  updateProfile(data: Partial<UserProfile>): Promise<AxiosResponse<UserProfile>> {
    return api.patch('/users/me/', data)
  }
} 