from rest_framework import serializers
from .models import Movie, Genre, Director, PlataformaUser, Review
from django.contrib.auth.hashers import make_password


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'gerne_name']

class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = ['id', 'name', 'biography']

class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    directors = DirectorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_date', 'rating', 'total_ratings', 'image', 'genres', 'directors']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = PlataformaUser
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords must match'})
        
        # Check if username exists
        if PlataformaUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({'username': 'Username already exists'})
        
        # Check if email exists
        if PlataformaUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Email already exists'})
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = PlataformaUser(**validated_data)
        user.password = make_password(password)
        user.save()
        return user

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlataformaUser
        fields = ['username', 'email']
        read_only_fields = ['username']


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = PlataformaUser
        fields = ['email', 'password', 'password_confirm']

    def validate(self, data):
        if 'password' in data and 'password_confirm' in data:
            if data['password'] != data['password_confirm']:
                raise serializers.ValidationError({'password': 'Passwords must match'})
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.password = make_password(password)
        
        instance.save()
        return instance

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'movie', 'rating', 'description', 'created_at']
        read_only_fields = ['created_at', 'id']


class MovieDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    directors = DirectorSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_date', 'rating', 'total_ratings', 'image', 'genres', 'directors', 'reviews']

    def get_reviews(self, obj):
        reviews = Review.objects.filter(movie=obj)
        return ReviewSerializer(reviews, many=True).data