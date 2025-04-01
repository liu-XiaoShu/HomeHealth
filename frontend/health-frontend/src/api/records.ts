import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// 健康数据API
export const getHealthOverview = () => {
  return axios.get(`${API_BASE_URL}/overview/`)
}

// 医疗记录API
export const getMedicalRecords = () => {
  return axios.get(`${API_BASE_URL}/records/medical/`)
}

export const getMedicalRecord = (id: number) => {
  return axios.get(`${API_BASE_URL}/records/medical/${id}/`)
}

export const createMedicalRecord = (data: any) => {
  return axios.post(`${API_BASE_URL}/records/medical/`, data)
}

export const updateMedicalRecord = (id: number, data: any) => {
  return axios.put(`${API_BASE_URL}/records/medical/${id}/`, data)
}

export const deleteMedicalRecord = (id: number) => {
  return axios.delete(`${API_BASE_URL}/records/medical/${id}/`)
}

// 用药记录API
export const getMedicationRecords = () => {
  return axios.get(`${API_BASE_URL}/records/medication/`)
}

export const getMedicationRecord = (id: number) => {
  return axios.get(`${API_BASE_URL}/records/medication/${id}/`)
}

export const createMedicationRecord = (data: any) => {
  return axios.post(`${API_BASE_URL}/records/medication/`, data)
}

export const updateMedicationRecord = (id: number, data: any) => {
  return axios.put(`${API_BASE_URL}/records/medication/${id}/`, data)
}

export const deleteMedicationRecord = (id: number) => {
  return axios.delete(`${API_BASE_URL}/records/medication/${id}/`)
}

// 疫苗接种API
export const getVaccinationRecords = () => {
  return axios.get(`${API_BASE_URL}/records/vaccination/`)
}

export const getVaccinationRecord = (id: number) => {
  return axios.get(`${API_BASE_URL}/records/vaccination/${id}/`)
}

export const createVaccinationRecord = (data: any) => {
  return axios.post(`${API_BASE_URL}/records/vaccination/`, data)
}

export const updateVaccinationRecord = (id: number, data: any) => {
  return axios.put(`${API_BASE_URL}/records/vaccination/${id}/`, data)
}

export const deleteVaccinationRecord = (id: number) => {
  return axios.delete(`${API_BASE_URL}/records/vaccination/${id}/`)
}

// 体检记录API
export const getPhysicalExams = () => {
  return axios.get(`${API_BASE_URL}/records/physical/`)
}

export const getPhysicalExam = (id: number) => {
  return axios.get(`${API_BASE_URL}/records/physical/${id}/`)
}

export const createPhysicalExam = (data: any) => {
  return axios.post(`${API_BASE_URL}/records/physical/`, data)
}

export const updatePhysicalExam = (id: number, data: any) => {
  return axios.put(`${API_BASE_URL}/records/physical/${id}/`, data)
}

export const deletePhysicalExam = (id: number) => {
  return axios.delete(`${API_BASE_URL}/records/physical/${id}/`)
}

// 体检报告API
export const getPhysicalExamReport = (id: string) => {
  return axios.get(`${API_BASE_URL}/records/physical/${id}/report/`)
}

// 基于类型获取记录列表
export const getRecordsList = (recordType?: string) => {
  let url = `${API_BASE_URL}/records/`
  if (recordType) {
    url += `?type=${recordType}`
  }
  return axios.get(url)
}

// 文件上传
export const uploadFile = (recordType: string, recordId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return axios.post(
    `${API_BASE_URL}/records/${recordType}/${recordId}/upload/`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

// 批量导入
export const importRecords = (recordType: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return axios.post(
    `${API_BASE_URL}/records/${recordType}/import/`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

// 导出记录
export const exportRecords = (recordType: string) => {
  return axios.get(`${API_BASE_URL}/records/${recordType}/export/`, {
    responseType: 'blob'
  })
} 