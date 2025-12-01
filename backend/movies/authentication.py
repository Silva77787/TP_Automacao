from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import PlataformaUser
from django.contrib.auth.hashers import check_password
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that uses ONLY email for login
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = PlataformaUser.objects.filter(email=email).first()
        if not user or not check_password(password, user.password):
            raise serializers.ValidationError({'error': 'Invalid credentials'})

        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email,
        }
        return data

    @classmethod
    def get_token(cls, user):
        refresh = super().get_token(user)
        refresh['username'] = user.username
        refresh['email'] = user.email
        return refresh


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer