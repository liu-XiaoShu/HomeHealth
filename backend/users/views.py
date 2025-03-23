from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, logout, authenticate
from .models import FamilyRelationship
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    FamilyRelationshipSerializer,
    CustomTokenObtainPairSerializer,
    LoginSerializer
)
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

# 获取自定义用户模型
CustomUser = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    自定义JWT登录视图
    扩展默认实现以在响应中包含用户信息
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]  # 登录不需要认证

    def post(self, request, *args, **kwargs):
        """
        处理登录POST请求
        1. 调用父类方法获取基础响应
        2. 成功时添加完整的用户信息
        3. 保持错误处理逻辑不变
        """
        # 调用父类处理JWT认证
        response = super().post(request, *args, **kwargs)
        # 登录成功时(status_code=200)添加用户数据
        if response.status_code == status.HTTP_200_OK:
            try:
                # 获取登录用户实例
                user = CustomUser.objects.get(username=request.data['username'])
                # 将用户序列化数据添加到响应中
                response.data['user'] = UserSerializer(user).data
            except CustomUser.DoesNotExist:
                # 异常处理（理论上不会发生，因为已通过认证）
                return Response(
                    {'detail': '用户不存在'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return response

class RegisterView(generics.CreateAPIView):
    """
    用户注册API端点
    允许未认证用户创建新账户
    """
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        """
        重写创建方法以自定义响应格式和错误处理
        """
        logger.info(f"收到注册请求数据: {request.data}")
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.error(f"注册数据验证失败: {serializer.errors}")
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = serializer.save()
            logger.info(f"用户注册成功: {user.username}")
            return Response(
                {
                    'detail': '注册成功',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"用户注册异常: {str(e)}")
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    用户个人资料管理端点
    支持以下操作：
    - GET /api/user/profile/ : 获取当前用户资料
    - PUT /api/user/profile/ : 完整更新用户资料
    - PATCH /api/user/profile/ : 部分更新用户资料
    """
    serializer_class = UserSerializer
    # 需要认证后才能访问
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """始终返回当前登录用户实例"""
        return self.request.user

    def perform_update(self, serializer):
        """
        处理更新操作的特殊逻辑
        1. 单独处理密码更新
        2. 普通字段的正常更新
        """
        # 提取密码字段（如果存在）
        password = self.request.data.get('password')
        if password:
            # 使用set_password方法安全更新密码
            user = self.get_object()
            user.set_password(password)
            user.save()
        # 保存其他字段的更新
        serializer.save()

class FamilyRelationshipViewSet(viewsets.ModelViewSet):
    """
    家庭成员关系管理视图集
    提供完整的CRUD操作：
    - GET /api/family/ : 列表查看当前用户的关系
    - POST /api/family/ : 创建新关系
    - GET /api/family/{id}/ : 查看单个关系详情
    - PUT /api/family/{id}/ : 更新关系
    - DELETE /api/family/{id}/ : 删除关系
    """
    serializer_class = FamilyRelationshipSerializer
    # 需要认证且只能操作自己的关系
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """过滤只返回当前用户发起的关系"""
        return FamilyRelationship.objects.filter(from_user=self.request.user)

    def perform_create(self, serializer):
        """创建时自动关联当前用户为发起者"""
        serializer.save(from_user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """删除关系前的额外验证"""
        instance = self.get_object()
        # 阻止删除已验证的关系
        if instance.verified:
            return Response(
                {'detail': '已验证的关系不可删除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """
    用户登出视图
    """
    try:
        # 获取用户令牌
        refresh_token = request.data.get('refresh', None)
        if refresh_token:
            # 将令牌加入黑名单
            token = RefreshToken(refresh_token)
            token.blacklist()
        # 清除会话
        logout(request)
        return Response({"detail": "登出成功"}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"用户登出失败: {str(e)}")
        return Response(
            {"detail": "无效的令牌或令牌已过期"},
            status=status.HTTP_400_BAD_REQUEST
        )

