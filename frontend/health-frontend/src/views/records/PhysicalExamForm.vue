<template>
  <div class="physical-exam-form">
    <div class="page-header">
      <div class="page-title">{{ isEdit ? '编辑体检记录' : '新建体检记录' }}</div>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <div class="app-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="exam-form"
        v-loading="loading"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="体检日期" prop="exam_date">
                <el-date-picker
                  v-model="form.exam_date"
                  type="date"
                  placeholder="选择日期"
                  :disabled-date="disableFutureDate"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="体检类型" prop="exam_type">
                <el-select v-model="form.exam_type" placeholder="请选择" style="width: 100%">
                  <el-option label="年度体检" value="annual" />
                  <el-option label="入职体检" value="employment" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="体检医院" prop="hospital">
            <el-input v-model="form.hospital" placeholder="请输入体检医院名称" />
          </el-form-item>
        </div>

        <!-- 体检指标 -->
        <div class="form-section">
          <h3>体检指标</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="身高(cm)" prop="height">
                <el-input-number
                  v-model="form.height"
                  :min="0"
                  :max="300"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="体重(kg)" prop="weight">
                <el-input-number
                  v-model="form.weight"
                  :min="0"
                  :max="500"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="BMI">
                <el-input :value="calculateBMI" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="血压" prop="blood_pressure">
                <el-input
                  v-model="form.blood_pressure"
                  placeholder="例如: 120/80"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="血糖(mmol/L)" prop="blood_sugar">
                <el-input-number
                  v-model="form.blood_sugar"
                  :min="0"
                  :max="30"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="心率(次/分)" prop="heart_rate">
                <el-input-number
                  v-model="form.heart_rate"
                  :min="0"
                  :max="300"
                  :precision="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 体检结果 -->
        <div class="form-section">
          <h3>体检结果</h3>
          <el-form-item label="体检总结" prop="summary">
            <el-input
              v-model="form.summary"
              type="textarea"
              :rows="4"
              placeholder="请输入体检总结"
            />
          </el-form-item>

          <el-form-item label="医生建议" prop="doctor_advice">
            <el-input
              v-model="form.doctor_advice"
              type="textarea"
              :rows="4"
              placeholder="请输入医生建议"
            />
          </el-form-item>

          <el-form-item label="状态" prop="result">
            <el-radio-group v-model="form.result">
              <el-radio label="normal">正常</el-radio>
              <el-radio label="abnormal">异常</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 附件上传 -->
        <div class="form-section">
          <h3>附件</h3>
          <el-form-item label="体检报告" prop="attachments">
            <el-upload
              v-model:file-list="fileList"
              action="#"
              :http-request="handleCustomUpload"
              :before-upload="beforeUpload"
              :on-remove="handleRemove"
              multiple
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon>
                上传文件
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持PDF、JPG、PNG格式，单个文件不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            保存
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, FormInstance, UploadProps, UploadUserFile, UploadFile, UploadRequestOptions } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

const isEdit = computed(() => route.params.id !== undefined)
const loading = ref(false)
const submitting = ref(false)
const fileList = ref<UploadUserFile[]>([])
const pendingUploads = ref<File[]>([])

// 表单数据
const form = reactive({
  exam_date: '',
  exam_type: '',
  hospital: '',
  height: undefined,
  weight: undefined,
  blood_pressure: '',
  blood_sugar: undefined,
  heart_rate: undefined,
  summary: '',
  doctor_advice: '',
  result: 'normal',
  attachments: [] as { id: number; name: string; url: string }[]
})

// 表单验证规则
const rules = {
  exam_date: [{ required: true, message: '请选择体检日期', trigger: 'change' }],
  exam_type: [{ required: true, message: '请选择体检类型', trigger: 'change' }],
  hospital: [{ required: true, message: '请输入体检医院', trigger: 'blur' }],
  height: [{ required: true, message: '请输入身高', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入体重', trigger: 'blur' }],
  blood_pressure: [
    { required: true, message: '请输入血压', trigger: 'blur' },
    {
      pattern: /^\d{2,3}\/\d{2,3}$/,
      message: '请输入正确的血压格式，如: 120/80',
      trigger: 'blur'
    }
  ],
  result: [{ required: true, message: '请选择状态', trigger: 'change' }],
  summary: [{ required: true, message: '请输入体检总结', trigger: 'blur' }]
}

// 计算BMI
const calculateBMI = computed(() => {
  if (!form.height || !form.weight) return '-'
  const heightInMeters = form.height / 100
  const bmi = form.weight / (heightInMeters * heightInMeters)
  return bmi.toFixed(1)
})

// 禁用未来日期
const disableFutureDate = (date: Date) => {
  return date > new Date()
}

// 上传前验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传PDF/JPG/PNG格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

// 自定义上传处理
const handleCustomUpload = (options: UploadRequestOptions) => {
  // 暂存文件，等到表单提交时一起上传
  pendingUploads.value.push(options.file as File)
  // 添加到表单显示
  fileList.value.push({
    name: (options.file as File).name,
    uid: Date.now().toString(),
    status: 'ready',
  })
}

// 处理文件移除
const handleRemove: UploadProps['onRemove'] = (file: UploadFile) => {
  // 从待上传列表移除
  const pendingIndex = pendingUploads.value.findIndex(f => f.name === file.name)
  if (pendingIndex !== -1) {
    pendingUploads.value.splice(pendingIndex, 1)
  }
  
  // 如果是已有的附件，从表单数据中移除
  const existingIndex = form.attachments.findIndex(item => item.name === file.name)
  if (existingIndex !== -1) {
    form.attachments.splice(existingIndex, 1)
  }
}

// 获取记录详情
const fetchExamDetail = async (id: string) => {
  loading.value = true
  try {
    const response = await fetch(`/api/physical-exam/${id}/`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('获取体检记录失败')
    }
    
    const data = await response.json()
    
    // 更新表单数据
    form.exam_date = data.exam_date
    form.exam_type = data.exam_type
    form.hospital = data.hospital
    form.height = data.height
    form.weight = data.weight
    form.blood_pressure = data.blood_pressure
    form.blood_sugar = data.blood_sugar
    form.heart_rate = data.heart_rate
    form.summary = data.summary
    form.doctor_advice = data.doctor_advice
    form.result = data.result
    
    // 设置附件列表
    if (data.attachments && data.attachments.length > 0) {
      form.attachments = data.attachments
      fileList.value = data.attachments.map((item: any) => ({
        name: item.name,
        url: item.url,
        uid: item.id
      }))
    }
  } catch (error) {
    console.error('获取记录详情失败:', error)
    ElMessage.error('获取记录详情失败')
  } finally {
    loading.value = false
  }
}

// 上传附件
const uploadAttachments = async (examId: string) => {
  if (pendingUploads.value.length === 0) return
  
  const uploadPromises = pendingUploads.value.map(async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('physical_exam', examId)
    formData.append('name', file.name)
    
    const response = await fetch('/api/physical-exam-attachments/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1")
      },
      credentials: 'include',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`上传文件 ${file.name} 失败`)
    }
  })
  
  await Promise.all(uploadPromises)
  pendingUploads.value = [] // 清空待上传列表
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const url = isEdit.value
          ? `/api/physical-exam/${route.params.id}/`
          : '/api/physical-exam/'
        
        const response = await fetch(url, {
          method: isEdit.value ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1")
          },
          credentials: 'include',
          body: JSON.stringify(form)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            typeof errorData === 'object' 
              ? Object.values(errorData).flat().join(', ') 
              : '提交失败'
          )
        }
        
        const data = await response.json()
        
        // 上传新附件
        if (pendingUploads.value.length > 0) {
          await uploadAttachments(data.id.toString())
        }
        
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        router.push('/records/physical')
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
        console.error('提交失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 取消
const handleCancel = () => {
  router.back()
}

// 页面加载时获取详情
onMounted(() => {
  if (isEdit.value && route.params.id) {
    fetchExamDetail(route.params.id as string)
  }
})
</script>

<style scoped>
.physical-exam-form {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

:deep(.el-upload-list) {
  margin-top: 10px;
}

@media screen and (max-width: 768px) {
  .physical-exam-form {
    padding: 10px;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style> 