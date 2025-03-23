import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 定义体检记录相关接口
export interface PhysicalExam {
  id?: number
  user_id?: number
  exam_date: string
  hospital: string
  exam_type: string
  height: number
  weight: number
  systolic_pressure: number
  diastolic_pressure: number
  heart_rate: number
  temperature: number
  exam_items: string[]
  result: 'normal' | 'abnormal'
  abnormal_items?: { name: string; value: string; reference: string }[]
  doctor_advice?: string
  next_exam_date?: string
  notes?: string
}

export interface PhysicalExamReport {
  id: number
  physical_exam_id: number
  report_file: string
  upload_date: string
}

// 定义就医记录相关接口
export interface MedicalRecord {
  id?: number
  user_id?: number
  visit_date: string
  hospital: string
  department: string
  doctor_name?: string
  reason: string
  diagnosis?: string
  prescriptions?: string[]
  notes?: string
}

export interface MedicalRecordAttachment {
  id: number
  medical_record_id: number
  file_path: string
  file_type: string
  upload_date: string
}

// 定义用药记录相关接口
export interface MedicationRecord {
  id?: number
  user_id?: number
  medication_name: string
  medication_type: string
  specification?: string
  dosage: string
  start_date: string
  end_date?: string
  is_long_term: boolean
  reminder_days?: number[]
  reminder_times?: string[]
  symptoms?: string
  side_effects?: string
  notes?: string
}

export interface MedicationImage {
  id: number
  medication_record_id: number
  image_path: string
  upload_date: string
}

// 定义疫苗接种记录相关接口
export interface VaccinationRecord {
  id?: number
  user_id?: number
  vaccine_name: string
  vaccine_type: string
  hospital: string
  vaccination_date: string
  dose_number: number
  batch_number?: string
  manufacturer?: string
  site: string
  next_dose_date?: string
  reactions?: string[]
  allergy_details?: string
  notes?: string
}

export interface VaccinationCertificate {
  id: number
  vaccination_record_id: number
  certificate_path: string
  upload_date: string
}

export const recordsApi = {
  // 体检记录相关API
  getPhysicalExams: async () => {
    const response = await axios.get(`${API_BASE_URL}/physical-exam/`)
    return response.data
  },
  
  getPhysicalExam: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/physical-exam/${id}/`)
    return response.data
  },
  
  createPhysicalExam: async (data: PhysicalExam) => {
    const response = await axios.post(`${API_BASE_URL}/physical-exam/`, data)
    return response.data
  },
  
  updatePhysicalExam: async (id: number, data: Partial<PhysicalExam>) => {
    const response = await axios.put(`${API_BASE_URL}/physical-exam/${id}/`, data)
    return response.data
  },
  
  deletePhysicalExam: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/physical-exam/${id}/`)
    return response.data
  },

  // 上传体检报告
  uploadPhysicalExamReport: async (physicalExamId: number, file: File) => {
    const formData = new FormData()
    formData.append('report_file', file)
    formData.append('physical_exam_id', physicalExamId.toString())
    
    const response = await axios.post(`${API_BASE_URL}/physical-exam-reports/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  // 获取体检报告详情
  getPhysicalExamReport: async (physicalExamId: number) => {
    const response = await axios.get(`${API_BASE_URL}/physical-exam-reports/physical-exam/${physicalExamId}/`)
    return response.data
  },
  
  // 医疗记录相关API
  getMedicalRecords: async () => {
    const response = await axios.get(`${API_BASE_URL}/medical/`)
    return response.data
  },
  
  getMedicalRecord: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/medical/${id}/`)
    return response.data
  },
  
  createMedicalRecord: async (data: MedicalRecord) => {
    const response = await axios.post(`${API_BASE_URL}/medical/`, data)
    return response.data
  },
  
  updateMedicalRecord: async (id: number, data: Partial<MedicalRecord>) => {
    const response = await axios.put(`${API_BASE_URL}/medical/${id}/`, data)
    return response.data
  },
  
  deleteMedicalRecord: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/medical/${id}/`)
    return response.data
  },
  
  uploadMedicalRecordAttachment: async (medicalRecordId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('medical_record_id', medicalRecordId.toString())
    
    const response = await axios.post(`${API_BASE_URL}/medical-record-attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  // 用药记录相关API
  getMedicationRecords: async () => {
    const response = await axios.get(`${API_BASE_URL}/medication/`)
    return response.data
  },
  
  getMedicationRecord: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/medication/${id}/`)
    return response.data
  },
  
  createMedicationRecord: async (data: MedicationRecord) => {
    const response = await axios.post(`${API_BASE_URL}/medication/`, data)
    return response.data
  },
  
  updateMedicationRecord: async (id: number, data: Partial<MedicationRecord>) => {
    const response = await axios.put(`${API_BASE_URL}/medication/${id}/`, data)
    return response.data
  },
  
  deleteMedicationRecord: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/medication/${id}/`)
    return response.data
  },
  
  uploadMedicationImage: async (medicationRecordId: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('medication_record_id', medicationRecordId.toString())
    
    const response = await axios.post(`${API_BASE_URL}/medication-images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  // 疫苗接种记录相关API
  getVaccinationRecords: async () => {
    const response = await axios.get(`${API_BASE_URL}/vaccination/`)
    return response.data
  },
  
  getVaccinationRecord: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/vaccination/${id}/`)
    return response.data
  },
  
  createVaccinationRecord: async (data: VaccinationRecord) => {
    const response = await axios.post(`${API_BASE_URL}/vaccination/`, data)
    return response.data
  },
  
  updateVaccinationRecord: async (id: number, data: Partial<VaccinationRecord>) => {
    const response = await axios.put(`${API_BASE_URL}/vaccination/${id}/`, data)
    return response.data
  },
  
  deleteVaccinationRecord: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/vaccination/${id}/`)
    return response.data
  },
  
  uploadVaccinationCertificate: async (vaccinationRecordId: number, file: File) => {
    const formData = new FormData()
    formData.append('certificate', file)
    formData.append('vaccination_record_id', vaccinationRecordId.toString())
    
    const response = await axios.post(`${API_BASE_URL}/vaccination-certificates/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  // 获取异常器官数据
  getAbnormalOrgans: async () => {
    const response = await axios.get(`${API_BASE_URL}/overview/abnormal-organs/`)
    return response.data
  },

  // 获取器官详细信息
  getOrganDetails: async (organId: number) => {
    const response = await axios.get(`${API_BASE_URL}/overview/organs/${organId}/`)
    return response.data
  },

  // 健康概览相关API
  getHealthStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/overview/statistics/`)
    return response.data
  },

  getHealthTrends: async () => {
    const response = await axios.get(`${API_BASE_URL}/overview/health-trends/`)
    return response.data
  },

  getRecentActivities: async () => {
    const response = await axios.get(`${API_BASE_URL}/overview/recent-activities/`)
    return response.data
  },

  // 各类记录统计
  getMedicalStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/medical/statistics/`)
    return response.data
  },

  getMedicationStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/medication/statistics/`)
    return response.data
  },

  getVaccinationStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/vaccination/statistics/`)
    return response.data
  },

  getPhysicalExamStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/physical-exam/statistics/`)
    return response.data
  }
} 