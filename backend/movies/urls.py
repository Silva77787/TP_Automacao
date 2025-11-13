from django.urls import path
from .views import get_movie, register_user, login_user

urlpatterns = [
    path("movie/<int:movie_id>/", get_movie),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
]