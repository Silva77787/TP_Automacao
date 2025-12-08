from django.shortcuts import render
import requests
import json
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import PlataformaUser, Movie, Review
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PlataformaUser, Movie, Review, Genre, Director
from .serializers import (
    MovieSerializer, UserRegistrationSerializer, UserDetailSerializer,
    UserUpdateSerializer, ReviewSerializer, MovieDetailSerializer
)
from .authentication import CustomTokenObtainPairView
from .permissions import IsOwnerOrReadOnly

# Create your views here.

#Authentication endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    Expected fields: username, email, password, password_confirm
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                'success': True,
                'message': 'User registered successfully',
                'username': serializer.data['username'],
                'email': serializer.data['email']
            },
            status=status.HTTP_201_CREATED
        )
    return Response(
        {
            'success': False,
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


class CustomLoginView(CustomTokenObtainPairView):
    """
    Login endpoint that accepts identifier (username or email) and password
    Returns access and refresh tokens
    """
    permission_classes = [AllowAny]


# User Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, username):
    """
    Get user details by username
    """
    try:
        user = PlataformaUser.objects.get(username=username)
        serializer = UserDetailSerializer(user)
        return Response(
            {
                'success': True,
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )
    except PlataformaUser.DoesNotExist:
        return Response(
            {
                'success': False,
                'error': 'User not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def update_user(request, username):
    """
    Update user details (email and/or password)
    Only the user themselves can update their profile
    """
    # Check if user is updating their own profile
    if request.user.username != username:
        return Response(
            {
                'success': False,
                'error': 'You can only update your own profile'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = PlataformaUser.objects.get(username=username)
    except PlataformaUser.DoesNotExist:
        return Response(
            {
                'success': False,
                'error': 'User not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )

        if PlataformaUser.objects.filter(username=username).exists() or PlataformaUser.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Username or email already exists'}, status=409)

        hashed_password = make_password(password)

        try:
            user = PlataformaUser(username=username, password=hashed_password, email=email)
            user.save()
            return JsonResponse({'success': 'User registered'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        identifier = data.get('identifier')  
        password = data.get('password')

        if not identifier or not password:
            return JsonResponse({'error': 'All fields are required'}, status=400)

        user = PlataformaUser.objects.filter(username=identifier).first()
        if user is None:
            user = PlataformaUser.objects.filter(email=identifier).first()

        if user is None:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        if check_password(password, user.password):
            return JsonResponse({'success': 'Login successful', 'username': user.username}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid request'}, status=405)

@csrf_exempt
def rate_movie(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        movie_id = data.get('movie_id')
        rating = data.get('rating')
        description = data.get('description', '')
        
        if not username or not movie_id or rating is None:
            return JsonResponse({'error': 'Username, movie_id, and rating are required'}, status=400)
        
        try:
            user = PlataformaUser.objects.get(username=username)
        except PlataformaUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return JsonResponse({'error': 'Movie not found'}, status=404)
        
        from .models import Review
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                'success': True,
                'message': 'User updated successfully',
                'user': UserDetailSerializer(user).data
            },
            status=status.HTTP_200_OK
        )
    return Response(
        {
            'success': False,
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


#Movies endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def movie_catalog(request):
    """
    UC-03: Exibir Catálogo de Filmes
    Returns a list of all available movies with their details
    Requires authentication
    """
    try:
        # Step 2: Request list from database
        movies = Movie.objects.all().prefetch_related('genres', 'directors')

        # Step 3: Check if catalog is empty
        if not movies.exists():
            return Response(
                {
                    'success': False,
                    'message': 'Catálogo vazio. Nenhum filme disponível.',
                    'count': 0,
                    'movies': []
                },
                status=status.HTTP_200_OK
            )

        # Serialize and return movies
        serializer = MovieSerializer(movies, many=True)
        return Response(
            {
                'success': True,
                'message': 'Catálogo de filmes carregado com sucesso.',
                'count': movies.count(),
                'movies': serializer.data
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        # Exception: Database connection failure
        return Response(
            {
                'success': False,
                'message': f'Erro ao conectar à base de dados: {str(e)}',
                'movies': []
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_movie_details(request, movie_id):
    """
    Get local movie details with reviews AND the current user's rating
    """
    try:
        movie = Movie.objects.prefetch_related('genres', 'directors', 'review_set').get(id=movie_id)
        serializer = MovieDetailSerializer(movie)
        user_rating = None
        user_description = ""
        user_review = Review.objects.filter(user=request.user, movie=movie).first()
        if user_review:
            user_rating = user_review.rating
            user_description = user_review.description or ""

        return Response(
            {
                'success': True,
                'movie': serializer.data,
                'user_rating': user_rating,
                'user_description': user_description,
            },
            status=status.HTTP_200_OK
        )
    except Movie.DoesNotExist:
        return Response(
            {
                'success': False,
                'error': 'Movie not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {
                'success': False,
                'error': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

#Review endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_movie(request):
    """
    Create or update a movie review/rating
    Expected fields: movie_id, rating, description (optional)
    """
    try:
        movie_id = request.data.get('movie_id')
        rating = request.data.get('rating')
        description = request.data.get('description', '')

        # Validation
        if not movie_id or rating is None:
            return Response(
                {
                    'success': False,
                    'error': 'movie_id and rating are required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate rating is between 1 and 10
        try:
            rating = float(rating)
            if rating < 1 or rating > 10:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {
                    'success': False,
                    'error': 'Rating must be a number between 1 and 10'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if movie exists
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': 'Movie not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Get current user from JWT token
        user = PlataformaUser.objects.get(username=request.user.username)

        # Create or update review
        review, created = Review.objects.update_or_create(
            user=user,
            movie=movie,
            defaults={
                'rating': rating,
                'description': description,
                'created_at': timezone.now(),
            }
        )

        # Update movie's average rating and total_ratings
        all_reviews = Review.objects.filter(movie=movie)
        total_reviews = all_reviews.count()
        average_rating = sum(r.rating for r in all_reviews) / total_reviews if total_reviews > 0 else 0

        movie.rating = average_rating
        movie.total_ratings = total_reviews
        movie.save()

        return Response(
            {
                'success': True,
                'message': 'Review created' if created else 'Review updated',
                'review_id': review.id,
                'movie_average_rating': round(average_rating, 2),
                'movie_total_ratings': total_reviews
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    except PlataformaUser.DoesNotExist:
        return Response(
            {
                'success': False,
                'error': 'User not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {
                'success': False,
                'error': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_reviews(request, username):
    """
    Get all reviews by a specific user
    """
    try:
        user = PlataformaUser.objects.get(username=username)
        reviews = Review.objects.filter(user=user)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(
            {
                'success': True,
                'username': username,
                'count': reviews.count(),
                'reviews': serializer.data
            },
            status=status.HTTP_200_OK
        )
    except PlataformaUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
def update_user(request, username):
    if request.method == 'PUT' or request.method == 'POST':
        data = json.loads(request.body)
        new_email = data.get('email')
        new_password = data.get('password')
        
        try:
            user = PlataformaUser.objects.get(username=username)
        except PlataformaUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        if new_email:
            if PlataformaUser.objects.filter(email=new_email).exclude(username=username).exists():
                return JsonResponse({'error': 'Email already in use'}, status=409)
            user.email = new_email
        
        if new_password:
            user.password = make_password(new_password)
        
        user.save()
        return JsonResponse({'success': 'User updated'}, status=200)
    
    return JsonResponse({'error': 'Invalid request'}, status=405)

def popular_recommendations(request):

    days = int(request.GET.get('days', 30))
    limit = int(request.GET.get('limit', 20))
    

    date_threshold = datetime.now() - timedelta(days=days)
    
    # Filmes com avaliações recentes
    popular_movies = Movie.objects.filter(
        review__created_at__gte=date_threshold
    ).annotate(
        recent_rating=Avg('review__rating'),
        recent_count=Count('review')
    ).filter(
        recent_count__gte=5,  
        recent_rating__gte=4.0  
    ).order_by('-recent_rating', '-recent_count')[:limit]
    
    movies_data = [{
        'id': movie.id,
        'title': movie.title,
        'rating': float(movie.recent_rating),
        'total_ratings': movie.recent_count,
        'release_date': movie.release_date,
        'description': movie.description
    } for movie in popular_movies]
    
    return JsonResponse({'recommendations': movies_data}, status=200)
        
def for_you_recommendations(request):
    
    username = request.GET.get('username')
    limit = int(request.GET.get('limit', 20))
    
    if not username:
        return JsonResponse({'error': 'Username é obrigatório'}, status=400)
    
    try:
        user = PlataformaUser.objects.get(username=username)
    except PlataformaUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    liked_movies = Review.objects.filter(
        user=user,
        rating__gte=4.0
    ).values_list('movie_id', flat=True)
    
    if not liked_movies:
        return popular_recommendations(request)
    
    favorite_genre_ids = Movie.objects.filter(
        id__in=liked_movies
    ).values('genremovie__genre_id').annotate(
        count=Count('id')
    ).order_by('-count')[:3]
    
    genre_ids = [g['genremovie__genre_id'] for g in favorite_genre_ids if g['genremovie__genre_id']]
    
    if not genre_ids:
        return popular_recommendations(request)
    
    recommendations = Movie.objects.filter(
        genremovie__genre_id__in=genre_ids
    ).exclude(
        id__in=liked_movies
    ).filter(
        rating__gte=4.0
    ).distinct().order_by('-rating')[:limit]

    if recommendations.count() == 0:
        return popular_recommendations(request)
    
    movies_data = [{
        'id': movie.id,
        'title': movie.title,
        'rating': float(movie.rating),
        'total_ratings': movie.total_ratings,
        'release_date': movie.release_date,
        'description': movie.description
    } for movie in recommendations]
    
    return JsonResponse({'recommendations': movies_data}, status=200)

def collaborative_recommendations(request):
    
    username = request.GET.get('username')
    days = int(request.GET.get('days', 60))
    limit = int(request.GET.get('limit', 20))
    
    if not username:
        return JsonResponse({'error': 'Username é obrigatório'}, status=400)
    
    try:
        user = PlataformaUser.objects.get(username=username)
    except PlataformaUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    
    user_liked_reviews = Review.objects.filter(user=user, rating__gte=4.0)
    user_liked_movie_ids = list(user_liked_reviews.values_list('movie_id', flat=True))
    
    all_user_movie_ids = list(Review.objects.filter(user=user).values_list('movie_id', flat=True))
    
    if len(user_liked_movie_ids) < 3:
        return popular_recommendations(request)
    
    
    similar_users = PlataformaUser.objects.filter(
        review__movie_id__in=user_liked_movie_ids, 
        review__rating__gte=4.0                      
    ).exclude(
        username=username
    ).annotate(
        common_liked_movies=Count('review', distinct=True)
    ).filter(
        common_liked_movies__gte=3  
    ).order_by('-common_liked_movies')[:10]
    
   
    date_threshold = datetime.now() - timedelta(days=days)
    
    
    recommendations = Movie.objects.filter(
        review__user__in=similar_users,
        review__rating__gte=4.0,
        review__created_at__gte=date_threshold
    ).exclude(
        id__in=all_user_movie_ids  
    ).annotate(
        likers_count=Count('review', distinct=True)
    ).order_by('-likers_count', '-rating')[:limit]
    
    movies_data = [{
        'id': movie.id,
        'title': movie.title,
        'rating': float(movie.rating),
        'total_ratings': movie.total_ratings,
        'release_date': movie.release_date,
        'description': movie.description
    } for movie in recommendations]
    
    return JsonResponse({'recommendations': movies_data}, status=200)
