// src/stores/auth.ts 需要完整配置
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface User {
  id: number
  username: string
  email: string
  phone: string
}

interface UserProfile {
  id: number
  user: number
  avatar: string | null
  birth_date: string | null
  gender: string | null
  address: string | null
}

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  phone: string
  password: string
}

// 修改API路径以匹配Django后端
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const profile = ref<UserProfile | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const router = useRouter()
  const isAuthenticated = computed(() => !!token.value)

  // 设置认证信息
  const setAuth = (userData: User, accessToken: string, newRefreshToken: string) => {
    user.value = userData
    token.value = accessToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    // 设置axios默认headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  // 清除认证信息
  const clearAuth = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    profile.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  // 初始化状态
  const initializeAuth = () => {
    console.log('开始初始化认证状态')
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    console.log('从localStorage获取到的信息:', { 
      storedToken: storedToken ? '存在' : '不存在', 
      storedUser: storedUser ? '存在' : '不存在' 
    })
    
    if (storedToken) {
      token.value = storedToken
      console.log('设置令牌:', storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
          console.log('恢复用户信息成功:', user.value)
        } catch (e) {
          console.error('解析用户信息失败:', e)
          clearAuth()
        }
      }
      
      // 获取用户数据
      return loadUser()
    } else {
      console.log('未找到存储的令牌，用户未登录')
      clearAuth()
      return Promise.resolve()
    }
  }

  // 加载用户信息
  const loadUser = async () => {
    console.log('开始加载用户信息')
    try {
      const response = await axios.get(`${API_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      console.log('加载用户信息成功:', response.data)
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.error('加载用户信息失败:', error)
      console.log('由于加载失败，执行登出操作')
      clearAuth()
      return router.push('/login')
    }
  }

  // 登录
  const login = async (data: LoginData) => {
    try {
      loading.value = true
      error.value = null
      console.log('登录请求开始...')
      console.log('登录API地址:', `${API_URL}/users/login/`)
      console.log('登录数据:', data)
      
      // 确保token值为空
      token.value = null
      user.value = null
      delete axios.defaults.headers.common['Authorization']
      
      const response = await axios.post(`${API_URL}/users/login/`, data)
      console.log('登录响应:', response.data)
      
      // 检查响应格式
      if (!response.data.access || !response.data.refresh) {
        console.error('API响应格式错误，缺少access或refresh token')
        throw new Error('API响应格式错误')
      }
      
      const { access, refresh, user: userData } = response.data
      console.log('正在设置认证信息...')
      
      // 先存储到localStorage
      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // 然后更新状态
      user.value = userData
      token.value = access
      refreshToken.value = refresh
      
      // 设置axios默认headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      console.log('登录完成，认证状态:', { 
        isAuthenticated: !!token.value,
        user: user.value 
      })
      
      return response.data
    } catch (err: any) {
      console.error('登录失败:', err)
      console.log('错误响应:', err.response?.data)
      error.value = err.response?.data?.detail || '登录失败，请检查用户名和密码'
      
      // 清除可能部分设置的状态
      clearAuth()
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (data: RegisterData) => {
    try {
      loading.value = true
      error.value = null
      console.log('注册请求开始...')
      console.log('注册数据:', data)
      
      const response = await axios.post(`${API_URL}/users/register/`, data)
      console.log('注册响应:', response.data)
      
      if (response.data.user) {
        console.log('注册成功，返回用户数据')
        return response.data
      }
      
      return response.data
    } catch (err: any) {
      console.error('注册失败:', err)
      error.value = err.response?.data?.detail || '注册失败，请检查输入'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    clearAuth()
    router.push('/login')
  }

  // 刷新token
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token')
    }
    try {
      const response = await axios.post(`${API_URL}/users/token/refresh/`, {
        refresh: refreshToken.value
      })
      token.value = response.data.access
      localStorage.setItem('token', response.data.access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
      return response.data
    } catch (error) {
      clearAuth()
      router.push('/login')
      throw error
    }
  }

  // 初始化axios拦截器
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      if (error.response?.status === 401 && !originalRequest._retry && refreshToken.value) {
        originalRequest._retry = true
        try {
          await refreshAccessToken()
          return axios(originalRequest)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }
      return Promise.reject(error)
    }
  )

  return {
    user,
    token,
    refreshToken,
    profile,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
    loadUser,
    refreshAccessToken,
    clearAuth,
    setAuth
  }
})
