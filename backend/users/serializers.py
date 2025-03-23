from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import FamilyRelationship
from django.contrib.auth.password_validation import validate_password

# 获取自定义用户模型
CustomUser = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    自定义JWT令牌获取序列化器
    扩展默认实现以包含更多用户信息
    """
    def validate(self, attrs):
        """重写验证方法添加自定义逻辑"""
        # 调用父类验证获取基础令牌
        data = super().validate(attrs)
        # 确保返回access和refresh令牌
        refresh = self.get_token(self.user)
        data['access'] = str(refresh.access_token)
        data['refresh'] = str(refresh)
        # 添加用户信息到响应中
        data['user'] = UserSerializer(self.user).data
        return data

class UserSerializer(serializers.ModelSerializer):
    """
    用户序列化器
    用于用户资料的读取与更新
    """
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'birth_date', 'blood_type', 'hobbies', 'emergency_contact'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'email': {'required': True},
            'password': {'write_only': True}
        }

    def get_family_members(self, obj):
        """获取家庭成员用户名列表"""
        return list(obj.family_members.values_list('username', flat=True))

    def update(self, instance, validated_data):
        """处理用户更新操作"""
        # 单独处理密码更新
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class FamilyRelationshipSerializer(serializers.ModelSerializer):
    """
    家庭成员关系序列化器
    用于管理用户之间的家庭关系
    """
    # 显示关系类型的中文名称
    relation_type_display = serializers.CharField(
        source='get_relation_type_display',
        read_only=True,
        label=_("关系类型显示"),
        help_text=_("关系类型的中文显示")
    )

    class Meta:
        model = FamilyRelationship
        fields = '__all__'
        extra_kwargs = {
            'from_user': {
                'read_only': True,
                'help_text': _("自动关联当前登录用户")
            },
            'verified': {
                'read_only': True,
                'help_text': _("需对方确认后才变为True")
            }
        }

    def validate_to_user(self, value):
        """验证目标用户有效性"""
        # 不能与自己建立关系
        if value == self.context['request'].user:
            raise serializers.ValidationError(_("不能添加自己为家庭成员"))
        return value

class RegisterSerializer(serializers.ModelSerializer):
    """
    用户注册序列化器
    处理新用户注册逻辑
    """
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_("确认密码"),
        help_text=_("请再次输入密码以确认")
    )
    
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        label=_("手机号码"),
        help_text=_("请输入有效的手机号码")
    )

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'phone', 'password', 'password_confirm')
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'},
                'min_length': 8,
                'help_text': _("至少8个字符，包含字母和数字")
            },
            'email': {
                'required': True,
                'help_text': _("请输入有效的电子邮件地址")
            }
        }

    def validate(self, data):
        """注册数据验证"""
        # 检查密码匹配
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': _("两次输入的密码不一致")
            })
        # 检查邮箱唯一性
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': _("该邮箱已被注册")
            })
        return data

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        """创建用户实例"""
        # 移除确认密码字段
        validated_data.pop('password_confirm')
        
        # 获取手机号（如果有）
        phone = validated_data.pop('phone', None)
        
        # 创建用户并设置密码
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # 如果有手机号，保存到用户模型
        if phone:
            # 检查是否需要创建或更新模型中的phone字段
            if hasattr(user, 'phone'):
                user.phone = phone
                user.save(update_fields=['phone'])
            
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """用户档案序列化器"""
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'birth_date', 'blood_type', 'hobbies', 'emergency_contact',
        ]
        read_only_fields = ['id']

    def validate_emergency_contact(self, value):
        """验证紧急联系人格式"""
        if value and not value.count('-') == 2:
            raise serializers.ValidationError("格式错误，请使用'姓名-关系-电话'格式")
        return value

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        return attrs

