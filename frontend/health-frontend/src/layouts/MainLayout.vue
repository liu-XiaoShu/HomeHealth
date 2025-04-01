<template>
  <el-container class="layout-container">
    <el-header class="main-header">
      <div class="header-content">
        <h1 class="logo">家庭健康档案系统</h1>
        <div class="user-info">
          <el-badge is-dot :hidden="!hasNewNotifications" class="notification-badge">
            <el-button size="small" circle @click="showNotifications">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          
          <el-dropdown trigger="click">
            <div class="user-dropdown">
              <el-avatar 
                :size="32" 
                :src="userAvatar" 
                :icon="User" 
                class="user-avatar"
              />
              <div class="user-dropdown-info">
                <span class="username">{{ authStore.user?.username || '未登录' }}</span>
                <span class="user-role">{{ userRole }}</span>
              </div>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon> 个人资料
                </el-dropdown-item>
                <el-dropdown-item @click="router.push('/settings')">
                  <el-icon><Setting /></el-icon> 账号设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="200px" class="main-aside">
        <div class="user-card">
          <el-avatar 
            :size="64" 
            :src="userAvatar" 
            :icon="User" 
            class="user-card-avatar"
          />
          <div class="user-card-info">
            <div class="user-card-name">{{ authStore.user?.username || '未登录' }}</div>
            <div class="user-card-status">
              <span class="status-dot" :class="{ online: isUserOnline }"></span>
              <span>{{ isUserOnline ? '在线' : '离线' }}</span>
            </div>
          </div>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="main-menu"
          router
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-sub-menu index="/records">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>健康记录</span>
            </template>
            <el-menu-item index="/records/physical">
              <el-icon><Opportunity /></el-icon> 体检记录
            </el-menu-item>
            <el-menu-item index="/records/medical">
              <el-icon><FirstAidKit /></el-icon> 就医记录
            </el-menu-item>
            <el-menu-item index="/records/medication">
              <el-icon><Coin /></el-icon> 用药记录
            </el-menu-item>
            <el-menu-item index="/records/vaccination">
              <el-icon><Knife /></el-icon> 疫苗接种
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/family">
            <el-icon><UserFilled /></el-icon>
            <span>家庭成员</span>
          </el-menu-item>

          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          
          <el-menu-item index="/health">
            <el-icon><Monitor /></el-icon>
            <span>系统健康</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <div class="page-header" v-if="route.meta.title">
          <h2 class="page-title">{{ route.meta.title }}</h2>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.parent">{{ route.meta.parent }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
    
    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationsVisible"
      title="通知中心"
      size="300px"
      direction="rtl"
    >
      <div v-if="notifications.length === 0" class="empty-notifications">
        <el-empty description="暂无通知" />
      </div>
      <el-scrollbar height="calc(100vh - 120px)" v-else>
        <div class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
          >
            <div class="notification-icon">
              <el-icon><component :is="getNotificationIcon(notification.type)" /></el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatNotificationTime(notification.time) }}</div>
            </div>
            <div class="notification-actions">
              <el-button 
                size="small" 
                type="text" 
                @click="markAsRead(notification.id)"
                v-if="!notification.read"
              >
                标为已读
              </el-button>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <template #footer>
        <div class="notification-footer">
          <el-button 
            type="primary" 
            size="small" 
            @click="markAllAsRead" 
            :disabled="!hasUnreadNotifications"
          >
            全部标为已读
          </el-button>
          <el-button 
            type="info" 
            size="small" 
            @click="clearAllNotifications"
            :disabled="notifications.length === 0"
          >
            清空通知
          </el-button>
        </div>
      </template>
    </el-drawer>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import {
  House, Document, User, UserFilled, ArrowDown, Monitor,
  Bell, Setting, SwitchButton, Warning, Message, 
  SuccessFilled, Opportunity, FirstAidKit, Coin, Knife
} from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前菜单激活项
const activeMenu = computed(() => route.path)

// 用户头像
const userAvatar = computed(() => authStore.user?.avatar || '')

// 用户角色
const userRole = computed(() => {
  if (!authStore.user) return '游客'
  return '普通用户'
})

// 用户在线状态
const isUserOnline = ref(true)

// 通知相关
const notificationsVisible = ref(false)
const notifications = ref<Array<{
  id
  type: 'success' | 'warning' | 'info' | 'error'
  title
  message
  time: Date
  read
}>>([
  {
    id: 1,
    type: 'warning',
    title: '体检提醒',
    message: '您的年度体检时间即将到来，请及时预约',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    read: false
  },
  {
    id: 2,
    type: 'info',
    title: '系统更新',
    message: '系统已更新到最新版本，新增多项功能',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    read: true
  }
])

// 是否有新通知
const hasNewNotifications = computed(() => {
  return notifications.value.some(notification => !notification.read)
})

// 是否有未读通知
const hasUnreadNotifications = computed(() => {
  return notifications.value.some(notification => !notification.read)
})

// 显示通知抽屉
const showNotifications = () => {
  notificationsVisible.value = true
}

// 标记通知为已读
const markAsRead = (id) => {
  const index = notifications.value.findIndex(notification => notification.id === id)
  if (index !== -1) {
    notifications.value[index].read = true
  }
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  ElMessage.success('已将所有通知标为已读')
}

// 清空所有通知
const clearAllNotifications = () => {
  notifications.value = []
  ElMessage.success('已清空所有通知')
}

// 获取通知图标
const getNotificationIcon = (type) => {
  const iconMap = {
    success: SuccessFilled,
    warning: Warning,
    info: Message,
    error: Warning
  }
  return iconMap[type] || Message
}

// 格式化通知时间
const formatNotificationTime = (time: Date) => {
  return formatDistanceToNow(time, { 
    addSuffix: true,
    locale: zhCN 
  })
}

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    console.error('退出失败:', error)
    ElMessage.error('退出失败，请重试')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.main-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
  height: 60px;
  line-height: 60px;
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo {
  margin: 0;
  font-size: 20px;
  color: #409EFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  margin-right: 8px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: #f5f7fa;
}

.user-avatar {
  margin-right: 8px;
}

.user-dropdown-info {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
  line-height: 1.2;
}

.username {
  font-weight: 500;
  color: #303133;
}

.user-role {
  font-size: 12px;
  color: #909399;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-aside {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 999;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.05);
}

.user-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.user-card-avatar {
  margin-bottom: 10px;
}

.user-card-info {
  text-align: center;
}

.user-card-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.user-card-status {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #c0c4cc;
  margin-right: 4px;
}

.status-dot.online {
  background-color: #67c23a;
}

.main-menu {
  border-right: none;
}

.main-content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.notification-list {
  padding: 0 16px;
}

.notification-item {
  border-bottom: 1px solid #ebeef5;
  padding: 16px 0;
  display: flex;
  position: relative;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 20px;
  left: -16px;
  width: 6px;
  height: 6px;
  background-color: #f56c6c;
  border-radius: 50%;
}

.notification-icon {
  padding: 8px;
  border-radius: 50%;
  background-color: #ecf5ff;
  margin-right: 12px;
  color: #409eff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-actions {
  margin-left: 8px;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
}

.empty-notifications {
  padding: 32px 0;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .main-aside {
    width: 180px !important;
  }
}

@media screen and (max-width: 992px) {
  .main-aside {
    width: 64px !important;
  }

  .el-menu {
    width: 64px;
  }

  .el-menu--collapse {
    width: 64px;
  }

  .user-card {
    padding: 10px;
  }

  .user-card-avatar {
    margin-bottom: 5px;
  }

  .user-card-name, 
  .user-card-status {
    display: none;
  }

  .logo {
    font-size: 16px;
    max-width: 150px;
  }

  .main-content {
    padding: 15px;
  }

  .user-dropdown-info {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .main-header {
    height: 50px;
    line-height: 50px;
  }

  .logo {
    font-size: 14px;
    max-width: 120px;
  }

  .main-content {
    padding: 10px;
  }
}

/* 确保菜单项在折叠时正确显示 */
:deep(.el-menu--collapse) .el-sub-menu__title span,
:deep(.el-menu--collapse) .el-menu-item span {
  display: none;
}

:deep(.el-menu--collapse) .el-sub-menu__title .el-sub-menu__icon-arrow {
  display: none;
}
</style> 