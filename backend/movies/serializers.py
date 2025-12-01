from rest_framework import serializers
from .models import Movie, Genre, Director, PlataformaUser, Review
from django.contrib.auth.hashers import make_password, check_password


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
        fields = ['username', 'email', 'joined_date']
        read_only_fields = ['username', 'joined_date']


class UserUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    password = serializers.CharField(
        write_only=True, required=False, style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, required=False, style={'input_type': 'password'}
    )

    class Meta:
        model = PlataformaUser
        fields = ['email', 'old_password', 'password', 'password_confirm']

    def validate(self, data):
        user = self.instance

        # 1) Check old password matches current password (always required)
        old_password = data.get('old_password')
        if not old_password or not check_password(old_password, user.password):
            raise serializers.ValidationError(
                {'old_password': 'Old password is incorrect'}
            )

        # 2) If password is being changed, make sure confirmation matches
        new_password = data.get('password')
        new_password_confirm = data.get('password_confirm')
        if new_password or new_password_confirm:
            if not new_password or not new_password_confirm:
                raise serializers.ValidationError(
                    {'password': 'Both password and password_confirm are required'}
                )
            if new_password != new_password_confirm:
                raise serializers.ValidationError(
                    {'password': 'Passwords must match'}
                )  

        # 3) If email is being changed, ensure it is not already used by another user
        new_email = data.get('email')
        if new_email and new_email != user.email:
            if PlataformaUser.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                raise serializers.ValidationError(
                    {'email': 'This email is already in use'}
                )

        return data

    def update(self, instance, validated_data):
        validated_data.pop('old_password', None)
        validated_data.pop('password_confirm', None)

        password = validated_data.pop('password', None)

        # Update email (if present)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update password (if present)
        if password:
            instance.password = make_password(password)

        instance.save()
        return instance

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    movie = MovieSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'username', 'rating', 'description', 'created_at', 'movie',]
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