from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that uses identifier username or email
    """
    identifier = serializers.CharField()
    password = serializers.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)

    def validate(self, attrs):
        from .models import PlataformaUser
        from django.contrib.auth.hashers import check_password
        
        identifier = attrs.get('identifier')
        password = attrs.get('password')

        # Find user by username or email
        user = PlataformaUser.objects.filter(username=identifier).first()
        if not user:
            user = PlataformaUser.objects.filter(email=identifier).first()

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
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = super().get_token(user)
        refresh['username'] = user.username
        refresh['email'] = user.email
        
        return refresh


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer