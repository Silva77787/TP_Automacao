from django.urls import path
from .views import get_movie

urlpatterns = [
    path("movie/<int:movie_id>/", get_movie),
]