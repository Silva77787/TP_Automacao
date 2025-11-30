import requests
from django.db import transaction
from .models import Movie, Genre, Director

TMDB_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMjA0OGJhNzQwYjUzNjMwNDZhYzQ5YmY0ZTI4NjYyNCIsIm5iZiI6MTc2MzEyNTU1My43NzQwMDAyLCJzdWIiOiI2OTE3MjkzMTcwMDQ4ZDgyZWM5YWRhZmQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qEuhCYzrRXlIbhjz2s9C1_jNw1cHwrFgGqMC0iLTwu8"
TMDB_HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_API_TOKEN}",
}
MAX_MOVIES_PER_GENRE = 100  

@transaction.atomic
def populate_database_if_empty():
    if Movie.objects.exists():
        return "Database already populated."

    # 1. Fetch genres
    genre_url = "https://api.themoviedb.org/3/genre/movie/list?language=en-US"
    response = requests.get(genre_url, headers=TMDB_HEADERS)
    response.raise_for_status()
    genres_data = response.json()["genres"]

    genre_map = {}
    for g in genres_data:
        genre_obj, _ = Genre.objects.get_or_create(
            id=g["id"],
            gerne_name=g["name"],
        )
        genre_map[g["id"]] = genre_obj

    # 2. For each genre: Fetch and store movies
    for genre_id, genre_obj in genre_map.items():
        movies_fetched = 0

        # 9 pages * 20 results 
        for page in range(1, 9):  
            movies_url = (
                "https://api.themoviedb.org/3/discover/movie"
                f"?sort_by=popularity.desc"
                f"&with_genres={genre_id}"
                f"&language=en-US"
                f"&page={page}"         
            )
            mv_response = requests.get(movies_url, headers=TMDB_HEADERS)
            mv_response.raise_for_status()
            movies = mv_response.json().get("results", [])

            for mv in movies:
                if movies_fetched >= MAX_MOVIES_PER_GENRE:
                    break

                title = mv.get("title") or mv.get("original_title") or ""
                overview = mv.get("overview", "")
                release_date = mv.get("release_date") or "1900-01-01"
                poster_path = mv.get("poster_path")

                m_obj, created = Movie.objects.get_or_create(
                    title=title,
                    release_date=release_date,
                    defaults={
                        "description": overview,
                        "rating": 0,
                        "total_ratings": 0,
                        "image": poster_path,
                    },
                )

                if not created:
                    m_obj.description = overview
                    if poster_path:
                        m_obj.image = poster_path
                    m_obj.save(update_fields=["description", "image"])

                m_obj.genres.add(genre_obj)

                credits_url = f"https://api.themoviedb.org/3/movie/{mv['id']}/credits?language=en-US"
                credits_resp = requests.get(credits_url, headers=TMDB_HEADERS)
                if credits_resp.ok:
                    crew = credits_resp.json().get("crew", [])
                    directors = [
                        d for d in crew
                        if d.get("job") == "Director" and d.get("department") == "Directing"
                    ]
                    for d in directors:
                        dir_obj, _ = Director.objects.get_or_create(
                            name=d.get("name", ""),
                            defaults={"biography": ""},
                        )
                        m_obj.directors.add(dir_obj)

                movies_fetched += 1

    return "Database populated."