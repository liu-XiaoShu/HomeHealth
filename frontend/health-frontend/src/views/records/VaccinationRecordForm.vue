<template>
  <div class="vaccination-record-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑疫苗接种记录' : '新建疫苗接种记录' }}</h2>
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
            <el-form-item label="疫苗类型" prop="vaccine_type">
              <el-select v-model="formData.vaccine_type" placeholder="请选择疫苗类型" style="width: 100%">
                <el-option label="新冠疫苗" value="CV" />
                <el-option label="流感疫苗" value="FL" />
                <el-option label="HPV疫苗" value="HPV" />
                <el-option label="乙肝疫苗" value="HB" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="剂次" prop="dose_number">
              <el-input-number
                v-model="formData.dose_number"
                :min="1"
                :max="10"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接种日期" prop="vaccination_date">
              <el-date-picker
                v-model="formData.vaccination_date"
                type="date"
                placeholder="请选择接种日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="下次接种日期" prop="next_due_date">
              <el-date-picker
                v-model="formData.next_due_date"
                type="date"
                placeholder="请选择下次接种日期（可选）"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接种机构" prop="institution">
              <el-input
                v-model="formData.institution"
                placeholder="请输入接种机构"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="疫苗批号" prop="batch_number">
              <el-input
                v-model="formData.batch_number"
                placeholder="请输入疫苗批号"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="接种部位" prop="site">
          <el-select v-model="formData.site" placeholder="请选择接种部位" style="width: 100%">
            <el-option label="左上臂" value="左上臂" />
            <el-option label="右上臂" value="右上臂" />
            <el-option label="左大腿" value="左大腿" />
            <el-option label="右大腿" value="右大腿" />
            <el-option label="臀部" value="臀部" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

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

const isEdit = computed(() => !!route.params.id)
const recordId = computed(() => route.params.id)

// 初始化表单数据
const formData = reactive({
  vaccine_type: 'CV',
  dose_number: 1,
  vaccination_date: '',
  next_due_date: '',
  institution: '',
  batch_number: '',
  site: '左上臂',
  notes: ''
})

const rules = {
  vaccine_type: [
    { required: true, message: '请选择疫苗类型', trigger: 'change' }
  ],
  dose_number: [
    { required: true, message: '请输入剂次', trigger: 'blur' }
  ],
  vaccination_date: [
    { required: true, message: '请选择接种日期', trigger: 'change' }
  ],
  institution: [
    { required: true, message: '请输入接种机构', trigger: 'blur' },
    { max: 200, message: '接种机构不能超过200个字符', trigger: 'blur' }
  ],
  site: [
    { required: true, message: '请选择接种部位', trigger: 'change' }
  ]
}

// 获取疫苗接种记录详情
const fetchVaccinationRecord = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const response = await fetch(`/api/vaccination/${recordId.value}/`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('获取疫苗接种记录失败')
    }
    
    const data = await response.json()
    
    // 填充表单数据
    formData.vaccine_type = data.vaccine_type
    formData.dose_number = data.dose_number
    formData.vaccination_date = data.vaccination_date
    formData.next_due_date = data.next_due_date
    formData.institution = data.institution
    formData.batch_number = data.batch_number
    formData.site = data.site || '左上臂'
    formData.notes = data.notes
  } catch (error) {
    console.error('获取疫苗接种记录失败:', error)
    ElMessage.error('获取疫苗接种记录失败')
    router.push('/records/vaccination')
  } finally {
    loading.value = false
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
        ? `/api/vaccination/${recordId.value}/`
        : '/api/vaccination/'
      
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
        router.push('/records/vaccination')
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
onMounted(() => {
  if (isEdit.value) {
    fetchVaccinationRecord()
  }
})
</script>

<style scoped>
.vaccination-record-form {
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