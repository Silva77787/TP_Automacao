from django.shortcuts import render
import requests
import json
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import PlataformaUser
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