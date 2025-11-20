from django.shortcuts import render
import requests
import json
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import PlataformaUser, Movie, Review
# Create your views here.


def get_movie(request, movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"

    headers = {
        "Authorization": f"Bearer {settings.TMDB_READ_ACCESS_TOKEN}"
    }

    response = requests.get(url, headers=headers)

    return JsonResponse(response.json(), safe=False)


@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email    = data.get('email')

        if not username or not password or not email:
            return JsonResponse({'error': 'All fields are required'}, status=400)

        # Check if user or email already exists
        if PlataformaUser.objects.filter(username=username).exists() or PlataformaUser.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Username or email already exists'}, status=409)

        # Hash password with Django's built-in hasher
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
        identifier = data.get('identifier')  # username or email
        password = data.get('password')

        if not identifier or not password:
            return JsonResponse({'error': 'All fields are required'}, status=400)

        # Find user by username or email
        user = PlataformaUser.objects.filter(username=identifier).first()
        if user is None:
            user = PlataformaUser.objects.filter(email=identifier).first()

        # Security: Do not reveal if username/email does not exist
        if user is None:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        # Check password
        if check_password(password, user.password):
            # TODO: Generate JWT token here (for demo, return success)
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
        
        # Validation
        if not username or not movie_id or rating is None:
            return JsonResponse({'error': 'Username, movie_id, and rating are required'}, status=400)
        
        # Check if user exists
        try:
            user = PlataformaUser.objects.get(username=username)
        except PlataformaUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        # Check if movie exists
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return JsonResponse({'error': 'Movie not found'}, status=404)
        
        # Create or update review
        from .models import Review
        review, created = Review.objects.update_or_create(
            user=user,
            movie=movie,
            defaults={
                'rating': rating,
                'description': description
            }
        )

        # Update movie's average rating and total_ratings
        all_reviews = Review.objects.filter(movie=movie)
        total_reviews = all_reviews.count()
        average_rating = sum(r.rating for r in all_reviews) / total_reviews if total_reviews > 0 else 0

        movie.rating = average_rating
        movie.total_ratings = total_reviews
        movie.save()

        return JsonResponse({
            'success': 'Review created' if created else 'Review updated',
            'review_id': review.id,
            'movie_average_rating': average_rating,
            'movie_total_ratings': total_reviews
        }, status=201 if created else 200)
    
    return JsonResponse({'error': 'Invalid request'}, status=405)

def get_user(request, username):
    try:
        user = PlataformaUser.objects.get(username=username)
        return JsonResponse({
            'username': user.username,
            'email': user.email
        }, status=200)
    except PlataformaUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
def update_user(request, username):
    if request.method == 'PUT' or request.method == 'POST':
        data = json.loads(request.body)
        new_email = data.get('email')
        new_password = data.get('password')
        
        # Get user
        try:
            user = PlataformaUser.objects.get(username=username)
        except PlataformaUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        # Update email if provided
        if new_email:
            # Check if email already exists for another user
            if PlataformaUser.objects.filter(email=new_email).exclude(username=username).exists():
                return JsonResponse({'error': 'Email already in use'}, status=409)
            user.email = new_email
        
        # Update password if provided
        if new_password:
            user.password = make_password(new_password)
        
        user.save()
        return JsonResponse({'success': 'User updated'}, status=200)
    
    return JsonResponse({'error': 'Invalid request'}, status=405)
        