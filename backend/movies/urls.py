from django.urls import path
from .views import get_movie, register_user, login_user, rate_movie, get_user, update_user

urlpatterns = [
    path("movie/<int:movie_id>/", get_movie),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('rate/', rate_movie, name='rate_movie'),
    path('user/<str:username>/', get_user, name='get_user'),
    path('user/<str:username>/update/', update_user, name='update_user'),
]