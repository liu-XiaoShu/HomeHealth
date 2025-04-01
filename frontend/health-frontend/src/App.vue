<!-- src/App.vue -->
<template>
  <div class="app-container">
    <div v-if="error" class="error-message">
      {{ error }}
      <el-button type="text" @click="error = null">关闭</el-button>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, ref, onErrorCaptured, onBeforeMount } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const router = useRouter()
const error = ref(null)
const isInitialized = ref(true) // 默认设置为true，避免显示初始化遮罩

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
  error.value = '应用发生错误，请刷新页面重试'
  return false
})

onBeforeMount(() => {
  console.log('App beforeMount, 开始初始化...')
})

onMounted(async () => {
  try {
    console.log('App mounted, 当前状态:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      token: authStore.token ? '存在' : '不存在',
      currentRoute: router.currentRoute.value.fullPath
    })
    
    // 初始化认证状态
    await authStore.initializeAuth()
    
    // 检查是否需要重定向
    const currentRoute = router.currentRoute.value
    
    // 特殊处理根路径
    if (currentRoute.path === '/') {
      console.log('访问根路径，重定向到登录页')
      router.push('/login')
      return
    }
    
    if (currentRoute.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log('需要认证但未登录，重定向到登录页')
      router.push('/login')
    } else if (
      authStore.isAuthenticated && 
      (currentRoute.path === '/login' || currentRoute.path === '/register')
    ) {
      console.log('已登录但访问登录页或注册页，重定向到首页')
      router.push('/home')
    }
  } catch (err) {
    console.error('初始化失败:', err)
    error.value = '应用初始化失败，请刷新页面重试'
  }
})

// 添加路由错误处理
router.onError((err) => {
  console.error('路由错误:', err)
  error.value = '路由加载失败，请刷新页面重试'
})

// 添加路由完成处理
router.afterEach((to, from) => {
  console.log('路由完成:', {
    to: to.path,
    from: from.path
  })
})
</script>

<style>
.app-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f56c6c;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

