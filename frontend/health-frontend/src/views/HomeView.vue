<template>
  <div class="home-view">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <div class="welcome-panel">
          <div class="welcome-message">
            <h2>欢迎回来, {{ user?.username || '用户' }}</h2>
            <p class="date">{{ currentDate }}</p>
          </div>
          <el-button @click="refreshData" :loading="loading" circle>
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>

        <!-- 健康数据概览 -->
        <el-card class="data-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>健康数据概览</h3>
              <el-button type="primary" text @click="navigateTo('/records/physical')">
                查看详情
              </el-button>
            </div>
          </template>
          
          <el-skeleton :rows="4" animated v-if="loading" />
          
          <template v-else>
            <el-row :gutter="20" class="health-stats">
              <el-col :xs="12" :sm="6" :md="6" v-for="stat in healthStats" :key="stat.label">
                <div class="stat-item">
                  <div class="stat-value" :class="stat.status">
                    {{ stat.value }}
                  </div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </el-col>
            </el-row>
            
            <div class="last-exam">
              <p>
                上次体检: 
                <strong>{{ lastExamDate || '尚未记录' }}</strong>
              </p>
            </div>
          </template>
        </el-card>
        
        <!-- 最近记录 -->
        <el-card class="data-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>最近记录</h3>
              <div>
                <el-select v-model="selectedRecordType" placeholder="记录类型" size="small">
                  <el-option label="全部记录" value="" />
                  <el-option label="就医记录" value="medical" />
                  <el-option label="用药记录" value="medication" />
                  <el-option label="疫苗接种" value="vaccination" />
                </el-select>
              </div>
            </div>
          </template>
          
          <el-skeleton :rows="5" animated v-if="loading" />
          
          <el-empty description="暂无记录" v-else-if="recentRecords.length === 0" />
          
          <div v-else class="recent-records">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="record-item"
              @click="viewRecordDetail(record)"
            >
              <div class="record-icon" :class="getRecordClass(record.type)">
                <el-icon>
                  <component :is="getRecordIcon(record.type)" />
                </el-icon>
              </div>
              <div class="record-content">
                <div class="record-title">{{ record.title }}</div>
                <div class="record-meta">
                  {{ formatDate(record.date) }} | {{ getRecordTypeName(record.type) }}
                </div>
              </div>
              <div class="record-action">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧边栏 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <!-- 健康提醒 -->
        <el-card class="sidebar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>健康提醒</h3>
              <el-button type="primary" text>全部</el-button>
            </div>
          </template>
          
          <el-skeleton :rows="3" animated v-if="loading" />
          
          <el-empty description="暂无提醒" v-else-if="healthReminders.length === 0" />
          
          <div v-else class="reminders">
            <div
              v-for="reminder in healthReminders"
              :key="reminder.id"
              class="reminder-item"
              :class="{ urgent: reminder.priority === 'high' }"
            >
              <div class="reminder-icon">
                <el-icon>
                  <component :is="getReminderIcon(reminder.type)" />
                </el-icon>
              </div>
              <div class="reminder-content">
                <div class="reminder-title">{{ reminder.title }}</div>
                <div class="reminder-date">{{ reminder.date }}</div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 快捷操作 -->
        <el-card class="sidebar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>快捷操作</h3>
            </div>
          </template>
          
          <div class="quick-actions">
            <div
              v-for="action in quickActions"
              :key="action.title"
              class="quick-action"
              @click="navigateTo(action.route)"
            >
              <el-icon class="action-icon">
                <component :is="action.icon" />
              </el-icon>
              <div class="action-title">{{ action.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { getHealthRecords, getRecentRecords } from '@/api/records'
import { Calendar, User, Document, Notification, List, Location, 
  Trophy, ArrowRight, Bell, OfficeBuilding, Refresh, Notebook
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// 页面状态
const loading = ref(true)
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

// 健康数据
const healthStats = ref([
  { label: '身高', value: '--', unit: 'cm', status: '' },
  { label: '体重', value: '--', unit: 'kg', status: '' },
  { label: '血压', value: '--', unit: 'mmHg', status: '' },
  { label: '血糖', value: '--', unit: 'mmol/L', status: '' }
])

const lastExamDate = ref('')

// 最近记录
const selectedRecordType = ref('')
const recentRecords = ref([])

// 提醒事项
const healthReminders = ref([
  {
    id: 1,
    title: '高血压复诊',
    date: '明天 上午9:00',
    type: 'medical',
    priority: 'high'
  },
  {
    id: 2,
    title: '服用降压药',
    date: '今天 19:00',
    type: 'medication',
    priority: 'medium'
  },
  {
    id: 3,
    title: '流感疫苗接种',
    date: '3天后',
    type: 'vaccination',
    priority: 'low'
  }
])

// 快捷操作
const quickActions = [
  {
    title: '添加就医记录',
    icon: 'Document',
    route: '/records/medical/new'
  },
  {
    title: '添加用药记录',
    icon: 'Notebook',
    route: '/records/medication/new'
  },
  {
    title: '添加体检记录',
    icon: 'User',
    route: '/records/physical/new'
  },
  {
    title: '添加疫苗记录',
    icon: 'Location',
    route: '/records/vaccination/new'
  }
]

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    
    // 加载健康数据概览
    const overviewResponse = await getHealthRecords()
    const overviewData = overviewResponse.data
    
    // 更新健康数据
    if (overviewData.physical_stats) {
      const stats = overviewData.physical_stats
      healthStats.value = [
        { 
          label: '身高', 
          value: stats.height ? `${stats.height}` : '--', 
          unit: 'cm',
          status: ''
        },
        { 
          label: '体重', 
          value: stats.weight ? `${stats.weight}` : '--', 
          unit: 'kg',
          status: ''
        },
        { 
          label: '血压', 
          value: stats.blood_pressure ? stats.blood_pressure : '--', 
          unit: 'mmHg',
          status: getStatusClass(stats.blood_pressure_status)
        },
        { 
          label: '血糖', 
          value: stats.blood_sugar ? `${stats.blood_sugar}` : '--', 
          unit: 'mmol/L',
          status: getStatusClass(stats.blood_sugar_status)
        }
      ]
      
      // 更新上次体检日期
      lastExamDate.value = stats.last_exam_date || ''
    }
    
    // 加载最近记录
    await loadRecentRecords()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载最近记录
const loadRecentRecords = async () => {
  try {
    const recordsResponse = await getRecentRecords(selectedRecordType.value)
    const records = recordsResponse.data
    
    // 转换记录数据
    recentRecords.value = records.slice(0, 5).map((record) => ({
      id: record.id,
      title: record.title || getDefaultTitle(record),
      date: record.date,
      type: record.record_type,
      status: record.status
    }))
  } catch (error) {
    console.error('加载记录失败:', error)
  }
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 导航到指定路径
const navigateTo = (path) => {
  router.push(path)
}

// 查看记录详情
const viewRecordDetail = (record) => {
  let path = '/records/'
  
  switch (record.type) {
    case 'medical':
      path += 'medical/'
      break
    case 'medication':
      path += 'medication/'
      break
    case 'vaccination':
      path += 'vaccination/'
      break
    case 'physical':
      path += 'physical/'
      break
    default:
      path += 'medical/'
  }
  
  path += record.id
  navigateTo(path)
}

// 获取记录类型名称
const getRecordTypeName = (type) => {
  const typeMap = {
    'medical': '就医记录',
    'medication': '用药记录',
    'vaccination': '疫苗接种',
    'physical': '体检记录'
  }
  return typeMap[type] || '其他记录'
}

// 获取记录类型图标
const getRecordIcon = (type) => {
  const iconMap = {
    'medical': 'FirstAid',
    'medication': 'Medicine',
    'vaccination': 'Suitcase',
    'physical': 'Notebook'
  }
  return iconMap[type] || 'Document'
}

// 获取提醒类型图标
const getReminderIcon = (type) => {
  const iconMap = {
    'medical': 'FirstAid',
    'medication': 'Medicine',
    'vaccination': 'Suitcase'
  }
  return iconMap[type] || 'Bell'
}

// 获取记录CSS类
const getRecordClass = (type) => {
  const classMap = {
    'medical': 'medical-icon',
    'medication': 'medication-icon',
    'vaccination': 'vaccination-icon',
    'physical': 'physical-icon'
  }
  return classMap[type] || ''
}

// 获取状态CSS类
const getStatusClass = (status) => {
  if (!status) return ''
  
  const classMap = {
    'normal': 'normal',
    'warning': 'warning',
    'danger': 'danger'
  }
  return classMap[status] || ''
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 获取默认记录标题
const getDefaultTitle = (record) => {
  const typeMap = {
    'medical': '就医记录',
    'medication': '用药记录',
    'vaccination': '疫苗接种',
    'physical': '体检记录'
  }
  
  return typeMap[record.record_type] || '健康记录'
}

// 监听记录类型变化
watchEffect(() => {
  loadRecentRecords()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-view {
  padding: 20px;
}

.welcome-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.welcome-message h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 500;
}

.date {
  margin-top: 5px;
  color: #606266;
}

.data-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.health-stats {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 5px;
}

.stat-value.normal {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.last-exam {
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.recent-records {
  margin-top: 10px;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.record-item:last-child {
  border-bottom: none;
}

.record-item:hover {
  background-color: #f5f7fa;
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-right: 15px;
}

.medical-icon {
  background-color: #409eff;
}

.medication-icon {
  background-color: #67c23a;
}

.vaccination-icon {
  background-color: #e6a23c;
}

.physical-icon {
  background-color: #909399;
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.record-meta {
  font-size: 12px;
  color: #909399;
}

.sidebar-card {
  margin-bottom: 20px;
}

.reminders {
  margin-top: 10px;
}

.reminder-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.reminder-item:last-child {
  border-bottom: none;
}

.reminder-item.urgent {
  background-color: rgba(245, 108, 108, 0.1);
}

.reminder-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 3px;
}

.reminder-date {
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-action:hover {
  background-color: #e4e7ed;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #409eff;
}

.action-title {
  font-size: 12px;
  text-align: center;
}

@media (max-width: 768px) {
  .health-stats {
    justify-content: center;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 