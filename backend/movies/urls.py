from django.urls import path
from .views import get_movie, register_user, login_user, rate_movie, get_user, update_user, popular_recommendations, for_you_recommendations, collaborative_recommendations

urlpatterns = [
    path("movie/<int:movie_id>/", get_movie),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('rate/', rate_movie, name='rate_movie'),
    path('user/<str:username>/', get_user, name='get_user'),
    path('user/<str:username>/update/', update_user, name='update_user'),
    path('recommendations/popular/', popular_recommendations, name='popular_recommendations'),
    path('recommendations/for-you/', for_you_recommendations, name='for_you_recommendations'),
    path('recommendations/collaborative/', collaborative_recommendations, name='collaborative_recommendations'),
]