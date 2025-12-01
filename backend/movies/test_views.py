from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from movies.models import PlataformaUser, Movie, Review, Genre, Director
from django.contrib.auth.hashers import make_password
from datetime import date


# ============================================================
# 🔐 AUTH ENDPOINTS
# ============================================================

class TestAuthViews(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register_user")
        self.login_url = reverse("token_obtain_pair")

        self.user = PlataformaUser.objects.create(
            username="john",
            password="123",
            email="john@mail.com",
        )

    def test_register_success(self):
        response = self.client.post(self.register_url, {
            "username": "newuser",
            "email": "new@mail.com",
            "password": "123",
            "password_confirm": "123"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_password_mismatch(self):
        response = self.client.post(self.register_url, {
            "username": "user2",
            "email": "u2@mail.com",
            "password": "123",
            "password_confirm": "222"
        })
        self.assertEqual(response.status_code, 400)

    def test_register_duplicate_username(self):
        response = self.client.post(self.register_url, {
            "username": "john",
            "email": "new@mail.com",
            "password": "123",
            "password_confirm": "123"
        })
        self.assertEqual(response.status_code, 400)

    def test_register_duplicate_email(self):
        response = self.client.post(self.register_url, {
            "username": "johnny",
            "email": "john@mail.com",
            "password": "123",
            "password_confirm": "123"
        })
        self.assertEqual(response.status_code, 400)

    def test_register_missing_fields(self):
        response = self.client.post(self.register_url, {})
        self.assertEqual(response.status_code, 400)

#    def test_login_with_username(self):
#        response = self.client.post(self.login_url, {
#            "identifier": "john",
#            "password": "123"
#        })
#        self.assertEqual(response.status_code, 200)
#        self.assertIn("access", response.data)

#    def test_login_with_email(self):
#        response = self.client.post(self.login_url, {
#            "identifier": "john@mail.com",
#            "password": "123"
#        })
#        self.assertEqual(response.status_code, 200)

    def test_login_wrong_password(self):
        response = self.client.post(self.login_url, {
            "identifier": "john",
            "password": "wrong"
        })
        self.assertEqual(response.status_code, 400)

    def test_login_user_not_found(self):
        response = self.client.post(self.login_url, {
            "identifier": "unknown",
            "password": "123"
        })
        self.assertEqual(response.status_code, 400)



# ============================================================
# 👤 USER ENDPOINTS
# ============================================================

class TestUserViews(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = PlataformaUser.objects.create(
            username="alice",
            password=make_password("123"),
            email="alice@mail.com"
        )
        self.other = PlataformaUser.objects.create(
            username="bob",
            password=make_password("123"),
            email="bob@mail.com"
        )
        # Login para obter token
        token_response = self.client.post(reverse("token_obtain_pair"), {
            "identifier": "alice",
            "password": "123"
        })

        self.assertEqual(token_response.status_code, 200)
        self.token = token_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_get_existing_user(self):
        url = reverse("get_user", kwargs={"username": "alice"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_get_nonexistent_user(self):
        url = reverse("get_user", kwargs={"username": "nope"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_get_user_unauthenticated(self):
        self.client.credentials()
        url = reverse("get_user", kwargs={"username": "alice"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_update_email(self):
        url = reverse("update_user", kwargs={"username": "alice"})
        response = self.client.put(url, {"email": "new@mail.com"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "new@mail.com")

    def test_update_password(self):
        url = reverse("update_user", kwargs={"username": "alice"})
        response = self.client.put(url, {
            "password": "newpass",
            "password_confirm": "newpass"
        })
        self.assertEqual(response.status_code, 200)

    def test_update_other_user_forbidden(self):
        url = reverse("update_user", kwargs={"username": "bob"})
        response = self.client.put(url, {"email": "hacked@mail.com"})
        self.assertEqual(response.status_code, 403)

    def test_update_password_mismatch(self):
        url = reverse("update_user", kwargs={"username": "alice"})
        resp = self.client.put(url, {
            "password": "abc",
            "password_confirm": "123"
        })
        self.assertEqual(resp.status_code, 400)

    def test_update_user_unauthenticated(self):
        self.client.credentials()
        url = reverse("update_user", kwargs={"username": "alice"})
        resp = self.client.put(url, {"email": "x@mail.com"})
        self.assertEqual(resp.status_code, 401)


# ============================================================
# 🎬 MOVIES ENDPOINTS
# ============================================================

class TestMovieViews(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = PlataformaUser.objects.create(
            username="ron",
            password=make_password("123"),
            email="ron@mail.com"
        )

        token_response = self.client.post(reverse("token_obtain_pair"), {
            "identifier": "ron",
            "password": "123"
        })

        self.assertEqual(token_response.status_code, 200)
        self.token = token_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")



        self.movie = Movie.objects.create(
            title="Matrix",
            description="Neo descobre a verdade.",
            release_date=date(1999, 3, 31),
            rating=5.0,
            total_ratings=1,
        )
        genre = Genre.objects.create(gerne_name="Sci-Fi")
        self.movie.genres.add(genre)

        director = Director.objects.create(name="Wachowski", biography="")
        self.movie.directors.add(director)

    def test_catalog_with_movies(self):
        url = reverse("movie-catalog")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertGreater(len(resp.data), 0)

    def test_catalog_empty(self):
        Movie.objects.all().delete()
        url = reverse("movie-catalog")
        resp = self.client.get(url)
        self.assertEqual(resp.data['count'], 0)
        self.assertEqual(len(resp.data['movies']), 0)
        self.assertFalse(resp.data['success'])

    def test_catalog_unauthenticated(self):
        self.client.credentials()
        resp = self.client.get(reverse("movie-catalog"))
        self.assertEqual(resp.status_code, 401)

    def test_movie_exists(self):
        url = reverse("get_movie_details", kwargs={"movie_id": self.movie.id})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

    def test_movie_not_found(self):
        url = reverse("get_movie_details", kwargs={"movie_id": 9999})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)

    def test_movie_unauthenticated(self):
        self.client.credentials()
        url = reverse("get_movie_details", kwargs={"movie_id": self.movie.id})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 401)

    def test_movie_with_user_review(self):
        Review.objects.create(
            user=self.user,
            movie=self.movie,
            rating=8,
            description="Muito bom!"
        )
        url = reverse("get_movie_details", kwargs={"movie_id": self.movie.id})
        resp = self.client.get(url)
        self.assertEqual(resp.data["user_rating"], 8)

    def test_movie_without_user_review(self):
        url = reverse("get_movie_details", kwargs={"movie_id": self.movie.id})
        resp = self.client.get(url)
        self.assertIsNone(resp.data["user_rating"])
        self.assertEqual(resp.data["user_description"], "")


