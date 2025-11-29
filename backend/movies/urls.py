from django.urls import path
from .views import (
    register_user, rate_movie, get_user, 
    update_user, movie_catalog, get_movie_details, get_user_reviews
)
from .authentication import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_user, name='register_user'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Movie endpoints
    path('movies/catalog/', movie_catalog, name='movie-catalog'),
    path('movie/<int:movie_id>/details/', get_movie_details, name='get_movie_details'),

    # User endpoints
    path('user/<str:username>/', get_user, name='get_user'),
    path('user/<str:username>/update/', update_user, name='update_user'),
    path('user/<str:username>/reviews/', get_user_reviews, name='get_user_reviews'),

    # Review endpoints
    path('movies/rate/', rate_movie, name='rate_movie'),
]