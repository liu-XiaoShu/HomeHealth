<template>
  <div class="medication-record-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑用药记录' : '新建用药记录' }}</h2>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-card v-loading="loading">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品名称" prop="drug_name">
              <el-input
                v-model="formData.drug_name"
                placeholder="请输入药品名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="剂量规格" prop="dosage">
              <el-input
                v-model="formData.dosage"
                placeholder="请输入用药剂量，如：5mg/片"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用药频率" prop="frequency">
              <el-select v-model="formData.frequency" placeholder="请选择用药频率" style="width: 100%">
                <el-option label="每日一次" value="QD" />
                <el-option label="每日两次" value="BID" />
                <el-option label="每日三次" value="TID" />
                <el-option label="每周一次" value="QW" />
                <el-option label="按需服用" value="PRN" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="开始日期" prop="start_date">
              <el-date-picker
                v-model="formData.start_date"
                type="date"
                placeholder="请选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结束日期" prop="end_date">
              <el-date-picker
                v-model="formData.end_date"
                type="date"
                placeholder="请选择结束日期（可选）"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="关联就医记录" prop="medical_record">
              <el-select v-model="formData.medical_record" placeholder="请选择关联就医记录" style="width: 100%">
                <el-option
                  v-for="record in medicalRecords"
                  :key="record.id"
                  :label="`${record.hospital} - ${record.visit_date}`"
                  :value="record.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用提醒" prop="reminder_enabled">
              <el-switch v-model="formData.reminder_enabled" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="提醒时间" prop="reminder_time" v-if="formData.reminder_enabled">
              <el-time-picker
                v-model="formData.reminder_time"
                placeholder="请选择提醒时间"
                format="HH:mm"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <div class="form-actions">
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" native-type="submit" :loading="submitting">
            保存
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// import type { FormInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)
const medicalRecords = ref([])

const isEdit = computed(() => !!route.params.id)
const recordId = computed(() => route.params.id)

// 初始化表单数据
const formData = reactive({
  drug_name: '',
  dosage: '',
  frequency: 'QD',
  start_date: '',
  end_date: '',
  reminder_enabled: false,
  reminder_time: null,
  medical_record: '',
  notes: ''
})

// 表单验证规则
const rules = {
  drug_name: [
    { required: true, message: '请输入药品名称', trigger: 'blur' },
    { max: 100, message: '药品名称不能超过100个字符', trigger: 'blur' }
  ],
  dosage: [
    { required: true, message: '请输入用药剂量', trigger: 'blur' }
  ],
  frequency: [
    { required: true, message: '请选择服用频率', trigger: 'change' }
  ],
  start_date: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  medical_record: [
    { required: true, message: '请选择关联就医记录', trigger: 'change' }
  ],
  reminder_time: [
    { 
      required: true, 
      message: '启用提醒时必须设置提醒时间', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (formData.reminder_enabled && !value) {
          callback(new Error('启用提醒时必须设置提醒时间'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 获取用药记录详情
const fetchMedicationRecord = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const response = await fetch(`/api/medication/${recordId.value}/`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('获取用药记录失败')
    }
    
    const data = await response.json()
    
    // 填充表单数据
    formData.drug_name = data.drug_name
    formData.dosage = data.dosage
    formData.frequency = data.frequency
    formData.start_date = data.start_date
    formData.end_date = data.end_date
    formData.reminder_enabled = data.reminder_enabled
    formData.reminder_time = data.reminder_time
    formData.medical_record = data.medical_record
    formData.notes = data.notes
  } catch (error) {
    console.error('获取用药记录失败:', error)
    ElMessage.error('获取用药记录失败')
    router.push('/records/medication')
  } finally {
    loading.value = false
  }
}

// 获取就医记录列表，用于关联选择
const fetchMedicalRecords = async () => {
  try {
    const response = await fetch('/api/medical/', {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('获取就医记录列表失败')
    }
    
    const data = await response.json()
    medicalRecords.value = data
  } catch (error) {
    console.error('获取就医记录列表失败:', error)
    ElMessage.error('获取就医记录列表失败')
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const url = isEdit.value
        ? `/api/medication/${recordId.value}/`
        : '/api/medication/'
      
      const response = await fetch(url, {
        method: isEdit.value ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        router.push('/records/medication')
      } else {
        // 处理错误响应
        const errorMsg = typeof data === 'object' 
          ? Object.values(data).flat().join(', ') 
          : '提交失败，请检查表单'
        ElMessage.error(errorMsg)
      }
    } catch (error) {
      console.error(isEdit.value ? '更新失败:' : '创建失败:', error)
      ElMessage.error('提交失败，请检查网络连接')
    } finally {
      submitting.value = false
    }
  })
}

// 生命周期钩子
onMounted(async () => {
  await fetchMedicalRecords()
  if (isEdit.value) {
    await fetchMedicationRecord()
  }
})
</script>

<style scoped>
.medication-record-form {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style> 