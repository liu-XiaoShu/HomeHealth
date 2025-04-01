import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    try {
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
    } catch (e) {
      console.error('请求拦截器错误:', e)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore()
        if (authStore.refreshToken) {
          // 尝试刷新令牌
          await authStore.refreshAccessToken()
          const originalRequest = error.config
          originalRequest.headers.Authorization = `Bearer ${authStore.token}`
          return api(originalRequest)
        } else {
          throw new Error('无refresh token，无法刷新')
        }
      } catch (refreshError) {
        // 刷新失败，清除认证状态并重定向到登录页
        const authStore = useAuthStore()
        authStore.clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// 健康检查API
export const healthCheck = () => {
  return axios.get(`${API_URL}/health/`)
    .then(response => {
      return {
        status: 'healthy',
        message: response.data.message || '后端服务正常'
      }
    })
    .catch(error => {
      console.error('健康检查失败:', error)
      return {
        status: 'unhealthy',
        message: '后端服务不可用，请检查服务器状态'
      }
    })
}

// 用户相关接口
export const auth = {
  login: (data: { username: string; password: string }) =>
    api.post('/users/login/', data),
  register: (data: { username: string; email: string; password: string; password_confirm: string }) =>
    api.post('/users/register/', data),
  logout: () => api.post('/users/logout/'),
  getProfile: () => api.get('/users/me/')
}

// 健康记录相关接口
export const records = {
  getList: (recordType?: string) => api.get('/records/', { params: { type: recordType } }),
  getDetail: (id: number) => api.get(`/records/${id}/`),
  create: (data: any) => api.post('/records/', data),
  update: (id: number, data: any) => api.put(`/records/${id}/`, data),
  delete: (id: number) => api.delete(`/records/${id}/`)
}

export default api 