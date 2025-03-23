# records/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicalRecordViewSet,
    MedicationRecordViewSet,
    VaccinationRecordViewSet,
    PhysicalExamViewSet,
    MedicalAttachmentViewSet,
    RecordListView,
    RecordCreateView,
    HealthOverviewAPI
)

router = DefaultRouter()
router.register(r'medical', MedicalRecordViewSet)
router.register(r'medication', MedicationRecordViewSet)
router.register(r'vaccination', VaccinationRecordViewSet)
router.register(r'physical-exam', PhysicalExamViewSet)
router.register(r'attachments', MedicalAttachmentViewSet)
router.register(r'overview', HealthOverviewAPI, basename='overview')

app_name = 'records'

urlpatterns = [
    path('', include(router.urls)),
    # 示例路由配置
    path('list/', RecordListView.as_view(), name='record_list'),
    path('create/', RecordCreateView.as_view(), name='record_create'),
]
