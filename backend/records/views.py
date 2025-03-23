from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.views.generic import ListView, CreateView
from .models import MedicalRecord, MedicationRecord, VaccinationRecord, PhysicalExam, MedicalAttachment
from .serializers import (
    MedicalRecordSerializer,
    MedicationRecordSerializer,
    VaccinationRecordSerializer,
    PhysicalExamSerializer,
    MedicalAttachmentSerializer
)
from .permissions import IsOwnerOrStaff
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count
from django.shortcuts import render
from django.utils import timezone
from datetime import date

# 辅助函数：计算年龄
def calculate_age(birth_date):
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

class BaseRecordViewSet(viewsets.ModelViewSet):
    """所有记录视图集的基类"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """只返回当前用户的记录"""
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        """创建记录时自动关联当前用户"""
        serializer.save(user=self.request.user)

class MedicalRecordViewSet(BaseRecordViewSet):
    """就医记录视图集"""
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        """获取当前用户的就医记录"""
        queryset = self.queryset
        
        # 筛选条件
        hospital = self.request.query_params.get('hospital', None)
        department = self.request.query_params.get('department', None)
        start_date = self.request.query_params.get('startDate', None)
        end_date = self.request.query_params.get('endDate', None)

        if hospital:
            queryset = queryset.filter(hospital__icontains=hospital)
        if department:
            queryset = queryset.filter(department=department)
        if start_date:
            queryset = queryset.filter(visit_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(visit_date__lte=end_date)

        return queryset.order_by('-visit_date')

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取就医记录统计信息"""
        stats = self.get_queryset().aggregate(
            total=Count('id'),
            hospital_count=Count('hospital', distinct=True),
            department_count=Count('department', distinct=True)
        )
        return Response(stats)

class MedicationRecordViewSet(BaseRecordViewSet):
    """用药记录视图集"""
    queryset = MedicationRecord.objects.all()
    serializer_class = MedicationRecordSerializer

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取用药记录统计信息"""
        stats = self.get_queryset().aggregate(
            total=Count('id'),
            active_medications=Count('id', filter=Q(is_long_term=True))
        )
        return Response(stats)

class VaccinationRecordViewSet(BaseRecordViewSet):
    """疫苗接种记录视图集"""
    queryset = VaccinationRecord.objects.all()
    serializer_class = VaccinationRecordSerializer

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取疫苗接种统计信息"""
        stats = self.get_queryset().aggregate(
            total=Count('id'),
            pending_next_dose=Count('id', filter=Q(next_dose_date__isnull=False))
        )
        return Response(stats)

class PhysicalExamViewSet(BaseRecordViewSet):
    """体检记录视图集"""
    queryset = PhysicalExam.objects.all()
    serializer_class = PhysicalExamSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """获取用户的体检报告"""
        return self.queryset

    def perform_create(self, serializer):
        """关联当前用户并验证数据"""
        # 手动验证血压格式（补充序列化器验证）
        bp = serializer.validated_data.get('blood_pressure')
        if bp and len(bp.split('/')) != 2:
            raise ValidationError({'blood_pressure': '血压格式错误'})
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取体检记录统计信息"""
        stats = self.get_queryset().aggregate(
            total=Count('id'),
            abnormal_count=Count('id', filter=Q(result='abnormal'))
        )
        return Response(stats)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """获取最近一次体检报告"""
        exam = self.get_queryset().last()
        serializer = self.get_serializer(exam)
        return Response(serializer.data)
        
    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """获取体检报告详情，包含异常项目标记"""
        exam = self.get_object()
        
        # 基本报告数据
        exam_data = self.get_serializer(exam).data
        
        # 添加用户信息
        user_data = {
            'user_name': exam.user.get_full_name() or exam.user.username,
            'gender': getattr(exam.user, 'gender', '未知'),
            'age': calculate_age(getattr(exam.user, 'birth_date', None)),
            'exam_id': f"{exam.id:012d}"  # 格式化为12位数字
        }
        
        # 模拟异常项目数据
        # 实际项目中应该从体检报告解析或诊断系统获取
        blood_pressure = exam.blood_pressure.split('/')
        systolic = int(blood_pressure[0]) if len(blood_pressure) > 0 else 0
        diastolic = int(blood_pressure[1]) if len(blood_pressure) > 1 else 0
        
        abnormal_items = []
        
        # 血压判断
        if systolic > 140 or diastolic > 90:
            abnormal_items.append({
                'name': '高血压',
                'severity': 'moderate',
                'description': f'血压值偏高({exam.blood_pressure} mmHg)，正常范围应小于140/90 mmHg。',
                'suggestion': '控制饮食，减少盐分摄入，适当运动，心内科随诊。',
                'position': {'top': 35, 'left': 58}
            })
        elif systolic < 90 or diastolic < 60:
            abnormal_items.append({
                'name': '低血压',
                'severity': 'mild',
                'description': f'血压值偏低({exam.blood_pressure} mmHg)，正常范围应大于90/60 mmHg。',
                'suggestion': '多补充水分，适量增加盐分摄入，必要时就医。',
                'position': {'top': 35, 'left': 58}
            })
            
        # BMI判断
        bmi = exam.calculate_bmi()
        if bmi and bmi > 28:
            abnormal_items.append({
                'name': '肥胖',
                'severity': 'moderate',
                'description': f'体重指数(BMI)为{bmi}，属于肥胖。',
                'suggestion': '控制饮食，增加运动量，营养科随诊。',
                'position': {'top': 45, 'left': 50}
            })
        elif bmi and bmi > 24:
            abnormal_items.append({
                'name': '超重',
                'severity': 'mild',
                'description': f'体重指数(BMI)为{bmi}，属于超重。',
                'suggestion': '注意饮食健康，适量运动。',
                'position': {'top': 45, 'left': 50}
            })
        
        # 血糖判断
        if hasattr(exam, 'blood_glucose') and exam.blood_glucose:
            if exam.blood_glucose > 6.1:
                abnormal_items.append({
                    'name': '血糖偏高',
                    'severity': 'moderate',
                    'description': f'空腹血糖值为{exam.blood_glucose} mmol/L，正常范围为3.9-6.1 mmol/L。',
                    'suggestion': '控制碳水化合物摄入，内分泌科随诊。',
                    'position': {'top': 55, 'left': 45}
                })
            elif exam.blood_glucose < 3.9:
                abnormal_items.append({
                    'name': '血糖偏低',
                    'severity': 'mild',
                    'description': f'空腹血糖值为{exam.blood_glucose} mmol/L，正常范围为3.9-6.1 mmol/L。',
                    'suggestion': '定时进食，避免空腹。',
                    'position': {'top': 55, 'left': 45}
                })
        
        # 胆固醇判断
        if hasattr(exam, 'cholesterol') and exam.cholesterol:
            if exam.cholesterol > 5.2:
                abnormal_items.append({
                    'name': '胆固醇偏高',
                    'severity': 'moderate',
                    'description': f'总胆固醇值为{exam.cholesterol} mmol/L，正常范围应小于5.2 mmol/L。',
                    'suggestion': '控制油脂摄入，多食用富含膳食纤维的食物，心内科随诊。',
                    'position': {'top': 45, 'left': 68}
                })
        
        # 合并结果
        result = {**exam_data, **user_data, 'abnormal_items': abnormal_items}
        return Response(result)

class MedicalAttachmentViewSet(BaseRecordViewSet):
    queryset = MedicalAttachment.objects.all()
    serializer_class = MedicalAttachmentSerializer
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        """上传附件"""
        record = self.get_object()
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response({'error': '没有文件上传'}, status=status.HTTP_400_BAD_REQUEST)

        attachment = MedicalAttachment.objects.create(
            record=record,
            name=file_obj.name,
            file=file_obj,
            size=file_obj.size
        )

        serializer = MedicalAttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def delete_attachment(self, request, pk=None):
        """删除附件"""
        attachment_id = request.query_params.get('attachment_id')
        if not attachment_id:
            return Response({'error': '未指定附件ID'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = MedicalAttachment.objects.get(
                id=attachment_id,
                record_id=pk,
                record__user=request.user
            )
            # 删除文件
            if default_storage.exists(attachment.file.name):
                default_storage.delete(attachment.file.name)
            attachment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MedicalAttachment.DoesNotExist:
            return Response({'error': '附件不存在'}, status=status.HTTP_404_NOT_FOUND)

class HealthOverviewAPI(viewsets.ViewSet):
    """健康总览API"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取健康记录总览统计"""
        user = request.user
        medical_records = MedicalRecord.objects.filter(user=user)
        medication_records = MedicationRecord.objects.filter(user=user)
        vaccination_records = VaccinationRecord.objects.filter(user=user)
        physical_exams = PhysicalExam.objects.filter(user=user)

        stats = {
            'medical_records': {
                'total': medical_records.count(),
                'recent': medical_records.order_by('-visit_date')[:5],
                'by_department': medical_records.values('department').annotate(count=Count('id'))
            },
            'medication_records': {
                'total': medication_records.count(),
                'active': medication_records.filter(is_long_term=True).count(),
                'recent': medication_records.order_by('-start_date')[:5]
            },
            'vaccination_records': {
                'total': vaccination_records.count(),
                'pending_next_dose': vaccination_records.filter(next_dose_date__isnull=False).count(),
                'recent': vaccination_records.order_by('-vaccination_date')[:5]
            },
            'physical_exams': {
                'total': physical_exams.count(),
                'abnormal': physical_exams.filter(result='abnormal').count(),
                'recent': physical_exams.order_by('-exam_date')[:5]
            }
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def health_trends(self, request):
        """获取健康趋势数据"""
        user = request.user
        physical_exams = PhysicalExam.objects.filter(user=user).order_by('exam_date')
        
        trends = {
            'dates': [],
            'weight': [],
            'systolic_pressure': [],
            'diastolic_pressure': [],
            'heart_rate': []
        }
        
        for exam in physical_exams:
            trends['dates'].append(exam.exam_date)
            trends['weight'].append(exam.weight)
            trends['systolic_pressure'].append(exam.systolic_pressure)
            trends['diastolic_pressure'].append(exam.diastolic_pressure)
            trends['heart_rate'].append(exam.heart_rate)
        
        return Response(trends)

    @action(detail=False, methods=['get'])
    def recent_activities(self, request):
        """获取最近的健康活动"""
        user = request.user
        
        # 获取所有类型的最近记录
        medical = MedicalRecord.objects.filter(user=user).order_by('-visit_date')[:5]
        medication = MedicationRecord.objects.filter(user=user).order_by('-start_date')[:5]
        vaccination = VaccinationRecord.objects.filter(user=user).order_by('-vaccination_date')[:5]
        physical = PhysicalExam.objects.filter(user=user).order_by('-exam_date')[:5]
        
        activities = []
        
        # 合并并排序所有活动
        for record in medical:
            activities.append({
                'type': 'medical',
                'date': record.visit_date,
                'description': f'就医于{record.hospital}{record.department}',
                'id': record.id
            })
            
        for record in medication:
            activities.append({
                'type': 'medication',
                'date': record.start_date,
                'description': f'开始服用{record.medication_name}',
                'id': record.id
            })
            
        for record in vaccination:
            activities.append({
                'type': 'vaccination',
                'date': record.vaccination_date,
                'description': f'接种{record.vaccine_name}疫苗',
                'id': record.id
            })
            
        for record in physical:
            activities.append({
                'type': 'physical',
                'date': record.exam_date,
                'description': f'在{record.hospital}进行体检',
                'id': record.id
            })
        
        # 按日期排序，最近的在前
        activities.sort(key=lambda x: x['date'], reverse=True)
        
        return Response(activities[:10])  # 只返回最近的10条活动

class RecordListView(ListView):
    """展示记录列表的视图"""
    model = MedicalRecord
    template_name = 'records/record_list.html'
    context_object_name = 'records'

    def get_queryset(self):
        """返回当前用户的记录列表"""
        return MedicalRecord.objects.filter(user=self.request.user)

class RecordCreateView(CreateView):
    """处理记录创建的视图"""
    model = MedicalRecord
    fields = ['record_type', 'diagnosis', 'symptoms', 'treatment', 'occurrence_date', 'attachment']
    template_name = 'records/record_form.html'

    def form_valid(self, form):
        """在保存表单之前设置用户"""
        form.instance.user = self.request.user
        return super().form_valid(form)

