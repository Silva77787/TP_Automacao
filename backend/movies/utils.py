import requests
from django.db import transaction
from .models import Movie, Genre, Director

TMDB_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMjA0OGJhNzQwYjUzNjMwNDZhYzQ5YmY0ZTI4NjYyNCIsIm5iZiI6MTc2MzEyNTU1My43NzQwMDAyLCJzdWIiOiI2OTE3MjkzMTcwMDQ4ZDgyZWM5YWRhZmQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qEuhCYzrRXlIbhjz2s9C1_jNw1cHwrFgGqMC0iLTwu8"


def populate_database_if_empty():
    if Movie.objects.exists():
        return "Database already populated."

    # 1. Fetch genres
    genre_url = "https://api.themoviedb.org/3/genre/movie/list?language=en"
    headers = {"accept": "application/json", "Authorization": f"Bearer {TMDB_API_TOKEN}"}
    response = requests.get(genre_url, headers=headers)
    genres_data = response.json()["genres"]

    # Store genres
    genre_map = {}
    for g in genres_data:
        genre_obj, _ = Genre.objects.get_or_create(id=g["id"], gerne_name=g["name"])
        genre_map[g["id"]] = genre_obj

    # 2. For each genre: Fetch and store movies
    for genre_id, genre_obj in genre_map.items():
        movies_fetched = 0
        for page in range(1, 3):  # Each page gives up to 20 movies; adjusted to get arround 50
            movies_url = (
                f"https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&with_genres={genre_id}&language=en-US&page={page}"
            )
            mv_response = requests.get(movies_url, headers=headers)
            movies = mv_response.json().get("results", [])
            for idx, mv in enumerate(movies):
                # Insert movie (with title)
                m_obj, created = Movie.objects.get_or_create(
                    title=mv.get("original_title", ""),
                    description=mv.get("overview", ""),
                    release_date=mv.get("release_date"),
                    rating=0,
                    total_ratings=0
                )
                m_obj.genres.add(genre_obj)

                # Fetch director(s) from crew
                credits_url = f"https://api.themoviedb.org/3/movie/{mv['id']}/credits?language=en-US"
                credits_resp = requests.get(credits_url, headers=headers)
                crew = credits_resp.json().get("crew", [])
                directors = [d for d in crew if d.get("job") == "Director" and d.get("department") == "Directing"]
                for d in directors:
                    dir_obj, _ = Director.objects.get_or_create(
                        name=d.get("name", ""),
                        biography=""
                    )
                    m_obj.directors.add(dir_obj)

                movies_fetched += 1
            if movies_fetched >= 50:
                break
    return "Database populated."