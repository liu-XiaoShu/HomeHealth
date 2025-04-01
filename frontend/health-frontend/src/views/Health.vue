<template>
  <div class="health-check-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>系统健康状态</h2>
        </div>
      </template>
      
      <div class="status-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="item-label">前端状态:</div>
            <div class="item-value">
              <el-tag type="success">正常</el-tag>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="item-label">后端状态:</div>
            <div class="item-value">
              <el-tag :type="backendHealth.status === 'healthy' ? 'success' : 'danger'">
                {{ backendHealth.status === 'healthy' ? '正常' : '异常' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <div class="detail-section">
          <h3>详细信息</h3>
          
          <div class="detail-item">
            <span class="item-label">前端版本:</span>
            <span class="item-value">1.0.0</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">后端消息:</span>
            <span class="item-value">{{ backendHealth.message }}</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">API根路径:</span>
            <span class="item-value">{{ apiUrl }}</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">检查时间:</span>
            <span class="item-value">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="checkHealth">重新检查</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { healthCheck } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const backendHealth = ref({
  status: 'checking',
  message: '正在检查后端服务...'
})

// 检查后端健康状态
const checkHealth = async () => {
  try {
    backendHealth.value = {
      status: 'checking',
      message: '正在检查后端服务...'
    }
    
    const result = await healthCheck()
    backendHealth.value = result
    
    if (result.status === 'healthy') {
      ElMessage.success('后端服务正常')
    } else {
      ElMessage.error('后端服务异常')
    }
  } catch (error) {
    console.error('健康检查失败:', error)
    backendHealth.value = {
      status: 'unhealthy',
      message: '健康检查请求失败，无法连接到后端服务'
    }
    ElMessage.error('健康检查失败')
  }
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  checkHealth()
})
</script>

<style scoped>
.health-check-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.status-container {
  padding: 10px 0;
}

.detail-section {
  margin: 20px 0;
}

.detail-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 500;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
}

.item-label {
  font-weight: 500;
  color: #606266;
  margin-right: 10px;
  flex: 0 0 100px;
}

.item-value {
  color: #303133;
}

.actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

@media (max-width: 768px) {
  .health-check-container {
    margin: 20px auto;
  }
  
  .detail-item {
    flex-direction: column;
  }
  
  .item-label {
    margin-bottom: 5px;
  }
}
</style> 