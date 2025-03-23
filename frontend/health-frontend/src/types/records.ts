// 体检记录类型
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

// 就医记录类型
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

// 用药记录类型
export interface MedicationRecord {
  id?: number
  medical_record: number
  drug_name: string
  dosage: string
  frequency: 'QD' | 'BID' | 'TID' | 'QW' | 'PRN'
  start_date: string
  end_date?: string
  reminder_enabled: boolean
  reminder_time?: string
  notes?: string
}

// 疫苗接种记录类型
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

// 异常器官类型
export interface AbnormalOrgan {
  id: number
  name: string
  status: 'mild' | 'moderate' | 'severe'
  description: string
  relatedRecords?: Array<{
    id: number
    type: 'physical' | 'medical' | 'medication'
    date: string
  }>
}

// 体检报告接口
export interface PhysicalExamReport {
  id: number
  user: number
  exam_date: string
  height: number
  weight: number
  blood_pressure: string
  heart_rate: number
  blood_glucose?: number
  cholesterol?: number
  report_pdf?: string
  created_at: string
}

// 分页响应接口
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// 就医记录表单数据类型
export interface MedicalRecordFormData {
  visitDate: string
  hospital: string
  department: string
  reason: string
  diagnosis: string
  prescription: string[]
  attachments?: File[]
}

// 用药记录表单数据类型
export interface MedicationRecordFormData {
  medicationName: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  sideEffects: string[]
  notes?: string
}

// 疫苗接种记录表单数据类型
export interface VaccinationRecordFormData {
  vaccineName: string
  vaccinationDate: string
  manufacturer: string
  batchNumber: string
  vaccinationSite: string
  nextDoseDate?: string
  reactions: string[]
  notes?: string
}

// 体检记录表单数据类型
export interface PhysicalExamFormData {
  examDate: string
  hospital: string
  height: number
  weight: number
  bloodPressure: string
  heartRate: number
  abnormalItems?: string[]
  attachments?: File[]
  notes?: string
}

// 健康概览数据类型
export interface HealthOverview {
  recentVisits: number
  activeMedications: number
  upcomingVaccinations: number
  latestPhysicalExam?: {
    date: string
    hospital: string
    bmi: number
  }
}

// 健康趋势数据类型
export interface HealthTrend {
  date: string
  weight?: number
  bloodPressure?: string
  heartRate?: number
  bmi?: number
}

// 最近活动数据类型
export interface RecentActivity {
  id: string
  type: 'medical' | 'medication' | 'vaccination' | 'physical'
  date: string
  title: string
  description: string
} 