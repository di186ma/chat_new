from rest_framework import serializers
from .models import Room, Message, User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=3,
        error_messages={
            'min_length': 'Пароль должен содержать минимум 3 символа',
            'required': 'Пароль обязателен'
        }
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        min_length=3,
        error_messages={
            'min_length': 'Пароль должен содержать минимум 3 символа',
            'required': 'Подтверждение пароля обязательно'
        }
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'password2']
        extra_kwargs = {
            'username': {
                'required': True,
                'min_length': 3,
                'error_messages': {
                    'min_length': 'Имя пользователя должно содержать минимум 3 символа',
                    'required': 'Имя пользователя обязательно'
                }
            }
        }

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать минимум 3 символа")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class RoomSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'creator', 'created_at']
        read_only_fields = ['creator', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'room', 'user', 'username', 'content', 'created_at']
        read_only_fields = ['user', 'created_at', 'username'] 