from django.shortcuts import render
import requests
from django.http import JsonResponse
from django.conf import settings
# Create your views here.


def get_movie(request, movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"

    headers = {
        "Authorization": f"Bearer {settings.TMDB_READ_ACCESS_TOKEN}"
    }

    response = requests.get(url, headers=headers)

    return JsonResponse(response.json(), safe=False)
