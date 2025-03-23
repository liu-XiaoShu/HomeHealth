<template>
  <div class="home">
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>欢迎使用小树家健康管理系统</h2>
              <div class="user-actions">
                <el-dropdown trigger="click">
                  <el-button type="primary" size="small">
                    账户操作 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="$router.push('/profile')">
                        <el-icon><User /></el-icon> 个人资料
                      </el-dropdown-item>
                      <el-dropdown-item @click="$router.push('/settings')">
                        <el-icon><Setting /></el-icon> 账号设置
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="logout">
                        <el-icon><SwitchButton /></el-icon> 退出登录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>
          <div class="user-profile-summary">
            <div class="user-info">
              <el-avatar 
                :size="64" 
                :src="userAvatar" 
                :icon="UserIcon" 
                class="user-avatar"
              />
              <div class="user-details">
                <h3>{{ userInfo?.username || '未知用户' }}</h3>
                <p>{{ userInfo?.email || '无邮箱' }}</p>
                <p>{{ userInfo?.phone || '无电话' }}</p>
              </div>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <p class="stat-value">{{ healthStats.medical_records.total }}</p>
                <p class="stat-label">就医记录</p>
              </div>
              <div class="stat-item">
                <p class="stat-value">{{ healthStats.medication_records.total }}</p>
                <p class="stat-label">用药记录</p>
              </div>
              <div class="stat-item">
                <p class="stat-value">{{ healthStats.vaccination_records.total }}</p>
                <p class="stat-label">疫苗记录</p>
              </div>
              <div class="stat-item">
                <p class="stat-value">{{ healthStats.physical_exams.total }}</p>
                <p class="stat-label">体检报告</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card class="announcement-card">
          <template #header>
            <div class="card-header">
              <h3>健康提醒</h3>
            </div>
          </template>
          <div class="announcements">
            <div v-for="(item, index) in healthReminders" :key="index" class="announcement-item">
              <div class="announcement-icon">
                <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
              </div>
              <div class="announcement-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.content }}</p>
                <span class="announcement-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="body-model-card">
          <template #header>
            <div class="card-header">
              <h3>身体健康状况</h3>
              <el-button type="primary" size="small" @click="refreshHealthData">刷新数据</el-button>
            </div>
          </template>
          <div class="body-model-wrapper">
            <BodyModel />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="feature-card" @click="navigateTo('medical-records')">
          <template #header>
            <div class="card-header">
              <h3>就医记录</h3>
              <el-button 
                type="success" 
                size="small" 
                circle 
                @click.stop="addRecord('medical')"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="feature-content">
            <el-icon :size="40" color="#409EFF"><Briefcase /></el-icon>
            <p>记录每次就医的详细信息</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="feature-card" @click="navigateTo('medication-records')">
          <template #header>
            <div class="card-header">
              <h3>用药记录</h3>
              <el-button 
                type="success" 
                size="small" 
                circle 
                @click.stop="addRecord('medication')"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="feature-content">
            <el-icon :size="40" color="#67C23A"><Notebook /></el-icon>
            <p>管理日常用药和提醒</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="feature-card" @click="navigateTo('vaccination-records')">
          <template #header>
            <div class="card-header">
              <h3>疫苗接种</h3>
              <el-button 
                type="success" 
                size="small" 
                circle 
                @click.stop="addRecord('vaccination')"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="feature-content">
            <el-icon :size="40" color="#E6A23C"><Stamp /></el-icon>
            <p>追踪疫苗接种进度</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="feature-card" @click="navigateTo('physical-exams')">
          <template #header>
            <div class="card-header">
              <h3>体检报告</h3>
              <el-button 
                type="success" 
                size="small" 
                circle 
                @click.stop="addRecord('physical')"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="feature-content">
            <el-icon :size="40" color="#F56C6C"><Odometer /></el-icon>
            <p>管理体检报告和记录</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加记录对话框 -->
    <el-dialog
      v-model="addRecordDialogVisible"
      :title="getRecordTypeTitle()"
      width="60%"
      destroy-on-close
    >
      <component 
        :is="currentFormComponent" 
        v-if="addRecordDialogVisible"
        @submit="submitRecord"
        @cancel="addRecordDialogVisible = false"
      />
    </el-dialog>

    <!-- 健康趋势图表 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>健康趋势</span>
            </div>
          </template>
          
          <el-tabs>
            <el-tab-pane label="血压">
              <LineChart
                :dates="healthTrend.dates"
                :data="[healthTrend.bloodPressure.systolic, healthTrend.bloodPressure.diastolic]"
                :labels="['收缩压', '舒张压']"
                unit="mmHg"
                title="血压趋势"
              />
            </el-tab-pane>
            
            <el-tab-pane label="血糖">
              <LineChart
                :dates="healthTrend.dates"
                :data="healthTrend.bloodSugar"
                unit="mmol/L"
                title="血糖趋势"
              />
            </el-tab-pane>
            
            <el-tab-pane label="体重">
              <LineChart
                :dates="healthTrend.dates"
                :data="healthTrend.weight"
                unit="kg"
                title="体重趋势"
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Briefcase, Notebook, Stamp, Odometer, 
  Plus, User as UserIcon, ArrowDown, Setting, 
  SwitchButton, Bell, MoreFilled, 
  Calendar, Warning, Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import BodyModel from '@/components/BodyModel.vue'
import MedicalRecordForm from '@/components/forms/MedicalRecordForm.vue'
import MedicationRecordForm from '@/components/forms/MedicationRecordForm.vue'
import VaccinationRecordForm from '@/components/forms/VaccinationRecordForm.vue'
import PhysicalExamForm from '@/components/forms/PhysicalExamForm.vue'
import { recordsApi } from '@/api/records'
import axios from 'axios'
import LineChart from '@/components/LineChart.vue'
import type { User } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const router = useRouter()
const authStore = useAuthStore()

// 添加记录对话框控制
const addRecordDialogVisible = ref(false)
const currentRecordType = ref<'medical' | 'medication' | 'vaccination' | 'physical' | null>(null)

// 动态组件处理
const currentFormComponent = computed(() => {
  switch (currentRecordType.value) {
    case 'medical': return MedicalRecordForm
    case 'medication': return MedicationRecordForm
    case 'vaccination': return VaccinationRecordForm
    case 'physical': return PhysicalExamForm
    default: return null
  }
})

// 用户信息
const userInfo = computed(() => authStore.user as User)
const userAvatar = computed(() => userInfo.value?.avatar || '')

// 健康统计信息
const healthStats = ref({
  medical_records: { total: 0, recent: [], by_department: [] },
  medication_records: { total: 0, active: 0, recent: [] },
  vaccination_records: { total: 0, pending_next_dose: 0, recent: [] },
  physical_exams: { total: 0, abnormal: 0, recent: [] }
})

// 健康提醒
const healthReminders = ref([
  {
    icon: 'Calendar',
    color: '#409EFF',
    title: '年度体检提醒',
    content: '您的年度体检预约日期为2025年4月15日，请准时参加',
    time: '3天后'
  },
  {
    icon: 'Warning',
    color: '#E6A23C',
    title: '血压异常',
    content: '最近记录的血压偏高，建议多休息，减少摄盐',
    time: '今天'
  },
  {
    icon: 'Check',
    color: '#67C23A',
    title: '用药提醒',
    content: '别忘了今晚服用高血压药物',
    time: '今天'
  }
])

// 状态变量
const loading = ref(true)
const abnormalOrgans = ref<Array<{
  id: number
  name: string
  status: string
  description: string
  position: { x: number, y: number }
}>>([])

const latestPhysicalExam = ref<{
  date: string
  result: string
  hospital: string
  items: string[]
} | null>(null)

const latestVaccination = ref<{
  name: string
  date: string
  hospital: string
  nextDose?: string
} | null>(null)

// 健康趋势
interface HealthTrend {
  dates: string[]
  bloodPressure: {
    systolic: number[]
    diastolic: number[]
  }
  bloodSugar: number[]
  weight: number[]
}

interface RecentActivity {
  id: number
  type: string
  description: string
  date: string
}

const recentActivities = ref<RecentActivity[]>([])

const healthTrend = ref<HealthTrend>({
  dates: [],
  bloodPressure: {
    systolic: [],
    diastolic: []
  },
  bloodSugar: [],
  weight: []
})

// 打开添加记录对话框
const addRecord = (type: 'medical' | 'medication' | 'vaccination' | 'physical') => {
  currentRecordType.value = type
  addRecordDialogVisible.value = true
}

// 获取记录类型标题
const getRecordTypeTitle = () => {
  switch (currentRecordType.value) {
    case 'medical': return '添加就医记录'
    case 'medication': return '添加用药记录'
    case 'vaccination': return '添加疫苗接种记录'
    case 'physical': return '添加体检记录'
    default: return '添加记录'
  }
}

// 提交记录表单
const submitRecord = async (formData: any) => {
  try {
    let result
    
    // 根据记录类型调用相应的API
    switch (currentRecordType.value) {
      case 'medical':
        // 转换表单数据格式以匹配API期望的格式
        const medicalData = {
          visit_date: formData.visitDate.toISOString().split('T')[0],
          hospital: formData.hospital,
          department: formData.department,
          doctor_name: formData.doctorName,
          reason: formData.reason,
          diagnosis: formData.diagnosis,
          prescriptions: formData.prescriptions,
          notes: formData.notes
        }
        result = await recordsApi.createMedicalRecord(medicalData)
        
        // 上传附件（如果有）
        if (formData.attachments && formData.attachments.length > 0) {
          for (const file of formData.attachments) {
            await recordsApi.uploadMedicalRecordAttachment(result.id, file.raw)
          }
        }
        break
        
      case 'medication':
        // 转换表单数据格式
        const medicationData = {
          medication_name: formData.medicationName,
          medication_type: formData.medicationType,
          specification: formData.specification,
          dosage: formData.dosage,
          start_date: formData.startDate.toISOString().split('T')[0],
          end_date: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
          is_long_term: formData.isLongTerm,
          reminder_days: formData.isLongTerm ? formData.reminderDays : null,
          reminder_times: formData.isLongTerm ? formData.reminderTimes.map((time: Date) => 
            `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
          ) : null,
          symptoms: formData.symptoms,
          side_effects: formData.sideEffects,
          notes: formData.notes
        }
        result = await recordsApi.createMedicationRecord(medicationData)
        
        // 上传图片（如果有）
        if (formData.images && formData.images.length > 0) {
          for (const file of formData.images) {
            await recordsApi.uploadMedicationImage(result.id, file.raw)
          }
        }
        break
        
      case 'vaccination':
        // 转换表单数据格式
        const vaccinationData = {
          vaccine_name: formData.vaccineName,
          vaccine_type: formData.vaccineType,
          hospital: formData.hospital,
          vaccination_date: formData.vaccinationDate.toISOString().split('T')[0],
          dose_number: formData.doseNumber,
          batch_number: formData.batchNumber,
          manufacturer: formData.manufacturer,
          site: formData.site,
          next_dose_date: formData.nextDoseDate ? formData.nextDoseDate.toISOString().split('T')[0] : null,
          reactions: formData.reactions,
          allergy_details: formData.allergyDetails,
          notes: formData.notes
        }
        result = await recordsApi.createVaccinationRecord(vaccinationData)
        
        // 上传证书（如果有）
        if (formData.certificates && formData.certificates.length > 0) {
          for (const file of formData.certificates) {
            await recordsApi.uploadVaccinationCertificate(result.id, file.raw)
          }
        }
        break
        
      case 'physical':
        // 转换表单数据格式
        const physicalData = {
          exam_date: formData.examDate.toISOString().split('T')[0],
          hospital: formData.hospital,
          exam_type: formData.examType,
          height: formData.height,
          weight: formData.weight,
          systolic_pressure: parseInt(formData.systolicPressure),
          diastolic_pressure: parseInt(formData.diastolicPressure),
          heart_rate: formData.heartRate,
          temperature: formData.temperature,
          exam_items: formData.examItems,
          result: formData.result,
          abnormal_items: formData.result === 'abnormal' ? formData.abnormalItems : [],
          doctor_advice: formData.doctorAdvice,
          next_exam_date: formData.nextExamDate ? formData.nextExamDate.toISOString().split('T')[0] : null,
          notes: formData.notes
        }
        result = await recordsApi.createPhysicalExam(physicalData)
        
        // 上传报告（如果有）
        if (formData.reports && formData.reports.length > 0) {
          for (const file of formData.reports) {
            await recordsApi.uploadPhysicalExamReport(result.id, file.raw)
          }
        }
        break
    }
    
    ElMessage.success('记录添加成功')
    addRecordDialogVisible.value = false
    
    // 刷新数据
    await fetchHealthData()
  } catch (error) {
    console.error('提交记录失败:', error)
    ElMessage.error('记录添加失败，请重试')
  }
}

// 获取健康数据
const fetchHealthData = async () => {
  try {
    loading.value = true
    
    // 获取健康总览数据
    const overviewResponse = await axios.get(`${API_BASE_URL}/overview/summary/`)
    const overviewData = overviewResponse.data
    
    // 更新统计数据
    healthStats.value = {
      medical_records: {
        total: overviewData.medical_records_count || 0,
        recent: overviewData.recent_medical_records || [],
        by_department: overviewData.medical_records_by_department || []
      },
      medication_records: {
        total: overviewData.medication_records_count || 0,
        active: overviewData.active_medication_records_count || 0,
        recent: overviewData.recent_medication_records || []
      },
      vaccination_records: {
        total: overviewData.vaccination_records_count || 0,
        pending_next_dose: overviewData.pending_vaccination_records_count || 0,
        recent: overviewData.recent_vaccination_records || []
      },
      physical_exams: {
        total: overviewData.physical_exam_count || 0,
        abnormal: overviewData.abnormal_physical_exam_count || 0,
        recent: overviewData.recent_physical_exams || []
      }
    }
    
    // 获取异常器官数据
    const abnormalResponse = await recordsApi.getAbnormalOrgans()
    abnormalOrgans.value = abnormalResponse.map((organ: {
      id: number
      name: string
      status: string
      description: string
    }) => ({
      id: organ.id,
      name: organ.name,
      status: organ.status,
      description: organ.description,
      position: getOrganPosition(organ.name)
    }))
    
    // 更新体检数据
    if (overviewData.last_exam) {
      latestPhysicalExam.value = {
        date: overviewData.last_exam.exam_date,
        result: overviewData.last_exam.result,
        hospital: overviewData.last_exam.hospital,
        items: overviewData.last_exam.exam_items
      }
    }
    
    // 更新最近的疫苗接种记录
    if (overviewData.latest_vaccine) {
      latestVaccination.value = {
        name: overviewData.latest_vaccine.vaccine_name,
        date: overviewData.latest_vaccine.vaccination_date,
        hospital: overviewData.latest_vaccine.hospital,
        nextDose: overviewData.latest_vaccine.next_dose_date
      }
    }
    
    // 加载健康趋势数据
    const [statsRes, trendsRes, activitiesRes] = await Promise.all([
      recordsApi.getHealthStatistics(),
      recordsApi.getHealthTrends(),
      recordsApi.getRecentActivities()
    ])
    
    healthStats.value = statsRes.data
    healthTrend.value = trendsRes.data
    recentActivities.value = activitiesRes.data
  } catch (error) {
    console.error('获取健康数据失败:', error)
    ElMessage.error('获取健康数据失败')
  } finally {
    loading.value = false
  }
}

// 获取器官在人体模型上的位置
const getOrganPosition = (organName: string) => {
  const positions: Record<string, { x: number, y: number }> = {
    '心脏': { x: 100, y: 120 },
    '肺部': { x: 100, y: 110 },
    '肝脏': { x: 85, y: 150 },
    '胃': { x: 100, y: 165 },
    '胰腺': { x: 95, y: 175 },
    '肠道': { x: 100, y: 190 }
  }
  return positions[organName] || { x: 0, y: 0 }
}

// 刷新健康数据
const refreshHealthData = () => {
  fetchHealthData()
}

// 页面导航
const navigateTo = (path: string) => {
  router.push(`/${path}`)
}

// 退出登录
const logout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请重试')
  }
}

// 初始化
onMounted(() => {
  // 加载初始数据
  fetchHealthData()
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 24px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.user-profile-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.user-details p {
  margin: 0 0 4px;
  color: var(--el-text-color-secondary);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 90px;
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--el-color-primary);
}

.stat-label {
  font-size: 14px;
  margin: 0;
  color: var(--el-text-color-secondary);
}

.announcement-card {
  height: 100%;
}

.announcements {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.announcement-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.announcement-icon {
  flex-shrink: 0;
  padding-top: 4px;
}

.announcement-content {
  flex: 1;
}

.announcement-content h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.announcement-content p {
  margin: 0 0 8px;
  color: var(--el-text-color-regular);
}

.announcement-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.body-model-card {
  margin-bottom: 24px;
}

.body-model-wrapper {
  height: 500px;
}

.feature-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.feature-content p {
  margin: 0;
  text-align: center;
  color: var(--el-text-color-regular);
}

@media (max-width: 992px) {
  .user-profile-summary {
    flex-direction: column;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .stat-item {
    margin-bottom: 16px;
  }
  
  .body-model-wrapper {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .body-model-wrapper {
    height: 350px;
  }
}

.mt-4 {
  margin-top: 1rem;
}
</style> 