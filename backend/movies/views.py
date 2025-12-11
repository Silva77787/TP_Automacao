from django.shortcuts import render
import requests
import json
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import PlataformaUser, Movie, Review, Genre, Director
from .serializers import (
    MovieSerializer, UserRegistrationSerializer, UserDetailSerializer,
    UserUpdateSerializer, ReviewSerializer, MovieDetailSerializer
)
from .authentication import CustomTokenObtainPairView
from .permissions import IsOwnerOrReadOnly

# Authentication endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'username': serializer.data['username'],
            'email': serializer.data['email']
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(CustomTokenObtainPairView):
    """Login endpoint - returns access and refresh tokens"""
    permission_classes = [AllowAny]


@csrf_exempt
def login_user(request):
    """Legacy login endpoint"""
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


# User Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, username):
    """Get user details by username"""
    try:
        user = PlataformaUser.objects.get(username=username)
        serializer = UserDetailSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    except PlataformaUser.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def update_user(request, username):
    """Update user details - only the user themselves can update"""
    if request.user.username != username:
        return Response({
            'success': False,
            'error': 'You can only update your own profile'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        user = PlataformaUser.objects.get(username=username)
    except PlataformaUser.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'User updated successfully',
            'user': UserDetailSerializer(user).data
        }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# Movies endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def movie_catalog(request):
    """UC-03: Exibir Catálogo de Filmes"""
    try:
        movies = Movie.objects.all().prefetch_related('genres', 'directors')

        if not movies.exists():
            return Response({
                'success': False,
                'message': 'Catálogo vazio. Nenhum filme disponível.',
                'count': 0,
                'movies': []
            }, status=status.HTTP_200_OK)

        serializer = MovieSerializer(movies, many=True)
        return Response({
            'success': True,
            'message': 'Catálogo de filmes carregado com sucesso.',
            'count': movies.count(),
            'movies': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Erro ao conectar à base de dados: {str(e)}',
            'movies': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_movie_details(request, movie_id):
    """Get local movie details with reviews and current user's rating"""
    try:
        movie = Movie.objects.prefetch_related('genres', 'directors', 'review_set').get(id=movie_id)
        serializer = MovieDetailSerializer(movie)
        
        user_rating = None
        user_description = ""
        user_review = Review.objects.filter(user=request.user, movie=movie).first()
        if user_review:
            user_rating = user_review.rating
            user_description = user_review.description or ""

        return Response({
            'success': True,
            'movie': serializer.data,
            'user_rating': user_rating,
            'user_description': user_description,
        }, status=status.HTTP_200_OK)
    except Movie.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Movie not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Review endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_movie(request):
    """Create or update a movie review/rating"""
    try:
        movie_id = request.data.get('movie_id')
        rating = request.data.get('rating')
        description = request.data.get('description', '')

        if not movie_id or rating is None:
            return Response({
                'success': False,
                'error': 'movie_id and rating are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            rating = float(rating)
            if rating < 1 or rating > 10:
                raise ValueError
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'error': 'Rating must be a number between 1 and 10'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Movie not found'
            }, status=status.HTTP_404_NOT_FOUND)

        user = PlataformaUser.objects.get(username=request.user.username)

        review, created = Review.objects.update_or_create(
            user=user,
            movie=movie,
            defaults={
                'rating': rating,
                'description': description,
                'created_at': timezone.now(),
            }
        )

        all_reviews = Review.objects.filter(movie=movie)
        total_reviews = all_reviews.count()
        average_rating = sum(r.rating for r in all_reviews) / total_reviews if total_reviews > 0 else 0

        movie.rating = average_rating
        movie.total_ratings = total_reviews
        movie.save()

        return Response({
            'success': True,
            'message': 'Review created' if created else 'Review updated',
            'review_id': review.id,
            'movie_average_rating': round(average_rating, 2),
            'movie_total_ratings': total_reviews
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    except PlataformaUser.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_reviews(request, username):
    """Get all reviews by a specific user"""
    try:
        user = PlataformaUser.objects.get(username=username)
        reviews = Review.objects.filter(user=user)
        serializer = ReviewSerializer(reviews, many=True)
        return Response({
            'success': True,
            'username': username,
            'count': reviews.count(),
            'reviews': serializer.data
        }, status=status.HTTP_200_OK)
    except PlataformaUser.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

from datetime import datetime, timedelta
from django.db.models import Avg, Count

def _get_popular_movies(days: int = 30, limit: int = 20):
    """
    Devolve queryset de filmes populares recentes.
    Não devolve Response, só a query.
    """
    date_threshold = datetime.now() - timedelta(days=days)

    return Movie.objects.filter(
        review__created_at__gte=date_threshold
    ).annotate(
        recent_rating=Avg('review__rating'),
        recent_count=Count('review')
    ).filter(
        recent_count__gte=2,
        recent_rating__gte=4.0
    ).order_by('-recent_rating', '-recent_count')[:limit]


def _serialize_popular_movies(movies):
    """
    Converte filmes populares no formato da API.
    Usa os campos anotados recent_rating / recent_count se existirem.
    """
    movies_data = []
    for movie in movies:
        rating = getattr(movie, "recent_rating", None)
        if rating is None:
            rating = getattr(movie, "rating", 0)

        total_ratings = getattr(movie, "recent_count", None)
        if total_ratings is None:
            total_ratings = getattr(movie, "total_ratings", 0)

        movies_data.append({
            'id': movie.id,
            'title': movie.title,
            'rating': float(rating or 0),
            'total_ratings': total_ratings or 0,
            'release_date': str(movie.release_date),
            'description': movie.description,
        })
    return movies_data


# Recommendation endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def popular_recommendations(request):
    """Filmes populares recentes"""
    try:
        days = int(request.GET.get('days', 30))
        limit = int(request.GET.get('limit', 20))

        popular_movies = _get_popular_movies(days=days, limit=limit)
        movies_data = _serialize_popular_movies(popular_movies)

        return Response({
            'success': True,
            'message': 'Recomendações populares carregadas com sucesso',
            'count': len(movies_data),
            'recommendations': movies_data
        }, status=status.HTTP_200_OK)

    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid parameters: days and limit must be integers'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def for_you_recommendations(request):
    """Recomendações baseadas nos géneros favoritos do user"""
    try:
        username = request.GET.get('username')
        limit = int(request.GET.get('limit', 20))
        
        if not username:
            return Response({
                'success': False,
                'error': 'Username é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = PlataformaUser.objects.get(username=username)
        except PlataformaUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        liked_movies = Review.objects.filter(
            user=user,
            rating__gte=4.0
        ).values_list('movie_id', flat=True)
        
        # Se o user não tem filmes que gostou, retorna populares
        if not liked_movies:
            days = int(request.GET.get('days', 30))
            limit = int(request.GET.get('limit', 20))

            popular_movies = _get_popular_movies(days=days, limit=limit)
            movies_data = _serialize_popular_movies(popular_movies)

            return Response({
                'success': True,
                'message': 'Recomendações populares carregadas com sucesso',
                'count': len(movies_data),
                'recommendations': movies_data
            }, status=status.HTTP_200_OK)

        
        favorite_genre_ids = Movie.objects.filter(
            id__in=liked_movies
        ).values('genres__id').annotate(
            count=Count('id')
        ).order_by('-count')[:3]
        
        genre_ids = [g['genres__id'] for g in favorite_genre_ids if g['genres__id']]
        
        if not genre_ids:
            days = int(request.GET.get('days', 30))
            limit = int(request.GET.get('limit', 20))

            popular_movies = _get_popular_movies(days=days, limit=limit)
            movies_data = _serialize_popular_movies(popular_movies)

            return Response({
                'success': True,
                'message': 'Recomendações populares carregadas com sucesso',
                'count': len(movies_data),
                'recommendations': movies_data
            }, status=status.HTTP_200_OK)
        
        recommendations = Movie.objects.filter(
            genres__id__in=genre_ids
        ).exclude(
            id__in=liked_movies
        ).filter(
            rating__gte=4.0
        ).distinct().order_by('-rating')[:limit]

        if recommendations.count() == 0:
            days = int(request.GET.get('days', 30))
            limit = int(request.GET.get('limit', 20))

            popular_movies = _get_popular_movies(days=days, limit=limit)
            movies_data = _serialize_popular_movies(popular_movies)

            return Response({
                'success': True,
                'message': 'Recomendações populares carregadas com sucesso',
                'count': len(movies_data),
                'recommendations': movies_data
            }, status=status.HTTP_200_OK)
        
        movies_data = _serialize_popular_movies(recommendations)
        
        return Response({
            'success': True,
            'message': 'Recomendações personalizadas carregadas com sucesso',
            'count': len(movies_data),
            'recommendations': movies_data
        }, status=status.HTTP_200_OK)
    
    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid parameters: limit must be an integer'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def collaborative_recommendations(request):
    """Recomendações baseadas em users com gostos similares"""
    try:
        username = request.GET.get('username')
        days = int(request.GET.get('days', 60))
        limit = int(request.GET.get('limit', 20))
        
        if not username:
            return Response({
                'success': False,
                'error': 'Username é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = PlataformaUser.objects.get(username=username)
        except PlataformaUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user_liked_reviews = Review.objects.filter(user=user, rating__gte=4.0)
        user_liked_movie_ids = list(user_liked_reviews.values_list('movie_id', flat=True))
        
        all_user_movie_ids = list(Review.objects.filter(user=user).values_list('movie_id', flat=True))
        
        # Se o user não tem suficientes ratings, retorna populares
        if len(user_liked_movie_ids) < 3:
            days = int(request.GET.get('days', 60))   # aqui usas 60 por default, como já tinhas
            limit = int(request.GET.get('limit', 20))

            popular_movies = _get_popular_movies(days=days, limit=limit)
            movies_data = _serialize_popular_movies(popular_movies)

            return Response({
                'success': True,
                'message': 'Recomendações populares carregadas com sucesso',
                'count': len(movies_data),
                'recommendations': movies_data
            }, status=status.HTTP_200_OK)
        
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
        
        if recommendations.count() == 0:
            days = int(request.GET.get('days', 30))
            limit = int(request.GET.get('limit', 20))

            popular_movies = _get_popular_movies(days=days, limit=limit)
            movies_data = _serialize_popular_movies(popular_movies)

            return Response({
                'success': True,
                'message': 'Recomendações populares carregadas com sucesso',
                'count': len(movies_data),
                'recommendations': movies_data
            }, status=status.HTTP_200_OK)
            
        movies_data = _serialize_popular_movies(recommendations)
        
        return Response({
            'success': True,
            'message': 'Recomendações colaborativas carregadas com sucesso',
            'count': len(movies_data),
            'recommendations': movies_data
        }, status=status.HTTP_200_OK)
    
    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid parameters: days and limit must be integers'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)