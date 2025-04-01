<template>
  <div class="login-container">
    <div class="login-background">
      <div class="circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>
      <div class="pattern"></div>
    </div>
    
    <el-card class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2>小树家健康管理系统</h2>
        <p class="subtitle">您的健康，我们的关注</p>
      </div>
      
      <el-form
        ref="loginForm"
        :model="loginData"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username" label="用户名">
          <el-input
            v-model="loginData.username"
            prefix-icon="User"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input
            v-model="loginData.password"
            type="password"
            prefix-icon="Lock"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="remember-forgot">
          <el-checkbox v-model="loginData.remember">记住我</el-checkbox>
          <el-link type="primary" @click="router.push('/forgot-password')">
            忘记密码？
          </el-link>
        </div>

        <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
          class="login-button"
        >
          登录
        </el-button>

        <div class="register-link">
          还没有账号？
          <el-link type="primary" @click="router.push('/register')">
            立即注册
          </el-link>
        </div>
        
        <div class="health-check-link">
          <el-link type="info" @click="router.push('/health')">
            检查系统状态
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { User, Lock } from '@element-plus/icons-vue'
// import type { LoginData } from '@/api/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const loginForm = ref()

const loginData = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}

onMounted(() => {
  console.log('登录页面已挂载')
  console.log('当前认证状态:', {
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token,
    user: authStore.user
  })
  
  // 如果已经登录，重定向到首页
  if (authStore.isAuthenticated) {
    console.log('用户已登录，重定向到首页')
    router.push('/home')
  }
})

const handleLogin = async () => {
  if (!loginForm.value) return
  
  try {
    loading.value = true
    
    // 表单验证
    await loginForm.value.validate()
    console.log('表单验证通过，准备提交登录请求')
    
    // 登录请求
    const result = await authStore.login({
      username: loginData.username,
      password: loginData.password
    })
    
    console.log('登录成功，响应:', result)
    ElMessage.success('登录成功')
    
    // 登录成功后重定向到首页
    router.push('/home')
  } catch (error) {
    console.error('登录失败:', error)
    const errorMsg = error.response?.data?.detail || 
                   authStore.error || 
                   '登录失败，请检查用户名和密码'
    
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(to right, #409eff, #53a8ff);
  opacity: 0.4;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 50px;
  right: 100px;
  background: linear-gradient(to right, #67c23a, #85ce61);
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 250px;
  right: 30px;
  background: linear-gradient(to right, #e6a23c, #f3d19e);
}

.circle-4 {
  width: 150px;
  height: 150px;
  top: 250px;
  left: 100px;
  background: linear-gradient(to right, #f56c6c, #fc9999);
}

.pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px);
  background-size: 30px 30px;
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 1;
  position: relative;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

h2 {
  font-size: 24px;
  color: #303133;
  margin: 10px 0;
  font-weight: 500;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 5px 0 15px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  margin-bottom: 20px;
}

.register-link,
.health-check-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.health-check-link {
  margin-top: 30px;
  color: #909399;
  font-size: 12px;
}
</style> 